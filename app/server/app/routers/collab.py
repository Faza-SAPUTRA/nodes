"""Ruang kolaborasi: komentar, voting, dan obrolan."""
from __future__ import annotations

import secrets
from typing import Any

from fastapi import APIRouter, Depends

from ..db import get_db, now_iso
from ..deps import get_current_user
from ..errors import api_error
from ..schemas import CommentIn, CommentResolve, JoinIn, MessageIn, RoomIn, VoteIn

router = APIRouter(prefix="/api/rooms", tags=["collab"])


ACCESS_DENIED = "Kamu tidak punya akses ke ruang ini."


def _room(conn, room_id: str, user_id: int, require_member: bool = True) -> Any:
    """Ambil ruang beserta peran pengguna; 404/403 bila tidak berhak."""
    room = conn.execute("SELECT * FROM rooms WHERE id = ?", (room_id,)).fetchone()
    if room is None:
        raise api_error(404, "ROOM_NOT_FOUND", "Ruang kolaborasi tidak ditemukan.")
    member = conn.execute(
        "SELECT role FROM room_members WHERE room_id = ? AND user_id = ?", (room_id, user_id)
    ).fetchone()
    if require_member and member is None:
        raise api_error(403, "NOT_A_MEMBER", ACCESS_DENIED)
    return room, (member["role"] if member else None)


@router.get("")
def list_rooms(user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Daftar ruang yang diikuti pengguna."""
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT r.*, rm.role,
                   (SELECT COUNT(*) FROM room_members x WHERE x.room_id = r.id) AS members,
                   (SELECT COUNT(*) FROM comments c WHERE c.room_id = r.id AND c.resolved = 0) AS open_comments,
                   (SELECT COUNT(*) FROM messages m WHERE m.room_id = r.id) AS messages
            FROM rooms r
            JOIN room_members rm ON rm.room_id = r.id AND rm.user_id = ?
            ORDER BY r.created_at DESC
            """,
            (user["id"],),
        ).fetchall()
    return {"rooms": [dict(r) for r in rows]}


