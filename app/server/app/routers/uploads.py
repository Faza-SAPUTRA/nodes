"""Unggah gambar dengan validasi tipe, ukuran, nama, dan isi berkas."""
from __future__ import annotations

import secrets
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, Query, Request

from ..config import ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, UPLOAD_DIR
from ..deps import get_current_user
from ..errors import api_error

router = APIRouter(prefix="/api/uploads", tags=["uploads"])


def _looks_like(data: bytes, ctype: str) -> bool:
    """Periksa magic bytes agar ekstensi palsu tidak lolos."""
    if ctype == "image/png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if ctype == "image/jpeg":
        return data.startswith(b"\xff\xd8\xff")
    if ctype == "image/webp":
        return len(data) > 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP"
    return False


@router.post("", status_code=201)
async def upload_image(
    request: Request,
    filename: str = Query(min_length=1, max_length=120),
    user: dict = Depends(get_current_user),
) -> dict[str, Any]:
    """Terima berkas gambar mentah (body biner) dan simpan dengan nama aman."""
    ctype = (request.headers.get("content-type") or "").split(";")[0].strip().lower()
    if ctype not in ALLOWED_IMAGE_TYPES:
        raise api_error(
            415,
            "UNSUPPORTED_TYPE",
            f"Tipe berkas {ctype or 'tidak diketahui'} tidak didukung. Gunakan PNG, JPG, atau WEBP.",
            {"file": "Format harus PNG, JPG, atau WEBP"},
        )

    safe_name = Path(filename.replace("\\", "/")).name.strip()
    if not safe_name or safe_name in {".", ".."}:
        raise api_error(400, "INVALID_FILENAME", "Nama berkas tidak valid.", {"file": "Nama berkas tidak valid"})

    body = await request.body()
    if not body:
        raise api_error(400, "EMPTY_FILE", "Berkas kosong. Pilih gambar lain.", {"file": "Berkas kosong"})
    if len(body) > MAX_UPLOAD_BYTES:
        raise api_error(
            413,
            "FILE_TOO_LARGE",
            f"Ukuran berkas {len(body) / 1024 / 1024:.1f} MB melebihi batas 4 MB.",
            {"file": "Maksimal 4 MB"},
        )
    if not _looks_like(body, ctype):
        raise api_error(
            400,
            "CONTENT_MISMATCH",
            "Isi berkas tidak cocok dengan tipenya. Berkas mungkin rusak atau ekstensinya diubah.",
            {"file": "Isi berkas tidak sesuai"},
        )

    stored = f"u{user['id']}_{secrets.token_hex(8)}{ALLOWED_IMAGE_TYPES[ctype]}"
    (UPLOAD_DIR / stored).write_bytes(body)
    return {
        "url": f"/uploads/{stored}",
        "name": safe_name,
        "size": len(body),
        "type": ctype,
    }
