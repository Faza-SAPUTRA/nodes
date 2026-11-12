"""Skema masukan API beserta pesan validasi berbahasa Indonesia."""
from __future__ import annotations

import re

from pydantic import BaseModel, Field, field_validator

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$")


def _clean_email(value: str) -> str:
    """Normalisasi email: buang spasi dan jadikan huruf kecil."""
    value = value.strip().lower()
    if not EMAIL_RE.match(value):
        raise ValueError("Format email tidak valid, contoh: nama@kampus.ac.id")
    if len(value) > 190:
        raise ValueError("Email terlalu panjang (maksimal 190 karakter)")
    return value


def _clean_password(value: str) -> str:
    """Password minimal 8 karakter dan wajib punya huruf serta angka."""
    if len(value) < 8:
        raise ValueError("Password minimal 8 karakter")
    if len(value) > 128:
        raise ValueError("Password maksimal 128 karakter")
    if not re.search(r"[A-Za-z]", value):
        raise ValueError("Password harus memuat minimal satu huruf")
    if not re.search(r"\d", value):
        raise ValueError("Password harus memuat minimal satu angka")
    return value


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: str
    password: str

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Nama minimal 2 karakter")
        return v

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        return _clean_email(v)

    @field_validator("password")
    @classmethod
    def _password(cls, v: str) -> str:
        return _clean_password(v)


class LoginIn(BaseModel):
    email: str
    password: str
    remember: bool = False

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        return _clean_email(v)

    @field_validator("password")
    @classmethod
    def _password(cls, v: str) -> str:
        if not v:
            raise ValueError("Password wajib diisi")
        return v


class ProgressIn(BaseModel):
    lesson_id: str = Field(min_length=3, max_length=40)
    done: bool = True
    note: str = ""

    @field_validator("note")
    @classmethod
    def _note(cls, v: str) -> str:
        v = v.strip()
        if len(v) > 500:
            raise ValueError("Catatan maksimal 500 karakter")
        return v


class ProjectIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    kind: str = "canvas"
    data: dict

    @field_validator("name")
    @classmethod
    def _name(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Nama proyek minimal 2 karakter")
        return v

    @field_validator("kind")
    @classmethod
    def _kind(cls, v: str) -> str:
        if v not in {"canvas", "wireframe", "palette"}:
            raise ValueError("Jenis proyek tidak dikenal")
        return v


class ProjectPatch(BaseModel):
    name: str | None = None
    data: dict | None = None

    @field_validator("name")
    @classmethod
    def _name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Nama proyek minimal 2 karakter")
        if len(v) > 80:
            raise ValueError("Nama proyek maksimal 80 karakter")
        return v


class CommentIn(BaseModel):
    body: str
    x: float = 50.0
    y: float = 50.0

    @field_validator("body")
    @classmethod
    def _body(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Komentar minimal 3 karakter")
        if len(v) > 600:
            raise ValueError("Komentar maksimal 600 karakter")
        return v

    @field_validator("x", "y")
    @classmethod
    def _pos(cls, v: float) -> float:
        if not 0 <= v <= 100:
            raise ValueError("Posisi komentar harus antara 0 dan 100")
        return round(v, 2)


class VoteIn(BaseModel):
    option_id: str = Field(min_length=2, max_length=40)


class MessageIn(BaseModel):
    body: str

    @field_validator("body")
    @classmethod
    def _body(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Pesan tidak boleh kosong")
        if len(v) > 400:
            raise ValueError("Pesan maksimal 400 karakter")
        return v


class ProfileIn(BaseModel):
    name: str | None = None
    bio: str | None = None
    avatar: str | None = None
    prefs: dict | None = None

    @field_validator("name")
    @classmethod
    def _name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Nama minimal 2 karakter")
        if len(v) > 80:
            raise ValueError("Nama maksimal 80 karakter")
        return v

    @field_validator("bio")
    @classmethod
    def _bio(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if len(v) > 280:
            raise ValueError("Bio maksimal 280 karakter")
        return v

    @field_validator("prefs")
    @classmethod
    def _prefs(cls, v: dict | None) -> dict | None:
        if v is None:
            return v
        allowed = {"theme", "language", "reduce_motion", "email_digest"}
        unknown = set(v) - allowed
        if unknown:
            raise ValueError(f"Preferensi tidak dikenal: {', '.join(sorted(unknown))}")
        return v


class PasswordIn(BaseModel):
    current: str
    new: str

    @field_validator("current")
    @classmethod
    def _current(cls, v: str) -> str:
        if not v:
            raise ValueError("Password saat ini wajib diisi")
        return v

    @field_validator("new")
    @classmethod
    def _new(cls, v: str) -> str:
        return _clean_password(v)


class RoomIn(BaseModel):
    title: str

    @field_validator("title")
    @classmethod
    def _title(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 3:
            raise ValueError("Judul ruang minimal 3 karakter")
        if len(v) > 90:
            raise ValueError("Judul ruang maksimal 90 karakter")
        return v


class JoinIn(BaseModel):
    code: str

    @field_validator("code")
    @classmethod
    def _code(cls, v: str) -> str:
        v = v.strip()
        if not 4 <= len(v) <= 40:
            raise ValueError("Kode undangan tidak valid")
        return v


class CommentResolve(BaseModel):
    resolved: bool = True


class DeleteAccountIn(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def _password(cls, v: str) -> str:
        if not v:
            raise ValueError("Password wajib diisi untuk menghapus akun")
        return v
