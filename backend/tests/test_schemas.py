import pytest
from pydantic import ValidationError

from app.schemas import LetterAnalysis
from tests.conftest import make_analysis


def test_roundtrip():
    a = make_analysis()
    assert LetterAnalysis.model_validate(a.model_dump()) == a


def test_invalid_urgency_rejected():
    with pytest.raises(ValidationError):
        make_analysis(urgency={"level": "extreme", "reason": "x"})


def test_optional_fields_default():
    a = make_analysis(date_of_letter=None, full_translation=None)
    assert a.date_of_letter is None and a.full_translation is None


def test_missing_required_field_rejected():
    data = make_analysis().model_dump()
    del data["summary"]
    with pytest.raises(ValidationError):
        LetterAnalysis.model_validate(data)
