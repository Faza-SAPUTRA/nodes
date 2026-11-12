"""Titik masuk aplikasi NODES: API + penyajian hasil build frontend."""
from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import UPLOAD_DIR, WEB_DIST, ensure_dirs
from .db import init_db
from .errors import api_error
from .routers import auth, collab, content, profile, projects, uploads


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Siapkan direktori dan skema database sebelum melayani permintaan."""
    ensure_dirs()
    init_db()
    yield


app = FastAPI(
    title="NODES API",
    description="API platform e-learning UI/UX NODES.",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Bungkus semua error HTTP ke amplop {error:{code,message,fields}}."""
    detail = exc.detail
    if isinstance(detail, dict) and "code" in detail:
        body = {"error": detail}
    else:
        body = {"error": {"code": f"HTTP_{exc.status_code}", "message": str(detail)}}
    return JSONResponse(status_code=exc.status_code, content=body, headers=exc.headers)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Ubah error validasi Pydantic menjadi pesan per-field berbahasa Indonesia."""
    fields: dict[str, str] = {}
    for err in exc.errors():
        parts = [str(p) for p in err.get("loc", ()) if p not in ("body", "query", "path")]
        key = ".".join(parts) or "body"
        message = str(err.get("msg", "Nilai tidak valid")).replace("Value error, ", "")
        fields.setdefault(key, message)
    first = next(iter(fields.values()), "Data yang dikirim tidak valid")
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "VALIDATION_ERROR", "message": first, "fields": fields}},
    )


@app.exception_handler(Exception)
async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Jaring terakhir agar klien selalu menerima JSON, bukan halaman error mentah."""
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "Terjadi kesalahan di server. Coba lagi beberapa saat.",
            }
        },
    )


@app.get("/api/health")
def health() -> dict[str, str]:
    """Cek cepat apakah server hidup."""
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(content.router)
app.include_router(projects.router)
app.include_router(uploads.router)
app.include_router(collab.router)
app.include_router(profile.router)

ensure_dirs()
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

if WEB_DIST.exists():
    assets_dir = WEB_DIST / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{full_path:path}", include_in_schema=False)
def spa(full_path: str) -> FileResponse:
    """Sajikan hasil build React; rute yang tidak dikenal kembali ke index.html."""
    index = WEB_DIST / "index.html"
    if not index.exists():
        raise api_error(
            503,
            "FRONTEND_NOT_BUILT",
            "Frontend belum dibangun. Jalankan `npm run build` di folder web.",
        )
    if full_path:
        candidate = (WEB_DIST / full_path).resolve()
        if candidate.is_file() and WEB_DIST.resolve() in candidate.parents:
            return FileResponse(candidate)
    return FileResponse(index)
