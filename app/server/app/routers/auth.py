"""Registrasi, login, dan profil sesi."""
from __future__ import annotations

import json
import time
from typing import Any

from fastapi import APIRouter, Depends

from ..config import LOGIN_LOCK_SECONDS, MAX_LOGIN_ATTEMPTS
from ..db import get_db, now_iso
from ..deps import get_current_user, public_user
from ..errors import api_error
from ..schemas import LoginIn, RegisterIn
from ..security import create_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Penghitung percobaan gagal per email (cukup untuk server lokal satu proses)
_ATTEMPTS: dict[str, list[float]] = {}


def _check_lock(email: str) -> None:
    """Tolak login sementara bila percobaan gagal terlalu sering."""
    stamps = [t for t in _ATTEMPTS.get(email, []) if time.time() - t < LOGIN_LOCK_SECONDS]
    _ATTEMPTS[email] = stamps
    if len(stamps) >= MAX_LOGIN_ATTEMPTS:
        sisa = int(LOGIN_LOCK_SECONDS - (time.time() - stamps[0]))
        raise api_error(
            429,
            "TOO_MANY_ATTEMPTS",
            f"Terlalu banyak percobaan gagal. Coba lagi dalam {max(sisa, 1)} detik.",
        )


def _record_failure(email: str) -> None:
    """Catat satu percobaan login yang gagal."""
    _ATTEMPTS.setdefault(email, []).append(time.time())


def _session(row: Any) -> dict[str, Any]:
    """Bentuk respons sesi: data pengguna + token."""
    token = create_token(row["id"], row["token_version"])
    return {"token": token, "user": public_user(row)}


@router.post("/register")
def register(payload: RegisterIn) -> dict[str, Any]:
    """Buat akun baru lalu langsungkan sesi."""
    with get_db() as conn:
        exists = conn.execute("SELECT 1 FROM users WHERE email = ?", (payload.email,)).fetchone()
        if exists:
            raise api_error(
                409,
                "EMAIL_TAKEN",
                "Email ini sudah terdaftar. Coba masuk atau pakai email lain.",
                {"email": "Email sudah digunakan"},
            )
        stamp = now_iso()
        user_id = conn.execute(
            "INSERT INTO users (email, name, password_hash, bio, prefs, created_at)"
            " VALUES (?,?,?,?,?,?)",
            (
                payload.email,
                payload.name,
                hash_password(payload.password),
                "",
                json.dumps({"theme": "light", "language": "id", "reduce_motion": False, "email_digest": True}),
                stamp,
            ),
        ).lastrowid
        conn.execute(
            "INSERT INTO activity (user_id, kind, message, created_at) VALUES (?,?,?,?)",
            (user_id, "account", "Membuat akun NODES.", stamp),
        )
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return _session(row)


@router.post("/login")
def login(payload: LoginIn) -> dict[str, Any]:
    """Verifikasi kredensial dan terbitkan token."""
    _check_lock(payload.email)
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()
    if row is None or not verify_password(payload.password, row["password_hash"]):
        _record_failure(payload.email)
        raise api_error(
            401,
            "INVALID_CREDENTIALS",
            "Email atau password salah. Periksa kembali lalu coba lagi.",
        )
    _ATTEMPTS.pop(payload.email, None)
    return _session(row)


@router.get("/me")
def me(user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Kembalikan pengguna yang sedang login."""
    return {"user": public_user(user)}
