import base64
import io

import pytest
from fastapi import HTTPException
from PIL import Image

from app.config import MAX_IMAGE_EDGE, MAX_TOTAL_BYTES
from app.documents import prepare_documents
from tests.conftest import image_bytes, pdf_bytes


def code(exc_info) -> str:
    return exc_info.value.detail


def test_image_is_resized_and_converted_to_jpeg():
    [doc] = prepare_documents([image_bytes("PNG", size=(4000, 3000))])
    assert doc.kind == "image" and doc.media_type == "image/jpeg"
    img = Image.open(io.BytesIO(base64.b64decode(doc.data_b64)))
    assert img.format == "JPEG"
    assert max(img.size) == MAX_IMAGE_EDGE


def test_small_image_is_not_upscaled():
    [doc] = prepare_documents([image_bytes("JPEG", size=(400, 300))])
    img = Image.open(io.BytesIO(base64.b64decode(doc.data_b64)))
    assert img.size == (400, 300)


def test_exif_orientation_applied_and_metadata_stripped():
    src = Image.new("RGB", (200, 100), "white")
    exif = Image.Exif()
    exif[0x0112] = 6  # rotate 90 degrees
    exif[0x010F] = "SecretCamera"
    buf = io.BytesIO()
    src.save(buf, format="JPEG", exif=exif)
    [doc] = prepare_documents([buf.getvalue()])
    out = Image.open(io.BytesIO(base64.b64decode(doc.data_b64)))
    assert out.size == (100, 200)
    assert not out.getexif()


def test_pdf_passes_through():
    raw = pdf_bytes(3)
    [doc] = prepare_documents([raw])
    assert doc.kind == "pdf" and doc.media_type == "application/pdf"
    assert base64.b64decode(doc.data_b64) == raw


def test_pdf_over_page_limit_rejected():
    with pytest.raises(HTTPException) as e:
        prepare_documents([pdf_bytes(11)])
    assert code(e) == "too_many_pages"


def test_more_than_ten_images_rejected():
    with pytest.raises(HTTPException) as e:
        prepare_documents([image_bytes(size=(10, 10))] * 11)
    assert code(e) == "too_many_pages"


def test_ten_images_accepted():
    assert len(prepare_documents([image_bytes(size=(10, 10))] * 10)) == 10


def test_pdf_mixed_with_images_rejected():
    with pytest.raises(HTTPException) as e:
        prepare_documents([pdf_bytes(1), image_bytes(size=(10, 10))])
    assert code(e) == "pdf_must_be_single_file"


def test_total_size_limit():
    with pytest.raises(HTTPException) as e:
        prepare_documents([b"x" * (MAX_TOTAL_BYTES + 1)])
    assert code(e) == "file_too_large"


@pytest.mark.parametrize("raw", [b"hello world", b"GIF89a....", image_bytes("BMP", size=(10, 10))])
def test_unsupported_types_rejected(raw):
    with pytest.raises(HTTPException) as e:
        prepare_documents([raw])
    assert code(e) == "unsupported_type"


def test_corrupt_pdf_rejected():
    with pytest.raises(HTTPException) as e:
        prepare_documents([b"%PDF-1.4 not really a pdf"])
    assert code(e) == "unsupported_type"


def test_no_files_rejected():
    with pytest.raises(HTTPException) as e:
        prepare_documents([])
    assert code(e) == "no_files"
