"""Proyek kanvas: daftar, simpan, ubah, dan hapus."""
from __future__ import annotations

import json
import secrets
from typing import Any

from fastapi import APIRouter, Depends

from ..config import MAX_PROJECT_BYTES
from ..db import get_db, now_iso
from ..deps import get_current_user
from ..errors import api_error
from ..schemas import ProjectIn, ProjectPatch

router = APIRouter(prefix="/api/projects", tags=["projects"])

MAX_PROJECTS_PER_USER = 50


def _serialize(row: Any) -> dict[str, Any]:
    """Ubah baris DB menjadi objek proyek dengan data JSON yang sudah diparse."""
    item = dict(row)
    try:
        item["data"] = json.loads(item["data"])
    except (ValueError, TypeError):
        item["data"] = {}
    return item


def _owned(conn, project_id: str, user_id: int) -> Any:
    """Ambil proyek milik pengguna; 404 bila tidak ada atau bukan miliknya."""
    row = conn.execute(
        "SELECT * FROM projects WHERE id = ? AND user_id = ?", (project_id, user_id)
    ).fetchone()
    if row is None:
        raise api_error(404, "PROJECT_NOT_FOUND", "Proyek tidak ditemukan atau sudah dihapus.")
    return row


def _guard_size(data: dict) -> str:
    """Tolak payload kanvas yang terlalu besar sebelum menyentuh database."""
    raw = json.dumps(data, ensure_ascii=False)
    if len(raw.encode("utf-8")) > MAX_PROJECT_BYTES:
        raise api_error(
            413,
            "PROJECT_TOO_LARGE",
            "Isi kanvas terlalu besar (maksimal 512 KB). Hapus beberapa layer lalu simpan lagi.",
        )
    return raw


@router.get("")
def list_projects(user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Daftar proyek milik pengguna, terbaru lebih dulu."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, name, kind, created_at, updated_at FROM projects"
            " WHERE user_id = ? ORDER BY updated_at DESC",
            (user["id"],),
        ).fetchall()
    return {"projects": [dict(r) for r in rows]}


@router.post("", status_code=201)
def create_project(payload: ProjectIn, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Simpan proyek kanvas baru."""
    raw = _guard_size(payload.data)
    stamp = now_iso()
    with get_db() as conn:
        count = conn.execute(
            "SELECT COUNT(*) AS n FROM projects WHERE user_id = ?", (user["id"],)
        ).fetchone()["n"]
        if count >= MAX_PROJECTS_PER_USER:
            raise api_error(
                409,
                "PROJECT_LIMIT",
                f"Batas {MAX_PROJECTS_PER_USER} proyek tercapai. Hapus proyek lama dulu.",
            )
        project_id = "p_" + secrets.token_hex(8)
        conn.execute(
            "INSERT INTO projects (id, user_id, name, kind, data, created_at, updated_at)"
            " VALUES (?,?,?,?,?,?,?)",
            (project_id, user["id"], payload.name, payload.kind, raw, stamp, stamp),
        )
        conn.execute(
            "INSERT INTO activity (user_id, kind, message, created_at) VALUES (?,?,?,?)",
            (user["id"], "canvas", f"Menyimpan kanvas \u201c{payload.name}\u201d.", stamp),
        )
        row = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    return {"project": _serialize(row)}


@router.get("/{project_id}")
def get_project(project_id: str, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Detail satu proyek beserta isi kanvas."""
    with get_db() as conn:
        row = _owned(conn, project_id, user["id"])
    return {"project": _serialize(row)}


@router.patch("/{project_id}")
def update_project(
    project_id: str, payload: ProjectPatch, user: dict = Depends(get_current_user)
) -> dict[str, Any]:
    """Ubah nama atau isi kanvas proyek."""
    with get_db() as conn:
        _owned(conn, project_id, user["id"])
        sets: list[str] = []
        params: list[Any] = []
        if payload.name is not None:
            sets.append("name = ?")
            params.append(payload.name)
        if payload.data is not None:
            sets.append("data = ?")
            params.append(_guard_size(payload.data))
        if not sets:
            raise api_error(400, "NOTHING_TO_UPDATE", "Tidak ada perubahan yang dikirim.")
        sets.append("updated_at = ?")
        params.append(now_iso())
        params.extend([project_id, user["id"]])
        conn.execute(f"UPDATE projects SET {', '.join(sets)} WHERE id = ? AND user_id = ?", params)
        row = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    return {"project": _serialize(row)}


@router.delete("/{project_id}")
def delete_project(project_id: str, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Hapus proyek secara permanen."""
    with get_db() as conn:
        _owned(conn, project_id, user["id"])
        conn.execute("DELETE FROM projects WHERE id = ? AND user_id = ?", (project_id, user["id"]))
    return {"ok": True}
