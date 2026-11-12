"""Dependency autentikasi berbasis token Bearer."""
from __future__ import annotations

import sqlite3
from typing import Any

from fastapi import Header

from .db import get_db
from .errors import api_error
from .security import decode_token


def get_current_user(authorization: str | None = Header(default=None)) -> dict[str, Any]:
    """Validasi token lalu kembalikan data pengguna aktif."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise api_error(401, "UNAUTHORIZED", "Kamu belum masuk. Silakan login terlebih dahulu.")
    token = authorization.split(" ", 1)[1].strip()
    payload = decode_token(token)
    if not payload:
        raise api_error(401, "TOKEN_INVALID", "Sesi sudah berakhir. Silakan login kembali.")

    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (payload.get("sub"),)).fetchone()
    if row is None:
        raise api_error(401, "USER_NOT_FOUND", "Akun untuk sesi ini sudah tidak tersedia.")
    if int(payload.get("ver", -1)) != row["token_version"]:
        raise api_error(401, "TOKEN_STALE", "Password berubah. Silakan login kembali.")
    return dict(row)


def public_user(row: dict[str, Any] | sqlite3.Row) -> dict[str, Any]:
    """Buang kolom sensitif sebelum data pengguna dikirim ke klien."""
    data = dict(row)
    data.pop("password_hash", None)
    data.pop("token_version", None)
    return data
