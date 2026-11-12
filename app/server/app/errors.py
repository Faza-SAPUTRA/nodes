"""Format error seragam untuk seluruh API."""
from __future__ import annotations

from typing import Any

from fastapi import HTTPException


def api_error(
    status: int,
    code: str,
    message: str,
    fields: dict[str, str] | None = None,
) -> HTTPException:
    """Buat HTTPException dengan amplop {error:{code,message,fields}}."""
    detail: dict[str, Any] = {"code": code, "message": message}
    if fields:
        detail["fields"] = fields
    return HTTPException(status_code=status, detail=detail)
