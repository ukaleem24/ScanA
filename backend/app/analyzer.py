"""Chooses the model provider. Claude is the production default; Gemini is a free dev option."""
from . import claude_client, gemini_client
from .config import provider
from .documents import PreparedDocument
from .schemas import LetterAnalysis


def analyze_letter(docs: list[PreparedDocument], language: str, full_translation: bool) -> LetterAnalysis:
    module = gemini_client if provider() == "gemini" else claude_client
    return module.analyze_letter(docs, language, full_translation)
