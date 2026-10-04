import io
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from PIL import Image

from app import claude_client, ratelimit
from app.main import app
from app.schemas import LetterAnalysis


def make_analysis(**overrides) -> LetterAnalysis:
    data = {
        "sender": "Stadtwerke Beispielstadt",
        "letter_type": "Mahnung",
        "date_of_letter": "2026-03-01",
        "reference_numbers": ["KD-12345"],
        "summary": "A reminder to pay an overdue bill.",
        "urgency": {"level": "high", "reason": "Payment is overdue and a fee is threatened."},
        "deadlines": [{"date": "2026-03-15", "what_happens": "Additional fees apply."}],
        "amounts": [{"value_eur": 123.45, "purpose": "Electricity bill", "due_date": "2026-03-15"}],
        "actions_required": ["Pay 123.45 EUR."],
        "key_terms": [{"term": "Mahnung", "explanation": "A payment reminder."}],
        "full_translation": "FULL TEXT",
        "confidence_notes": [],
    }
    data.update(overrides)
    return LetterAnalysis(**data)


class FakeMessages:
    def __init__(self):
        self.calls: list[dict] = []
        self.response = SimpleNamespace(stop_reason="end_turn", parsed_output=make_analysis())
        self.error: Exception | None = None

    def parse(self, **kwargs):
        self.calls.append(kwargs)
        if self.error:
            raise self.error
        return self.response


@pytest.fixture(autouse=True)
def no_rate_limit_by_default(monkeypatch):
    """Most tests make many requests from one client; the limit has its own tests."""
    monkeypatch.setenv("RATE_LIMIT_PER_HOUR", "0")
    monkeypatch.delenv("TRUST_PROXY", raising=False)
    ratelimit.limiter.clear()
    yield
    ratelimit.limiter.clear()


@pytest.fixture
def fake_claude(monkeypatch):
    fake = SimpleNamespace(messages=FakeMessages())
    monkeypatch.setattr(claude_client, "_client", fake)
    return fake.messages


@pytest.fixture
def client():
    return TestClient(app)


def image_bytes(fmt="PNG", size=(3000, 2000), color="white") -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, color).save(buf, format=fmt)
    return buf.getvalue()


def pdf_bytes(pages=1) -> bytes:
    from pypdf import PdfWriter

    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=200, height=200)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()
