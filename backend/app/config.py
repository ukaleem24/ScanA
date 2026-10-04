"""Runtime configuration. Secrets come from the environment only."""
import os

MAX_PAGES = 10
MAX_TOTAL_BYTES = 10 * 1024 * 1024
MAX_IMAGE_EDGE = 1568
JPEG_QUALITY = 85

LANGUAGES = {
    "en": "English",
    "de": "German",
    "ar": "Arabic",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "ru": "Russian",
    "fa": "Persian (Farsi)",
    "es": "Spanish",
    "fr": "French",
}


def claude_model() -> str:
    return os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")


def gemini_model() -> str:
    return os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")


def provider() -> str:
    """LLM_PROVIDER=claude|gemini. If unset: gemini when only a Gemini key is present, else claude."""
    explicit = os.environ.get("LLM_PROVIDER", "").lower()
    if explicit in ("claude", "gemini"):
        return explicit
    if os.environ.get("GEMINI_API_KEY") and not os.environ.get("ANTHROPIC_API_KEY"):
        return "gemini"
    return "claude"
