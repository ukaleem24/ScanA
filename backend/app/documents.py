"""Upload validation and preparation. Everything stays in memory."""
import base64
import io
from dataclasses import dataclass
from typing import Literal

from PIL import Image, ImageOps, UnidentifiedImageError
from pypdf import PdfReader
from pypdf.errors import PyPdfError

from .config import JPEG_QUALITY, MAX_IMAGE_EDGE, MAX_PAGES, MAX_TOTAL_BYTES
from .errors import api_error

Image.MAX_IMAGE_PIXELS = 100_000_000  # decompression-bomb guard


@dataclass
class PreparedDocument:
    kind: Literal["image", "pdf"]
    media_type: str
    data_b64: str


def _is_pdf(raw: bytes) -> bool:
    return raw[:5] == b"%PDF-"


def _prepare_image(raw: bytes) -> PreparedDocument:
    try:
        with Image.open(io.BytesIO(raw)) as img:
            if img.format not in ("JPEG", "PNG", "WEBP"):
                raise api_error(415, "unsupported_type")
            img = ImageOps.exif_transpose(img)  # apply orientation; metadata is dropped on save
            img = img.convert("RGB")
            img.thumbnail((MAX_IMAGE_EDGE, MAX_IMAGE_EDGE), Image.Resampling.LANCZOS)
            out = io.BytesIO()
            img.save(out, format="JPEG", quality=JPEG_QUALITY, optimize=True)
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise api_error(415, "unsupported_type") from None
    data = base64.standard_b64encode(out.getvalue()).decode()
    return PreparedDocument("image", "image/jpeg", data)


def _prepare_pdf(raw: bytes) -> PreparedDocument:
    try:
        pages = len(PdfReader(io.BytesIO(raw)).pages)
    except (PyPdfError, ValueError, OSError):
        raise api_error(415, "unsupported_type") from None
    if pages > MAX_PAGES:
        raise api_error(413, "too_many_pages")
    if pages == 0:
        raise api_error(415, "unsupported_type")
    return PreparedDocument("pdf", "application/pdf", base64.standard_b64encode(raw).decode())


def prepare_documents(raw_files: list[bytes]) -> list[PreparedDocument]:
    """Validate limits and convert uploads. Either one PDF or 1-10 images."""
    if not raw_files:
        raise api_error(400, "no_files")
    if sum(len(r) for r in raw_files) > MAX_TOTAL_BYTES:
        raise api_error(413, "file_too_large")
    if any(_is_pdf(r) for r in raw_files):
        if len(raw_files) != 1:
            raise api_error(400, "pdf_must_be_single_file")
        return [_prepare_pdf(raw_files[0])]
    if len(raw_files) > MAX_PAGES:
        raise api_error(413, "too_many_pages")
    return [_prepare_image(r) for r in raw_files]
