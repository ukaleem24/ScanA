import json

import httpx
import pytest
from fastapi import HTTPException

from app import analyzer, gemini_client
from app.config import provider
from app.documents import PreparedDocument
from tests.conftest import make_analysis

DOCS = [PreparedDocument("image", "image/jpeg", "QUJD")]


def ok_response(analysis=None, finish="STOP"):
    text = (analysis or make_analysis()).model_dump_json()
    body = {"candidates": [{"finishReason": finish, "content": {"parts": [{"text": text}]}}]}
    return httpx.Response(200, json=body)


@pytest.fixture
def gemini(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(gemini_client.time, "sleep", lambda s: None)
    calls = []
    state = {"response": ok_response()}

    def fake_post(url, headers, body):
        calls.append((url, headers, body))
        r = state["response"]
        if isinstance(r, Exception):
            raise r
        return r

    monkeypatch.setattr(gemini_client, "_post", fake_post)
    return calls, state


def code(exc_info):
    return exc_info.value.detail


def test_success_and_request_shape(gemini):
    calls, _ = gemini
    result = gemini_client.analyze_letter(DOCS, "fr", False)
    assert result.sender == "Stadtwerke Beispielstadt" and result.full_translation is None
    url, headers, body = calls[0]
    assert "gemini-3.5-flash:generateContent" in url
    assert headers == {"x-goog-api-key": "test-key"}  # key in header, never in URL
    assert "test-key" not in url
    parts = body["contents"][0]["parts"]
    assert parts[0]["inline_data"] == {"mime_type": "image/jpeg", "data": "QUJD"}
    assert "French" in parts[-1]["text"]
    assert body["generationConfig"]["responseMimeType"] == "application/json"


def test_full_translation_kept_when_requested(gemini):
    assert gemini_client.analyze_letter(DOCS, "en", True).full_translation == "FULL TEXT"


def test_missing_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    with pytest.raises(HTTPException) as e:
        gemini_client.analyze_letter(DOCS, "en", False)
    assert code(e) == "not_configured"


@pytest.mark.parametrize(
    "response,expected",
    [
        (httpx.Response(429, json={}), "busy"),
        (httpx.Response(500, json={"error": "SECRET"}), "analysis_failed"),
        (httpx.Response(200, json={"candidates": []}), "analysis_failed"),
        (httpx.Response(200, json={"promptFeedback": {"blockReason": "SAFETY"}}), "analysis_failed"),
        (httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": "not json"}]}}]}), "analysis_failed"),
        (ok_response(finish="MAX_TOKENS"), "analysis_failed"),
        (httpx.ConnectError("boom"), "analysis_failed"),
    ],
)
def test_failures_map_to_generic_codes(gemini, response, expected):
    _, state = gemini
    state["response"] = response
    with pytest.raises(HTTPException) as e:
        gemini_client.analyze_letter(DOCS, "en", False)
    assert code(e) == expected


def test_schema_sent_is_valid_json(gemini):
    calls, _ = gemini
    gemini_client.analyze_letter(DOCS, "en", False)
    schema = calls[0][2]["generationConfig"]["responseJsonSchema"]
    json.dumps(schema)
    assert "urgency" in schema["properties"]


def test_provider_selection(monkeypatch):
    for var in ("LLM_PROVIDER", "GEMINI_API_KEY", "ANTHROPIC_API_KEY"):
        monkeypatch.delenv(var, raising=False)
    assert provider() == "claude"
    monkeypatch.setenv("GEMINI_API_KEY", "x")
    assert provider() == "gemini"
    monkeypatch.setenv("ANTHROPIC_API_KEY", "y")
    assert provider() == "claude"
    monkeypatch.setenv("LLM_PROVIDER", "gemini")
    assert provider() == "gemini"


def test_analyzer_dispatches(monkeypatch, gemini):
    monkeypatch.setenv("LLM_PROVIDER", "gemini")
    assert analyzer.analyze_letter(DOCS, "en", False).sender == "Stadtwerke Beispielstadt"


def test_retries_on_503_then_succeeds(monkeypatch, gemini):
    calls, state = gemini
    responses = [httpx.Response(503, json={}), ok_response()]
    monkeypatch.setattr(gemini_client, "_post", lambda *a: (calls.append(a), responses.pop(0))[1])
    assert gemini_client.analyze_letter(DOCS, "en", False).sender == "Stadtwerke Beispielstadt"
    assert len(calls) == 2


def test_persistent_503_gives_busy(gemini):
    calls, state = gemini
    state["response"] = httpx.Response(503, json={})
    with pytest.raises(HTTPException) as e:
        gemini_client.analyze_letter(DOCS, "en", False)
    assert code(e) == "busy" and len(calls) == 3
