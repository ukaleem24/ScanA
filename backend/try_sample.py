"""Runs the sample letter through the configured provider and prints the result or the reason.

Usage (from backend/, with the venv active and a key set):
    python try_sample.py [path-to-image-or-pdf] [language]
"""
import logging
import sys
from pathlib import Path

from fastapi import HTTPException

from app.analyzer import analyze_letter
from app.config import provider
from app.documents import prepare_documents

logging.basicConfig(level=logging.WARNING, format="%(levelname)s:%(name)s:%(message)s")

path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent.parent / "samples" / "sample-mahnung.png"
language = sys.argv[2] if len(sys.argv) > 2 else "en"

print(f"provider: {provider()}  file: {path.name}  language: {language}")
try:
    result = analyze_letter(prepare_documents([path.read_bytes()]), language, False)
except HTTPException as exc:
    print(f"FAILED: {exc.status_code} {exc.detail}  (reason is in the WARNING line above, if any)")
    sys.exit(1)
print(result.model_dump_json(indent=2))
