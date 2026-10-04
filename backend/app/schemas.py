"""Domain schema for the analysis result. Dates are ISO YYYY-MM-DD or null."""
from typing import Literal, Optional

from pydantic import BaseModel, Field


class Urgency(BaseModel):
    level: Literal["low", "medium", "high"]
    reason: str


class Deadline(BaseModel):
    date: Optional[str] = Field(None, description="ISO date YYYY-MM-DD, null if unclear")
    what_happens: str


class Amount(BaseModel):
    value_eur: float
    purpose: str
    due_date: Optional[str] = Field(None, description="ISO date YYYY-MM-DD, null if none")


class KeyTerm(BaseModel):
    term: str = Field(description="The German term exactly as in the letter")
    explanation: str


class LetterAnalysis(BaseModel):
    sender: str
    letter_type: str
    date_of_letter: Optional[str] = Field(None, description="ISO date YYYY-MM-DD, null if unclear")
    reference_numbers: list[str]
    summary: str = Field(description="3-5 plain-language sentences")
    urgency: Urgency
    deadlines: list[Deadline]
    amounts: list[Amount]
    actions_required: list[str]
    key_terms: list[KeyTerm]
    full_translation: Optional[str] = None
    confidence_notes: list[str] = Field(
        description="Anything unreadable, cut off or uncertain; empty if all clear"
    )
