"""Konfigurasi terpusat aplikasi NODES."""
from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent          # .../app/server
PROJECT_ROOT = BASE_DIR.parent                             # .../app
DATA_DIR = Path(os.environ.get("NODES_DATA_DIR", BASE_DIR / "data"))
UPLOAD_DIR = DATA_DIR / "uploads"
DB_PATH = Path(os.environ.get("NODES_DB", DATA_DIR / "nodes.db"))
WEB_DIST = PROJECT_ROOT / "web" / "dist"

# Token & keamanan
TOKEN_TTL_SECONDS = 60 * 60 * 12          # sesi berlaku 12 jam
MAX_LOGIN_ATTEMPTS = 5                    # percobaan login sebelum dikunci sementara
LOGIN_LOCK_SECONDS = 60 * 5

# Batas upload
MAX_UPLOAD_BYTES = 4 * 1024 * 1024        # 4 MB
ALLOWED_IMAGE_TYPES = {"image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp"}
ALLOWED_PROJECT_TYPES = {"application/json": ".json"}

# Batas payload kanvas agar tidak membanjiri DB
MAX_PROJECT_BYTES = 512 * 1024

SECRET_KEY = os.environ.get("NODES_SECRET")
if not SECRET_KEY:
    # Disimpan ke disk agar token tetap valid antar restart saat mode lokal
    secret_file = DATA_DIR / "secret.key"
    if secret_file.exists():
        SECRET_KEY = secret_file.read_text(encoding="utf-8").strip()
    else:
        import secrets as _secrets
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        SECRET_KEY = _secrets.token_urlsafe(48)
        secret_file.write_text(SECRET_KEY, encoding="utf-8")


def ensure_dirs() -> None:
    """Pastikan direktori data & upload tersedia sebelum aplikasi dipakai."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
