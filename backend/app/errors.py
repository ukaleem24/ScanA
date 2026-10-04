"""Generic API errors. Details are stable codes and never contain letter content."""
from fastapi import HTTPException


def api_error(status: int, code: str) -> HTTPException:
    return HTTPException(status_code=status, detail=code)
