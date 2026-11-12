"""Hashing password dan token sesi berbasis HMAC (tanpa dependensi eksternal)."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

from .config import SECRET_KEY, TOKEN_TTL_SECONDS

PBKDF2_ROUNDS = 220_000


def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _b64d(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def hash_password(password: str) -> str:
    """Simpan password sebagai pbkdf2_sha256$rounds$salt$hash."""
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ROUNDS)
    return f"pbkdf2_sha256${PBKDF2_ROUNDS}${_b64e(salt)}${_b64e(digest)}"


def verify_password(password: str, stored: str) -> bool:
    """Bandingkan password dengan hash tersimpan memakai perbandingan konstan-waktu."""
    try:
        algo, rounds, salt_b64, hash_b64 = stored.split("$")
        if algo != "pbkdf2_sha256":
            return False
        salt = _b64d(salt_b64)
        expected = _b64d(hash_b64)
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(rounds))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def _sign(payload: str) -> str:
    mac = hmac.new(SECRET_KEY.encode("utf-8"), payload.encode("ascii"), hashlib.sha256)
    return _b64e(mac.digest())


def create_token(user_id: int, token_version: int) -> str:
    """Buat token bertanda tangan: base64(payload).signature."""
    payload: dict[str, Any] = {
        "sub": user_id,
        "ver": token_version,
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
        "nonce": secrets.token_hex(6),
    }
    raw = json.dumps(payload, separators=(",", ":"), sort_keys=True)
    body = _b64e(raw.encode("utf-8"))
    return f"{body}.{_sign(body)}"


def decode_token(token: str) -> dict[str, Any] | None:
    """Kembalikan payload token bila tanda tangan valid dan belum kedaluwarsa."""
    try:
        body, signature = token.split(".")
    except ValueError:
        return None
    if not hmac.compare_digest(_sign(body), signature):
        return None
    try:
        payload = json.loads(_b64d(body))
    except (ValueError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict) or payload.get("exp", 0) < int(time.time()):
        return None
    return payload
