import logging
from types import SimpleNamespace

import anthropic
import httpx

from tests.conftest import image_bytes, make_analysis, pdf_bytes


def post(client, files, **data):
    return client.post("/api/analyze", files=files, data=data)


def one_image():
    return [("files", ("page1.png", image_bytes(size=(300, 200)), "image/png"))]


def test_success_returns_schema_and_hides_translation_by_default(client, fake_claude):
    r = post(client, one_image(), language="de")
    assert r.status_code == 200
    body = r.json()
    assert body["sender"] == "Stadtwerke Beispielstadt"
    assert body["urgency"] == {"level": "high", "reason": "Payment is overdue and a fee is threatened."}
    assert body["full_translation"] is None
    call = fake_claude.calls[0]
    assert call["model"] == "claude-opus-5-5"
    assert "German" in call["messages"][0]["content"][-1]["text"]
    assert call["messages"][0]["content"][0]["type"] == "image"


def test_full_translation_when_requested(client, fake_claude):
    r = post(client, one_image(), language="tr", full_translation="true")
    assert r.json()["full_translation"] == "FULL TEXT"
    assert "Turkish" in fake_claude.calls[0]["messages"][0]["content"][-1]["text"]


def test_pdf_sent_as_document_block(client, fake_claude):
    r = post(client, [("files", ("l.pdf", pdf_bytes(2), "application/pdf"))])
    assert r.status_code == 200
    assert fake_claude.calls[0]["messages"][0]["content"][0]["type"] == "document"


def test_multiple_pages_keep_order(client, fake_claude):
    files = [("files", (f"p{i}.png", image_bytes(size=(50 + i, 50)), "image/png")) for i in range(3)]
    assert post(client, files).status_code == 200
    blocks = fake_claude.calls[0]["messages"][0]["content"]
    assert [b["type"] for b in blocks] == ["image", "image", "image", "text"]


def test_unknown_language_rejected(client, fake_claude):
    r = post(client, one_image(), language="xx")
    assert r.status_code == 400 and r.json() == {"detail": "unsupported_language"}
    assert fake_claude.calls == []


def test_missing_files_rejected(client, fake_claude):
    assert client.post("/api/analyze", data={"language": "en"}).status_code == 422


def test_too_many_pages_rejected_before_claude(client, fake_claude):
    files = [("files", (f"p{i}.png", image_bytes(size=(20, 20)), "image/png")) for i in range(11)]
    r = post(client, files)
    assert r.status_code == 413 and r.json() == {"detail": "too_many_pages"}
    assert fake_claude.calls == []


def test_refusal_gives_generic_error(client, fake_claude):
    fake_claude.response = SimpleNamespace(stop_reason="refusal", parsed_output=None)
    r = post(client, one_image())
    assert r.status_code == 502 and r.json() == {"detail": "analysis_failed"}


def test_truncated_output_gives_generic_error(client, fake_claude):
    fake_claude.response = SimpleNamespace(stop_reason="max_tokens", parsed_output=make_analysis())
    assert post(client, one_image()).json() == {"detail": "analysis_failed"}


def test_invalid_model_output_gives_generic_error(client, fake_claude):
    fake_claude.error = ValueError("SECRET LETTER TEXT failed validation")
    r = post(client, one_image())
    assert r.status_code == 502 and "SECRET" not in r.text


def test_rate_limit_maps_to_busy(client, fake_claude):
    req = httpx.Request("POST", "https://api.anthropic.com/v1/messages")
    fake_claude.error = anthropic.RateLimitError(
        "slow down", response=httpx.Response(429, request=req), body=None
    )
    r = post(client, one_image())
    assert r.status_code == 503 and r.json() == {"detail": "busy"}


def test_letter_content_never_logged(client, fake_claude, caplog):
    fake_claude.error = ValueError("SECRET LETTER TEXT")
    with caplog.at_level(logging.DEBUG):
        post(client, one_image())
    assert "SECRET" not in caplog.text


def test_health(client, monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "claude")
    assert client.get("/api/health").json() == {"status": "ok", "provider": "claude"}


def test_missing_api_key_gives_clear_error(client, monkeypatch):
    from app import claude_client

    monkeypatch.setattr(claude_client, "_client", None)
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    monkeypatch.delenv("ANTHROPIC_AUTH_TOKEN", raising=False)
    r = post(client, one_image())
    assert r.status_code == 500 and r.json() == {"detail": "not_configured"}
