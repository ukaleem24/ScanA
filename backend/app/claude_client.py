"""The only module that talks to the Anthropic API."""
from typing import Optional

import anthropic

from .config import claude_model
from .documents import PreparedDocument
from .errors import api_error
from .prompts import SYSTEM_PROMPT, user_instruction
from .schemas import LetterAnalysis

_client: Optional[anthropic.Anthropic] = None


def get_client() -> anthropic.Anthropic:
    """Created lazily so the API key is read from the environment at first use."""
    global _client
    if _client is None:
        _client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY
    return _client


def _content_blocks(docs: list[PreparedDocument], instruction: str) -> list[dict]:
    blocks: list[dict] = []
    for doc in docs:
        kind = "document" if doc.kind == "pdf" else "image"
        blocks.append(
            {"type": kind, "source": {"type": "base64", "media_type": doc.media_type, "data": doc.data_b64}}
        )
    blocks.append({"type": "text", "text": instruction})
    return blocks


def analyze_letter(docs: list[PreparedDocument], language: str, full_translation: bool) -> LetterAnalysis:
    content = _content_blocks(docs, user_instruction(language, full_translation))
    try:
        response = get_client().messages.parse(
            model=claude_model(),
            max_tokens=16000,
            system=SYSTEM_PROMPT,
            output_config={"effort": "medium"},
            messages=[{"role": "user", "content": content}],
            output_format=LetterAnalysis,
        )
    except TypeError:  # SDK raises this at request time when no API key/credentials are found
        raise api_error(500, "not_configured") from None
    except anthropic.RateLimitError:
        raise api_error(503, "busy") from None
    except (anthropic.APIStatusError, anthropic.APIConnectionError, ValueError):
        # ValueError covers schema-validation failure of the model output.
        raise api_error(502, "analysis_failed") from None

    if response.stop_reason in ("refusal", "max_tokens") or response.parsed_output is None:
        raise api_error(502, "analysis_failed")
    result = response.parsed_output
    if not full_translation:
        result.full_translation = None
    return result
