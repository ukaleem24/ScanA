"""Gemini adapter (free-tier development option). Talks to the REST API with httpx.

PRIVACY: on Google's free tier, inputs may be used to improve Google products. Use only with
non-sensitive sample letters, never with real personal documents.
"""
import logging
import os
import time

import httpx
from pydantic import ValidationError

from .config import gemini_model
from .documents import PreparedDocument
from .errors import api_error
from .prompts import SYSTEM_PROMPT, user_instruction
from .schemas import LetterAnalysis

log = logging.getLogger("briefscanner.gemini")

_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


RETRY_DELAYS = (2, 5)  # seconds before each retry on a temporary 503


def _post(url: str, headers: dict, body: dict) -> httpx.Response:
    return httpx.post(url, headers=headers, json=body, timeout=120)


def _api_error_text(resp: httpx.Response) -> str:
    """Google's error object describes the request, not our content; still truncated."""
    try:
        err = resp.json()["error"]
        return f"{err.get('status')}: {err.get('message')}"[:300]
    except (ValueError, KeyError, TypeError, AttributeError):
        return "unparseable error body"


def _block_reason(resp: httpx.Response):
    try:
        return resp.json().get("promptFeedback", {}).get("blockReason")
    except (ValueError, AttributeError):
        return None


def analyze_letter(docs: list[PreparedDocument], language: str, full_translation: bool) -> LetterAnalysis:
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        raise api_error(500, "not_configured")

    parts: list[dict] = [
        {"inline_data": {"mime_type": d.media_type, "data": d.data_b64}} for d in docs
    ]
    parts.append({"text": user_instruction(language, full_translation)})
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseJsonSchema": LetterAnalysis.model_json_schema(),
        },
    }
    url = _URL.format(model=gemini_model())
    for attempt in range(len(RETRY_DELAYS) + 1):
        try:
            resp = _post(url, {"x-goog-api-key": key}, body)
        except httpx.HTTPError as exc:
            log.warning("request failed: %s", type(exc).__name__)
            raise api_error(502, "analysis_failed") from None
        if resp.status_code != 503 or attempt == len(RETRY_DELAYS):
            break
        log.warning("model overloaded (503), retrying")
        time.sleep(RETRY_DELAYS[attempt])
    if resp.status_code in (429, 503):
        log.warning("busy (HTTP %s)", resp.status_code)
        raise api_error(503, "busy")
    if resp.status_code != 200:
        log.warning("HTTP %s: %s", resp.status_code, _api_error_text(resp))
        raise api_error(502, "analysis_failed")

    try:
        data = resp.json()
        candidate = data["candidates"][0]
        if candidate.get("finishReason") not in (None, "STOP"):
            log.warning("finishReason=%s", candidate.get("finishReason"))
            raise api_error(502, "analysis_failed")
        text = "".join(p.get("text", "") for p in candidate["content"]["parts"])
        result = LetterAnalysis.model_validate_json(text)
    except (KeyError, IndexError, TypeError, ValueError, ValidationError) as exc:
        # Type only: validation messages could quote letter content.
        log.warning("unusable response: %s (blockReason=%s)", type(exc).__name__, _block_reason(resp))
        raise api_error(502, "analysis_failed") from None
    if not full_translation:
        result.full_translation = None
    return result
