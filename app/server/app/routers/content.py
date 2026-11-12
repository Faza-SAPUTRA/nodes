"""Modul, sesi, dan progres belajar."""
from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends, Query

from ..db import get_db, now_iso
from ..deps import get_current_user
from ..errors import api_error
from ..schemas import ProgressIn

router = APIRouter(prefix="/api", tags=["content"])


def _module_rows(conn, user_id: int) -> list[dict[str, Any]]:
    """Ambil semua modul lengkap dengan hitungan progres pengguna."""
    rows = conn.execute(
        """
        SELECT m.*, COUNT(l.id) AS lesson_count,
               COALESCE(SUM(CASE WHEN p.status = 'done' THEN 1 ELSE 0 END), 0) AS done_count
        FROM modules m
        LEFT JOIN lessons l ON l.module_id = m.id
        LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
        GROUP BY m.id
        ORDER BY m.order_index
        """,
        (user_id,),
    ).fetchall()
    result = []
    for row in rows:
        item = dict(row)
        total = item["lesson_count"] or 0
        done = item["done_count"] or 0
        item["progress"] = round(done / total * 100) if total else 0
        result.append(item)
    return result


@router.get("/modules")
def list_modules(
    q: str = Query(default="", max_length=60),
    track: str = Query(default="", max_length=40),
    user: dict = Depends(get_current_user),
) -> dict[str, Any]:
    """Daftar modul dengan filter pencarian dan jalur belajar."""
    with get_db() as conn:
        all_items = _module_rows(conn, user["id"])
    # Jalur belajar selalu dari daftar lengkap agar opsi filter tidak hilang
    tracks = sorted({m["track"] for m in all_items})
    items = all_items
    needle = q.strip().lower()
    if needle:
        items = [m for m in items if needle in m["title"].lower() or needle in m["summary"].lower()]
    if track:
        items = [m for m in items if m["track"].lower() == track.lower()]
    return {"modules": items, "tracks": tracks}


def _module_rows_cache(user_id: int) -> list[dict[str, Any]]:
    """Ambil ulang semua modul tanpa filter untuk daftar jalur."""
    with get_db() as conn:
        return _module_rows(conn, user_id)


@router.get("/modules/{slug}")
def module_detail(slug: str, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Detail satu modul beserta seluruh sesinya."""
    with get_db() as conn:
        module = conn.execute("SELECT * FROM modules WHERE slug = ?", (slug,)).fetchone()
        if module is None:
            raise api_error(404, "MODULE_NOT_FOUND", "Modul tidak ditemukan atau sudah dihapus.")
        lessons = conn.execute(
            """
            SELECT l.*, COALESCE(p.status, 'todo') AS status, COALESCE(p.note, '') AS note
            FROM lessons l
            LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = ?
            WHERE l.module_id = ?
            ORDER BY l.order_index
            """,
            (user["id"], module["id"]),
        ).fetchall()
        total = len(lessons)
        done = sum(1 for l in lessons if l["status"] == "done")
        data = dict(module)
        data["lessons"] = [
            {**dict(l), "takeaways": json.loads(l["takeaways"] or "[]")} for l in lessons
        ]
        data["lesson_count"] = total
        data["done_count"] = done
        data["progress"] = round(done / total * 100) if total else 0
    return {"module": data}


@router.post("/progress")
def set_progress(payload: ProgressIn, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Tandai sesi selesai/belum, sekaligus simpan catatan belajar."""
    stamp = now_iso()
    with get_db() as conn:
        lesson = conn.execute("SELECT id, title, module_id FROM lessons WHERE id = ?", (payload.lesson_id,)).fetchone()
        if lesson is None:
            raise api_error(404, "LESSON_NOT_FOUND", "Sesi belajar tidak ditemukan.")
        if payload.done:
            conn.execute(
                """
                INSERT INTO progress (user_id, lesson_id, status, note, updated_at)
                VALUES (?,?,?,?,?)
                ON CONFLICT(user_id, lesson_id) DO UPDATE SET
                    status = excluded.status, note = excluded.note, updated_at = excluded.updated_at
                """,
                (user["id"], payload.lesson_id, "done", payload.note, stamp),
            )
            conn.execute(
                "INSERT INTO activity (user_id, kind, message, created_at) VALUES (?,?,?,?)",
                (user["id"], "lesson", f"Menyelesaikan sesi \u201c{lesson['title']}\u201d.", stamp),
            )
        else:
            conn.execute(
                "DELETE FROM progress WHERE user_id = ? AND lesson_id = ?",
                (user["id"], payload.lesson_id),
            )
        modules = _module_rows(conn, user["id"])
    total = sum(m["lesson_count"] for m in modules)
    done = sum(m["done_count"] for m in modules)
    return {
        "ok": True,
        "totals": {
            "lessons": total,
            "done": done,
            "progress": round(done / total * 100) if total else 0,
        },
        "modules": modules,
    }


@router.get("/progress")
def progress_summary(user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Ringkasan progres seluruh modul untuk dashboard."""
    with get_db() as conn:
        modules = _module_rows(conn, user["id"])
        recent = conn.execute(
            "SELECT * FROM activity WHERE user_id = ? ORDER BY id DESC LIMIT 12", (user["id"],)
        ).fetchall()
    total = sum(m["lesson_count"] for m in modules)
    done = sum(m["done_count"] for m in modules)
    return {
        "modules": modules,
        "activity": [dict(r) for r in recent],
        "totals": {
            "modules": len(modules),
            "lessons": total,
            "done": done,
            "minutes": sum(m["est_minutes"] for m in modules),
            "progress": round(done / total * 100) if total else 0,
        },
    }
