import logging

from fastapi import Depends, FastAPI, File, Form, UploadFile
from fastapi.concurrency import run_in_threadpool

from .analyzer import analyze_letter
from .config import LANGUAGES, MAX_TOTAL_BYTES, provider
from .documents import prepare_documents
from .errors import api_error
from .ratelimit import enforce_rate_limit
from .schemas import LetterAnalysis

logging.basicConfig(level=logging.WARNING, format="%(levelname)s:%(name)s:%(message)s")
# Request bodies and results are never logged; keep access logs quiet too.
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

app = FastAPI(title="BriefScanner", docs_url=None, redoc_url=None)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "provider": provider()}


@app.post("/api/analyze", response_model=LetterAnalysis, dependencies=[Depends(enforce_rate_limit)])
async def analyze(
    files: list[UploadFile] = File(...),
    language: str = Form("en"),
    full_translation: bool = Form(False),
) -> LetterAnalysis:
    if language not in LANGUAGES:
        raise api_error(400, "unsupported_language")
    raw: list[bytes] = []
    total = 0
    for f in files:
        chunk = await f.read(MAX_TOTAL_BYTES + 1 - total)
        total += len(chunk)
        if total > MAX_TOTAL_BYTES:
            raise api_error(413, "file_too_large")
        raw.append(chunk)
    docs = prepare_documents(raw)
    return await run_in_threadpool(analyze_letter, docs, language, full_translation)