@router.post("", status_code=201)
def create_room(payload: RoomIn, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Buat ruang review baru."""
    stamp = now_iso()
    room_id = "r_" + secrets.token_hex(6)
    code = secrets.token_urlsafe(6)
    with get_db() as conn:
        conn.execute(
            "INSERT INTO rooms (id, owner_id, title, share_code, status, created_at)"
            " VALUES (?,?,?,?,?,?)",
            (room_id, user["id"], payload.title, code, "open", stamp),
        )
        conn.execute(
            "INSERT INTO room_members (room_id, user_id, role, joined_at) VALUES (?,?,?,?)",
            (room_id, user["id"], "owner", stamp),
        )
        conn.execute(
            "INSERT INTO activity (user_id, kind, message, created_at) VALUES (?,?,?,?)",
            (user["id"], "collab", f"Membuka ruang review \u201c{payload.title}\u201d.", stamp),
        )
        row = conn.execute("SELECT * FROM rooms WHERE id = ?", (room_id,)).fetchone()
    return {"room": dict(row)}


@router.post("/join")
def join_room(payload: JoinIn, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Gabung ke ruang memakai kode undangan."""
    with get_db() as conn:
        room = conn.execute("SELECT * FROM rooms WHERE share_code = ?", (payload.code,)).fetchone()
        if room is None:
            raise api_error(404, "INVALID_CODE", "Kode undangan tidak dikenali.", {"code": "Kode tidak valid"})
        exists = conn.execute(
            "SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?", (room["id"], user["id"])
        ).fetchone()
        if not exists:
            conn.execute(
                "INSERT INTO room_members (room_id, user_id, role, joined_at) VALUES (?,?,?,?)",
                (room["id"], user["id"], "reviewer", now_iso()),
            )
    return {"room": dict(room)}


@router.get("/{room_id}")
def room_detail(room_id: str, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Isi ruang: komentar, hasil voting, dan obrolan."""
    with get_db() as conn:
        room, role = _room(conn, room_id, user["id"])
        comments = conn.execute(
            """
            SELECT c.*, u.name AS author, u.avatar AS author_avatar
            FROM comments c JOIN users u ON u.id = c.user_id
            WHERE c.room_id = ? ORDER BY c.id
            """,
            (room_id,),
        ).fetchall()
        tally = conn.execute(
            "SELECT option_id, COUNT(*) AS total FROM votes WHERE room_id = ? GROUP BY option_id",
            (room_id,),
        ).fetchall()
        mine = conn.execute(
            "SELECT option_id FROM votes WHERE room_id = ? AND user_id = ?", (room_id, user["id"])
        ).fetchone()
        messages = conn.execute(
            """
            SELECT m.*, u.name AS author, u.avatar AS author_avatar
            FROM messages m JOIN users u ON u.id = m.user_id
            WHERE m.room_id = ? ORDER BY m.id
            """,
            (room_id,),
        ).fetchall()
        members = conn.execute(
            """
            SELECT u.id, u.name, u.avatar, rm.role
            FROM room_members rm JOIN users u ON u.id = rm.user_id
            WHERE rm.room_id = ? ORDER BY rm.joined_at
            """,
            (room_id,),
        ).fetchall()
    return {
        "room": {**dict(room), "role": role},
        "comments": [dict(r) for r in comments],
        "votes": {r["option_id"]: r["total"] for r in tally},
        "my_vote": mine["option_id"] if mine else None,
        "messages": [dict(r) for r in messages],
        "members": [dict(r) for r in members],
    }


@router.post("/{room_id}/comments", status_code=201)
def add_comment(
    room_id: str, payload: CommentIn, user: dict = Depends(get_current_user)
) -> dict[str, Any]:
    """Tambah komentar pada titik tertentu di kanvas."""
    stamp = now_iso()
    with get_db() as conn:
        _room(conn, room_id, user["id"])
        cursor = conn.execute(
            "INSERT INTO comments (room_id, user_id, body, x, y, resolved, created_at)"
            " VALUES (?,?,?,?,?,?,?)",
            (room_id, user["id"], payload.body, payload.x, payload.y, 0, stamp),
        )
        row = conn.execute(
            """
            SELECT c.*, u.name AS author, u.avatar AS author_avatar
            FROM comments c JOIN users u ON u.id = c.user_id WHERE c.id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()
    return {"comment": dict(row)}


@router.patch("/{room_id}/comments/{comment_id}")
def resolve_comment(
    room_id: str, comment_id: int, payload: CommentResolve, user: dict = Depends(get_current_user)
) -> dict[str, Any]:
    """Tandai komentar selesai atau buka kembali."""
    with get_db() as conn:
        _room(conn, room_id, user["id"])
        row = conn.execute(
            "SELECT * FROM comments WHERE id = ? AND room_id = ?", (comment_id, room_id)
        ).fetchone()
        if row is None:
            raise api_error(404, "COMMENT_NOT_FOUND", "Komentar tidak ditemukan.")
        conn.execute(
            "UPDATE comments SET resolved = ? WHERE id = ?", (1 if payload.resolved else 0, comment_id)
        )
    return {"ok": True, "resolved": payload.resolved}


@router.post("/{room_id}/votes")
def vote(room_id: str, payload: VoteIn, user: dict = Depends(get_current_user)) -> dict[str, Any]:
    """Pilih satu opsi desain (satu suara per pengguna, bisa diganti)."""
    with get_db() as conn:
        _room(conn, room_id, user["id"])
        conn.execute(
            """
            INSERT INTO votes (room_id, user_id, option_id, created_at) VALUES (?,?,?,?)
            ON CONFLICT(room_id, user_id) DO UPDATE SET
                option_id = excluded.option_id, created_at = excluded.created_at
            """,
            (room_id, user["id"], payload.option_id, now_iso()),
        )
        tally = conn.execute(
            "SELECT option_id, COUNT(*) AS total FROM votes WHERE room_id = ? GROUP BY option_id",
            (room_id,),
        ).fetchall()
    return {"votes": {r["option_id"]: r["total"] for r in tally}, "my_vote": payload.option_id}


@router.post("/{room_id}/messages", status_code=201)
def send_message(
    room_id: str, payload: MessageIn, user: dict = Depends(get_current_user)
) -> dict[str, Any]:
    """Kirim pesan obrolan di ruang review."""
    with get_db() as conn:
        _room(conn, room_id, user["id"])
        cursor = conn.execute(
            "INSERT INTO messages (room_id, user_id, body, created_at) VALUES (?,?,?,?)",
            (room_id, user["id"], payload.body, now_iso()),
        )
        row = conn.execute(
            """
            SELECT m.*, u.name AS author, u.avatar AS author_avatar
            FROM messages m JOIN users u ON u.id = m.user_id WHERE m.id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()
    return {"message": dict(row)}
