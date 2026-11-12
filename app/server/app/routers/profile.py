"""Profil pengguna: ubah data, ganti password, statistik, hapus akun."""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends

from ..db import get_db, now_iso
from ..deps import get_current_user, public_user
from ..errors import api_error
from ..schemas import DeleteAccountIn, PasswordIn, ProfileIn
from ..security import create_token, hash_password, verify_password

router = APIRouter(prefix="/api/profile", tags=["profile"])


def _load(user_id: int) -> Any:
    """Ambil ulang baris pengguna dari database."""
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    if row is None:
        raise api_error(404, "USER_NOT_FOUND", "Akun tidak ditemukan.")
    return row


@router.get("")
def get_profile(user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Data profil pengguna yang sedang login."""
    data = public_user(user)
    try:
        data["prefs"] = json.loads(data.get("prefs") or "{}")
    except (ValueError, TypeError):
        data["prefs"] = {}
    return {"user": data}


@router.patch("")
def update_profile(payload: ProfileIn, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Perbarui nama, bio, atau preferensi tampilan."""
    sets: list[str] = []
    params: list[Any] = []
    if payload.name is not None:
        sets.append("name = ?")
        params.append(payload.name)
    if payload.bio is not None:
        sets.append("bio = ?")
        params.append(payload.bio)
    if payload.avatar is not None:
        sets.append("avatar = ?")
        params.append(payload.avatar)
    if payload.prefs is not None:
        current = json.loads(user.get("prefs") or "{}")
        current.update(payload.prefs)
        sets.append("prefs = ?")
        params.append(json.dumps(current, ensure_ascii=False))
    if not sets:
        raise api_error(400, "NOTHING_TO_UPDATE", "Tidak ada perubahan yang dikirim.")
    params.append(user["id"])
    with get_db() as conn:
        conn.execute(f"UPDATE users SET {', '.join(sets)} WHERE id = ?", params)
    row = _load(user["id"])
    data = public_user(row)
    data["prefs"] = json.loads(data.get("prefs") or "{}")
    return {"user": data}


@router.post("/password")
def change_password(payload: PasswordIn, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Ganti password lalu terbitkan token baru (sesi lama otomatis gugur)."""
    if not verify_password(payload.current, user["password_hash"]):
        raise api_error(
            400,
            "WRONG_PASSWORD",
            "Password saat ini salah.",
            {"current": "Password saat ini salah"},
        )
    if payload.current == payload.new:
        raise api_error(
            400, "SAME_PASSWORD", "Password baru harus berbeda dari yang sekarang.",
            {"new": "Password baru sama dengan yang lama"},
        )
    with get_db() as conn:
        conn.execute(
            "UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?",
            (hash_password(payload.new), user["id"]),
        )
    row = _load(user["id"])
    return {"ok": True, "token": create_token(row["id"], row["token_version"])}


@router.get("/stats")
def stats(user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Statistik belajar: heatmap 12 minggu dan ringkasan capaian."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS total"
            " FROM activity WHERE user_id = ? GROUP BY day",
            (user["id"],),
        ).fetchall()
        done = conn.execute(
            "SELECT COUNT(*) AS n FROM progress WHERE user_id = ? AND status = 'done'", (user["id"],)
        ).fetchone()["n"]
        projects = conn.execute(
            "SELECT COUNT(*) AS n FROM projects WHERE user_id = ?", (user["id"],)
        ).fetchone()["n"]
        comments = conn.execute(
            "SELECT COUNT(*) AS n FROM comments WHERE user_id = ?", (user["id"],)
        ).fetchone()["n"]

    start = (datetime.now(timezone.utc) - timedelta(days=83)).date()
    by_day = {r["day"]: r["total"] for r in rows}
    heatmap = []
    for offset in range(84):
        day = start + timedelta(days=offset)
        heatmap.append({"date": day.isoformat(), "count": by_day.get(day.isoformat(), 0)})
    return {
        "heatmap": heatmap,
        "totals": {"lessons": done, "projects": projects, "comments": comments},
        "streak": _streak(by_day),
    }


def _streak(by_day: dict[str, int]) -> int:
    """Hitung berapa hari berturut-turut ada aktivitas sampai hari ini."""
    streak = 0
    cursor = datetime.now(timezone.utc).date()
    for _ in range(365):
        if by_day.get(cursor.isoformat(), 0) > 0:
            streak += 1
            cursor -= timedelta(days=1)
        else:
            break
    return streak


@router.delete("")
def delete_account(payload: DeleteAccountIn, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Hapus akun beserta seluruh data terkait (butuh konfirmasi password)."""
    if not verify_password(payload.password, user["password_hash"]):
        raise api_error(
            400, "WRONG_PASSWORD", "Password salah, akun tidak dihapus.",
            {"password": "Password salah"},
        )
    with get_db() as conn:
        conn.execute("DELETE FROM users WHERE id = ?", (user["id"],))
    return {"ok": True}


@router.post("/activity")
def log_activity(user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Catat aktivitas ringan dari klien (mis. membuka kanvas)."""
    with get_db() as conn:
        conn.execute(
            "INSERT INTO activity (user_id, kind, message, created_at) VALUES (?,?,?,?)",
            (user["id"], "session", "Membuka sesi belajar.", now_iso()),
        )
    return {"ok": True}
