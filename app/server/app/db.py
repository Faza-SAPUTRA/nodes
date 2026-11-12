"""Akses SQLite: inisialisasi skema dan data awal (seed)."""
from __future__ import annotations

import json
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator

from .config import DB_PATH, ensure_dirs
from .security import hash_password

SCHEMA = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    email          TEXT NOT NULL UNIQUE,
    name           TEXT NOT NULL,
    password_hash  TEXT NOT NULL,
    bio            TEXT NOT NULL DEFAULT '',
    avatar         TEXT,
    prefs          TEXT NOT NULL DEFAULT '{}',
    token_version  INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS modules (
    id           TEXT PRIMARY KEY,
    slug         TEXT NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    subtitle     TEXT NOT NULL,
    track        TEXT NOT NULL,
    level        TEXT NOT NULL,
    est_minutes  INTEGER NOT NULL,
    order_index  INTEGER NOT NULL,
    summary      TEXT NOT NULL,
    accent       TEXT NOT NULL DEFAULT 'teal'
);

CREATE TABLE IF NOT EXISTS lessons (
    id          TEXT PRIMARY KEY,
    module_id   TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    slug        TEXT NOT NULL,
    title       TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    minutes     INTEGER NOT NULL,
    body        TEXT NOT NULL,
    takeaways   TEXT NOT NULL DEFAULT '[]',
    UNIQUE (module_id, slug)
);

CREATE TABLE IF NOT EXISTS progress (
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id  TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status     TEXT NOT NULL DEFAULT 'done',
    note       TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS projects (
    id         TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    kind       TEXT NOT NULL,
    data       TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
    id         TEXT PRIMARY KEY,
    owner_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    share_code TEXT NOT NULL UNIQUE,
    status     TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS room_members (
    room_id   TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role      TEXT NOT NULL DEFAULT 'viewer',
    joined_at TEXT NOT NULL,
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id    TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    x          REAL NOT NULL DEFAULT 50,
    y          REAL NOT NULL DEFAULT 50,
    resolved   INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
    room_id   TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id    TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body       TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL,
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_comments_room ON comments(room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, id);
"""


def _slugify(text: str) -> str:
    """Ubah judul sesi menjadi slug URL yang aman."""
    import re as _re
    import unicodedata as _ud

    normalized = _ud.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    slug = _re.sub(r"[^a-zA-Z0-9]+", "-", normalized).strip("-").lower()
    return slug or "sesi"


def now_iso() -> str:
    """Waktu UTC dalam format ISO yang konsisten untuk seluruh tabel."""
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


@contextmanager
def get_db() -> Iterator[sqlite3.Connection]:
    """Koneksi per-request; commit otomatis bila tidak ada error."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


MODULES: list[dict] = [
    {
        "slug": "pengantar-ui-ux",
        "title": "Pengantar UI/UX",
        "subtitle": "Dari masalah manusia ke solusi visual",
        "track": "Fondasi",
        "level": "Dasar",
        "minutes": 48,
        "summary": "Peta besar disiplin UI/UX: apa yang sebenarnya dirancang, siapa yang dilayani, dan bagaimana mengukur keberhasilannya.",
        "accent": "teal",
        "lessons": [
            ("Apa itu UI/UX", 16, "Perbedaan UI dan UX bukan soal alat, tapi soal pertanyaan yang diajukan.\n\n## Dua pertanyaan berbeda\n\nUX bertanya: *apakah orang bisa mencapai tujuannya tanpa tersesat?* UI bertanya: *apakah setiap elemen di layar menjelaskan dirinya sendiri?*\n\n- **UX** mencakup riset, alur, arsitektur informasi, dan pengukuran.\n- **UI** mencakup tipografi, warna, spasi, state, dan motion.\n- Keduanya bertemu di satu titik: keputusan yang bisa dipertanggungjawabkan.", ["UX = keputusan alur", "UI = keputusan permukaan", "Keduanya butuh bukti"]),
            ("Peran desainer di tim produk", 14, "Desainer bukan pembuat gambar, melainkan penerjemah masalah.\n\n## Tiga keluaran yang diharapkan\n\n1. Pemahaman masalah yang bisa dibagikan (riset, peta alur).\n2. Keputusan desain beserta alasannya.\n3. Spesifikasi yang bisa diimplementasikan engineer tanpa bertanya ulang.\n\nTanpa ketiganya, desain hanya jadi dekorasi akhir proyek.", ["Riset", "Keputusan", "Spesifikasi"]),
            ("Mengukur keberhasilan desain", 18, "Keberhasilan desain diukur, bukan dirasakan.\n\n## Metrik yang jujur\n\n- **Task success rate** — berapa persen pengguna menyelesaikan tugas.\n- **Time on task** — berapa lama sampai selesai.\n- **Error rate** — berapa kali salah langkah.\n- **SUS score** — persepsi kegunaan setelah dipakai.\n\nPilih satu metrik utama sebelum merancang, bukan setelah.", ["Pilih metrik sebelum desain", "Ukur task success", "SUS untuk persepsi"]),
        ],
    },
    {
        "slug": "ui-ux-usability",
        "title": "UI, UX & Usability",
        "subtitle": "Tiga lapis kualitas antarmuka",
        "track": "Fondasi",
        "level": "Dasar",
        "minutes": 52,
        "summary": "Membedah usability ke komponen yang bisa diuji: learnability, efficiency, memorability, errors, dan satisfaction.",
        "accent": "teal",
        "lessons": [
            ("Lima komponen usability", 18, "Usability bukan satu nilai, melainkan lima dimensi yang bisa saling bertentangan.\n\n## Dimensi\n\n- **Learnability** — seberapa cepat pengguna baru paham.\n- **Efficiency** — seberapa cepat pengguna mahir menyelesaikan tugas.\n- **Memorability** — seberapa mudah diingat setelah lama tidak dipakai.\n- **Errors** — seberapa sering dan seberapa fatal kesalahan.\n- **Satisfaction** — seberapa nyaman dipakai.\n\nOptimasi berlebihan pada satu dimensi sering merusak dimensi lain.", ["Lima dimensi", "Trade-off nyata", "Ukur per dimensi"]),
            ("Heuristik Nielsen dalam praktik", 20, "Sepuluh heuristik Nielsen berguna sebagai daftar periksa, bukan dogma.\n\n## Yang paling sering dilanggar\n\n1. **Visibility of system status** — tidak ada indikator proses.\n2. **Match with real world** — istilah internal bocor ke UI.\n3. **User control** — tidak ada jalan membatalkan.\n4. **Error prevention** — validasi baru muncul setelah submit.\n\nAudit heuristik paling cepat dilakukan berpasangan, bukan sendirian.", ["Status sistem terlihat", "Bahasa pengguna", "Cegah sebelum validasi"]),
            ("Aksesibilitas sebagai baseline", 14, "Aksesibilitas bukan fitur tambahan, tapi batas bawah kualitas.\n\n## Target minimum\n\n- Rasio kontras teks minimal **4.5:1** untuk teks normal.\n- Semua kontrol bisa dijangkau keyboard dengan fokus terlihat.\n- Setiap gambar punya teks alternatif yang bermakna.\n- Pesan error dibacakan pembaca layar, bukan hanya berwarna merah.\n\nWarna tidak boleh jadi satu-satunya pembawa makna.", ["Kontras 4.5:1", "Fokus terlihat", "Jangan hanya warna"]),
        ],
    },
    {
        "slug": "alat-bantu-desain",
        "title": "Alat Bantu Desain",
        "subtitle": "Dari kertas ke file yang bisa dikerjakan",
        "track": "Praktik",
        "level": "Dasar",
        "minutes": 45,
        "summary": "Memilih alat berdasarkan tahap kerja: eksplorasi, penyusunan, prototipe, dan kolaborasi.",
        "accent": "sky",
        "lessons": [
            ("Memilih alat sesuai tahap", 15, "Alat yang salah di tahap yang salah memperlambat seluruh tim.\n\n## Pemetaan tahap\n\n- **Eksplorasi** — kertas, papan tulis, atau kanvas bebas.\n- **Penyusunan** — Figma, Penpot, atau alat berbasis komponen.\n- **Prototipe** — alat yang mendukung interaksi dan state.\n- **Kolaborasi** — alat dengan komentar dan riwayat versi.\n\nJangan menyusun pixel di tahap eksplorasi.", ["Alat mengikuti tahap", "Eksplorasi jangan rapi dulu", "Versi harus terlacak"]),
            ("Struktur file yang sehat", 16, "File desain yang berantakan adalah utang teknis.\n\n## Aturan dasar\n\n- Satu file, satu alur kerja.\n- Halaman dipisah berdasarkan status: eksplorasi, final, arsip.\n- Komponen diberi nama berdasarkan fungsi, bukan penampilan.\n- Warna dan teks memakai token, tidak pernah nilai mentah.\n\nKalau engineer butuh bertanya nama komponen, struktur belum selesai.", ["Satu file satu alur", "Nama berdasarkan fungsi", "Token bukan nilai mentah"]),
            ("Dari desain ke spesifikasi", 14, "Spesifikasi yang baik menghilangkan pertanyaan, bukan menambah dokumen.\n\n## Isi minimum\n\n- State lengkap: default, hover, fokus, aktif, nonaktif, error, kosong, memuat.\n- Aturan spasi dan ukuran yang dipakai berulang.\n- Perilaku responsif di tiga titik patah utama.\n- Catatan aksesibilitas per komponen.\n\nSpesifikasi ditulis di tempat engineer akan membacanya.", ["State lengkap", "Tiga breakpoint", "Catatan a11y"]),
        ],
    },
    {
        "slug": "metode-ui-ux",
        "title": "Metode UI/UX",
        "subtitle": "Kerangka kerja yang bisa diulang",
        "track": "Proses",
        "level": "Menengah",
        "minutes": 50,
        "summary": "Design sprint, double diamond, dan lean UX: kapan dipakai dan apa risikonya.",
        "accent": "sky",
        "lessons": [
            ("Double Diamond", 16, "Double Diamond memisahkan divergensi dan konvergensi di dua fase.\n\n## Empat fase\n\n1. **Discover** — kumpulkan masalah sebanyak mungkin.\n2. **Define** — pilih satu masalah yang layak diselesaikan.\n3. **Develop** — buat banyak solusi.\n4. **Deliver** — uji dan kirim satu solusi.\n\nKesalahan umum: melompat dari Discover langsung ke Develop.", ["Divergen lalu konvergen", "Define jangan dilewati", "Uji sebelum kirim"]),
            ("Design Sprint lima hari", 18, "Design sprint memaksa keputusan dalam satu minggu.\n\n## Alur hari\n\n- **Senin** — peta masalah dan pilih target.\n- **Selasa** — sketsa solusi secara individu.\n- **Rabu** — putuskan dan buat storyboard.\n- **Kamis** — bangun prototipe realistis.\n- **Jumat** — uji ke lima pengguna.\n\nSprint gagal bila targetnya lebih dari satu.", ["Satu target", "Sketsa individu dulu", "Lima pengguna cukup"]),
            ("Lean UX dan asumsi", 16, "Lean UX mengubah asumsi menjadi eksperimen kecil.\n\n## Siklus\n\nAsumsi → hipotesis → eksperimen → belajar → ulangi.\n\nTulis asumsi dalam satu kalimat yang bisa diuji: *Kami percaya [pengguna] akan [perilaku] bila [perubahan], diukur lewat [metrik].*\n\nAsumsi yang tidak bisa diuji bukan asumsi, tapi pendapat.", ["Asumsi harus bisa diuji", "Satu kalimat satu hipotesis", "Ukur lalu putuskan"]),
        ],
    },
    {
        "slug": "design-thinking",
        "title": "Design Thinking",
        "subtitle": "Empati yang diuji, bukan diklaim",
        "track": "Proses",
        "level": "Menengah",
        "minutes": 46,
        "summary": "Lima tahap design thinking dan cara menghindari jebakan empati palsu.",
        "accent": "amber",
        "lessons": [
            ("Lima tahap", 15, "Design thinking adalah urutan, bukan lambang.\n\n## Tahap\n\nEmpathize → Define → Ideate → Prototype → Test.\n\nSifatnya iteratif: hasil pengujian mengirim kamu kembali ke Define.\n\nYang sering hilang: bukti empati. Tanpa catatan wawancara, tahap pertama hanya asumsi.", ["Iteratif", "Empati butuh bukti", "Uji menutup siklus"]),
            ("Empati tanpa bukti", 16, "Empati palsu terasa benar karena dibuat dari pengalaman pribadi.\n\n## Tanda empati lemah\n\n- Persona tanpa kutipan asli.\n- Masalah dirumuskan dari fitur, bukan dari kesulitan.\n- Tidak ada catatan observasi.\n\nPerbaikan termurah: lima wawancara singkat dan satu sesi observasi.", ["Kutipan asli", "Masalah bukan fitur", "Observasi nyata"]),
            ("Rumusan masalah", 15, "Rumusan masalah menentukan separuh kualitas solusi.\n\n## Pola yang berguna\n\n*[Pengguna] butuh cara untuk [kebutuhan] karena [alasan], tetapi [hambatan].*\n\nRumusan yang baik tidak memuat nama fitur. Kalau solusi sudah muncul di rumusan, ruang ideasi menyempit.", ["Tanpa nama fitur", "Sertakan hambatan", "Satu rumusan satu masalah"]),
        ],
    },
    {
        "slug": "ux-research",
        "title": "UX Research",
        "subtitle": "Bertanya dengan cara yang tidak menyesatkan",
        "track": "Riset",
        "level": "Menengah",
        "minutes": 55,
        "summary": "Metode kualitatif dan kuantitatif, penyusunan pertanyaan, dan cara membaca hasil tanpa bias.",
        "accent": "amber",
        "lessons": [
            ("Kualitatif vs kuantitatif", 18, "Dua jenis riset menjawab pertanyaan berbeda.\n\n## Perbandingan\n\n- **Kualitatif** — mengapa dan bagaimana. Sampel kecil, kedalaman tinggi.\n- **Kuantitatif** — berapa banyak dan seberapa sering. Sampel besar, generalisasi.\n\nMulai kualitatif untuk menemukan variabel, lanjutkan kuantitatif untuk mengukurnya.", ["Kualitatif untuk mengapa", "Kuantitatif untuk berapa", "Urutkan"]),
            ("Menulis pertanyaan wawancara", 19, "Pertanyaan yang baik membuka cerita, bukan memancing persetujuan.\n\n## Aturan\n\n- Tanya pengalaman terakhir, bukan opini umum.\n- Hindari pertanyaan mengarah: *bukankah lebih mudah kalau…*\n- Kejar contoh konkret: *kapan terakhir kali itu terjadi?*\n- Diam setelah bertanya; jeda menghasilkan detail.\n\nRencanakan lima pertanyaan inti, sisanya improvisasi.", ["Pengalaman terakhir", "Hindari pertanyaan mengarah", "Diam itu teknik"]),
            ("Sintesis hasil", 18, "Data mentah tidak berguna sampai dikelompokkan.\n\n## Langkah\n\n1. Transkrip dan beri kode pada kutipan.\n2. Kelompokkan kode menjadi tema.\n3. Hitung frekuensi tema.\n4. Tulis temuan sebagai kalimat yang bisa ditindaklanjuti.\n\nSimpan kutipan asli di dekat setiap temuan; itu bukti yang akan diminta saat presentasi.", ["Kode lalu tema", "Frekuensi tema", "Kutipan sebagai bukti"]),
        ],
    },
    {
        "slug": "persona-journey-map",
        "title": "Persona & Journey Map",
        "subtitle": "Alat komunikasi, bukan hiasan",
        "track": "Riset",
        "level": "Menengah",
        "minutes": 44,
        "summary": "Membuat persona yang dipakai tim dan peta perjalanan yang menemukan titik gesek.",
        "accent": "amber",
        "lessons": [
            ("Persona yang berguna", 14, "Persona berguna bila bisa mengubah keputusan.\n\n## Isi minimum\n\n- Tujuan yang terukur.\n- Hambatan nyata beserta kutipan.\n- Konteks pemakaian: perangkat, waktu, tempat.\n\nKalau persona tidak pernah dipakai untuk menolak sebuah ide, persona itu gagal.", ["Ubah keputusan", "Tujuan terukur", "Konteks nyata"]),
            ("Journey map", 15, "Journey map memetakan pengalaman lintas waktu, bukan lintas layar.\n\n## Baris wajib\n\n- Tahap perjalanan.\n- Aksi pengguna.\n- Titik sentuh.\n- Emosi.\n- Titik gesek.\n\nTitik gesek adalah keluaran utama; di situlah peluang desain berada.", ["Lintas waktu", "Emosi per tahap", "Fokus titik gesek"]),
            ("Dari peta ke prioritas", 15, "Peta tanpa prioritas hanya dokumentasi.\n\n## Penilaian\n\nBeri skor setiap titik gesek: **dampak** (1-5) dikali **frekuensi** (1-5).\n\nUrutkan, lalu pilih tiga teratas untuk siklus berikutnya. Sisanya masuk backlog, bukan diabaikan diam-diam.", ["Dampak x frekuensi", "Tiga prioritas", "Sisanya backlog"]),
        ],
    },
    {
        "slug": "arsitektur-informasi",
        "title": "Arsitektur Informasi",
        "subtitle": "Struktur yang bisa ditebak",
        "track": "Desain",
        "level": "Menengah",
        "minutes": 48,
        "summary": "Card sorting, navigasi, dan penamaan yang membuat pengguna tidak perlu menghafal.",
        "accent": "teal",
        "lessons": [
            ("Card sorting", 16, "Card sorting mengungkap model mental pengguna.\n\n## Dua jenis\n\n- **Terbuka** — pengguna membuat kategori sendiri.\n- **Tertutup** — pengguna memasukkan kartu ke kategori yang sudah ada.\n\nMulai terbuka untuk menemukan nama kategori, lanjutkan tertutup untuk memvalidasi.", ["Terbuka lalu tertutup", "Nama dari pengguna", "Validasi struktur"]),
            ("Pola navigasi", 16, "Navigasi yang baik mengurangi jumlah keputusan.\n\n## Pola umum\n\n- **Hierarki** — untuk konten berlapis.\n- **Hub and spoke** — untuk tugas terpusat.\n- **Pencarian** — untuk katalog besar.\n\nSertakan jejak lokasi (breadcrumb) bila kedalaman lebih dari dua tingkat.", ["Kurangi keputusan", "Pilih pola sesuai isi", "Breadcrumb saat dalam"]),
            ("Penamaan", 16, "Nama menu adalah bagian dari desain, bukan urusan konten.\n\n## Aturan\n\n- Pakai kata yang dipakai pengguna, bukan istilah internal.\n- Satu konsep satu nama, konsisten di seluruh produk.\n- Hindari nama yang butuh penjelasan tambahan.\n\nUji nama dengan uji lima detik: apakah pengguna bisa menebak isi menu?", ["Kata pengguna", "Satu konsep satu nama", "Uji lima detik"]),
        ],
    },
    {
        "slug": "wireframe-prototyping",
        "title": "Wireframe & Prototyping",
        "subtitle": "Menguji ide sebelum mahal",
        "track": "Desain",
        "level": "Menengah",
        "minutes": 50,
        "summary": "Dari kerangka abu-abu ke prototipe yang bisa diuji tanpa membuang waktu di detail visual.",
        "accent": "teal",
        "lessons": [
            ("Tingkat kesetiaan", 16, "Kesetiaan prototipe harus sesuai pertanyaan yang diuji.\n\n## Tiga tingkat\n\n- **Low fidelity** — struktur dan alur.\n- **Mid fidelity** — hierarki dan label.\n- **High fidelity** — visual dan interaksi akhir.\n\nMenguji alur dengan prototipe high fidelity membuat pengguna bereaksi pada warna, bukan pada alur.", ["Sesuaikan dengan pertanyaan", "Mulai rendah", "Detail visual belakangan"]),
            ("Alur yang bisa diuji", 17, "Prototipe yang baik punya satu jalur utama yang jelas.\n\n## Persiapan\n\n- Tentukan tugas uji dalam satu kalimat.\n- Siapkan jalur alternatif bila pengguna salah langkah.\n- Sediakan titik berhenti untuk mencatat.\n\nJangan menjelaskan cara memakai prototipe; biarkan pengguna menemukannya.", ["Satu tugas satu alur", "Siapkan jalur alternatif", "Jangan menjelaskan"]),
            ("Iterasi cepat", 17, "Iterasi tercepat terjadi saat perubahan kecil dan sering.\n\n## Ritme\n\nUji tiga pengguna → perbaiki satu masalah terbesar → uji lagi.\n\nTiga pengguna cukup untuk menemukan mayoritas masalah kegunaan; jumlah besar dipakai untuk mengukur, bukan menemukan.", ["Tiga pengguna", "Satu masalah terbesar", "Uji ulang"]),
        ],
    },
    {
        "slug": "design-system",
        "title": "Design System",
        "subtitle": "Konsistensi yang bisa diwariskan",
        "track": "Desain",
        "level": "Lanjut",
        "minutes": 52,
        "summary": "Token, komponen, dan dokumentasi yang menjaga produk tetap konsisten saat tim bertambah.",
        "accent": "sky",
        "lessons": [
            ("Token desain", 18, "Token memisahkan keputusan dari nilai mentah.\n\n## Lapisan\n\n- **Primitif** — nilai mentah: `teal-600 = #0D9488`.\n- **Semantik** — peran: `color-action = teal-600`.\n- **Komponen** — pemakaian: `button-bg = color-action`.\n\nKomponen hanya boleh memakai token semantik, tidak pernah primitif.", ["Tiga lapisan token", "Komponen pakai semantik", "Nilai mentah terlarang"]),
            ("Komponen dan state", 17, "Komponen tanpa state lengkap akan dipaksa oleh engineer.\n\n## State wajib\n\ndefault, hover, fokus, aktif, nonaktif, memuat, error, kosong.\n\nDokumentasikan juga ukuran, batas panjang teks, dan perilaku saat konten terlalu panjang.", ["Delapan state", "Batas teks", "Perilaku overflow"]),
            ("Dokumentasi yang dipakai", 17, "Dokumentasi design system dinilai dari seberapa sering dibuka.\n\n## Isi yang dicari orang\n\n- Contoh langsung yang bisa disalin.\n- Aturan kapan dipakai dan kapan tidak.\n- Catatan aksesibilitas.\n- Riwayat perubahan.\n\nSetiap komponen butuh satu contoh salah dan satu contoh benar.", ["Contoh bisa disalin", "Kapan tidak dipakai", "Riwayat versi"]),
        ],
    },
    {
        "slug": "ux-testing",
        "title": "UX Testing",
        "subtitle": "Menguji tanpa menuntun",
        "track": "Evaluasi",
        "level": "Lanjut",
        "minutes": 54,
        "summary": "Merancang sesi uji, memandu tanpa menuntun, dan melaporkan temuan yang bisa ditindaklanjuti.",
        "accent": "amber",
        "lessons": [
            ("Merancang sesi uji", 18, "Sesi uji yang baik selesai dalam 30-45 menit.\n\n## Susunan\n\n1. Pemanasan (5 menit).\n2. Tugas utama (20 menit).\n3. Pertanyaan susulan (10 menit).\n4. Kuesioner singkat (5 menit).\n\nTulis skenario dalam bahasa pengguna, bukan bahasa sistem.", ["30-45 menit", "Skenario bahasa pengguna", "Kuesioner penutup"]),
            ("Memandu tanpa menuntun", 18, "Fasilitator yang banyak bicara menghasilkan data yang buruk.\n\n## Frasa aman\n\n- *Apa yang kamu pikirkan saat ini?*\n- *Apa yang akan kamu lakukan selanjutnya?*\n- *Boleh tunjukkan di mana kamu mencari?*\n\nHindari mengiyakan, mengoreksi, atau menawarkan jalan keluar.", ["Frasa aman", "Jangan mengoreksi", "Biarkan tersesat sebentar"]),
            ("Melaporkan temuan", 18, "Laporan uji dibaca untuk keputusan, bukan untuk arsip.\n\n## Struktur\n\n1. Tujuan dan metode.\n2. Tiga masalah terbesar dengan bukti.\n3. Dampak terhadap tugas.\n4. Rekomendasi berurutan.\n\nSetiap temuan butuh kutipan atau rekaman sebagai bukti.", ["Tiga masalah terbesar", "Bukti per temuan", "Rekomendasi berurutan"]),
        ],
    },
    {
        "slug": "handoff-portfolio",
        "title": "Handoff & Portofolio",
        "subtitle": "Menutup proyek dengan rapi",
        "track": "Evaluasi",
        "level": "Lanjut",
        "minutes": 42,
        "summary": "Serah terima ke engineer, dokumentasi keputusan, dan cara menulis studi kasus yang meyakinkan.",
        "accent": "amber",
        "lessons": [
            ("Serah terima", 14, "Handoff yang baik mengurangi rapat, bukan menambah dokumen.\n\n## Paket serah terima\n\n- File final dengan nama versi jelas.\n- Daftar komponen dan state.\n- Catatan perilaku responsif.\n- Daftar pertanyaan terbuka beserta pemiliknya.\n\nSertakan apa yang **belum** diputuskan; itu yang paling sering menimbulkan rework.", ["Versi jelas", "Daftar terbuka", "Pemilik keputusan"]),
            ("Dokumentasi keputusan", 14, "Keputusan tanpa catatan akan diperdebatkan ulang.\n\n## Format singkat\n\n- **Konteks** — apa yang memaksa keputusan ini.\n- **Pilihan** — minimal dua alternatif.\n- **Keputusan** — yang dipilih.\n- **Konsekuensi** — yang harus diterima.\n\nSatu halaman per keputusan besar sudah cukup.", ["Konteks dan pilihan", "Konsekuensi ditulis", "Satu halaman"]),
            ("Studi kasus", 14, "Studi kasus menjual proses berpikir, bukan gambar akhir.\n\n## Urutan\n\n1. Masalah dan batasan.\n2. Riset dan temuan kunci.\n3. Keputusan desain dan alasannya.\n4. Hasil terukur.\n5. Refleksi: apa yang akan diubah.\n\nAngka hasil lebih meyakinkan daripada mockup tambahan.", ["Proses berpikir", "Hasil terukur", "Refleksi jujur"]),
        ],
    },
]


def init_db() -> None:
    """Buat skema dan isi data awal bila database masih kosong."""
    ensure_dirs()
    with get_db() as conn:
        conn.executescript(SCHEMA)
        _seed(conn)


def _seed(conn: sqlite3.Connection) -> None:
    has_modules = conn.execute("SELECT COUNT(*) AS n FROM modules").fetchone()["n"]
    if has_modules:
        return

    stamp = now_iso()
    for order, mod in enumerate(MODULES, start=1):
        module_id = f"m{order:02d}"
        conn.execute(
            "INSERT INTO modules (id, slug, title, subtitle, track, level, est_minutes, order_index, summary, accent)"
            " VALUES (?,?,?,?,?,?,?,?,?,?)",
            (module_id, mod["slug"], mod["title"], mod["subtitle"], mod["track"], mod["level"],
             mod["minutes"], order, mod["summary"], mod["accent"]),
        )
        for l_order, (title, minutes, body, takeaways) in enumerate(mod["lessons"], start=1):
            slug = _slugify(title)
            conn.execute(
                "INSERT INTO lessons (id, module_id, slug, title, order_index, minutes, body, takeaways)"
                " VALUES (?,?,?,?,?,?,?,?)",
                (f"{module_id}-l{l_order}", module_id, slug, title, l_order, minutes, body,
                 json.dumps(takeaways, ensure_ascii=False)),
            )

    # Akun demo supaya halaman bisa langsung dicoba
    user_id = conn.execute(
        "INSERT INTO users (email, name, password_hash, bio, prefs, created_at) VALUES (?,?,?,?,?,?)",
        (
            "demo@nodes.id",
            "Andi Prasetyo",
            hash_password("Nodes#2026"),
            "Mahasiswa Teknik Informatika. Sedang mendalami design system dan riset pengguna.",
            json.dumps({"theme": "light", "language": "id", "reduce_motion": False, "email_digest": True}),
            stamp,
        ),
    ).lastrowid

    # Progres awal: 3 modul pertama selesai sebagian
    done_lessons = ["m01-l1", "m01-l2", "m01-l3", "m02-l1", "m02-l2", "m03-l1"]
    for lesson_id in done_lessons:
        conn.execute(
            "INSERT INTO progress (user_id, lesson_id, status, note, updated_at) VALUES (?,?,?,?,?)",
            (user_id, lesson_id, "done", "", stamp),
        )

    canvas_seed = {
        "version": 1,
        "frame": {"width": 1440, "height": 900, "label": "Hero / Desktop"},
        "layers": [
            {"id": "L1", "type": "rect", "name": "Hero background", "x": 0, "y": 0, "w": 1440, "h": 620,
             "fill": "#F8FAFC", "radius": 0},
            {"id": "L2", "type": "text", "name": "Headline", "x": 96, "y": 168, "w": 720, "h": 168,
             "text": "Belajar desain dengan membangun.", "size": 64, "weight": 700, "color": "#0F172A"},
            {"id": "L3", "type": "button", "name": "CTA utama", "x": 96, "y": 372, "w": 216, "h": 56,
             "text": "Mulai belajar", "fill": "#0D9488", "radius": 12},
        ],
        "palette": {"primary": "#0D9488", "ink": "#0F172A", "surface": "#FFFFFF"},
        "updatedBy": "seed",
    }
    conn.execute(
        "INSERT INTO projects (id, user_id, name, kind, data, created_at, updated_at) VALUES (?,?,?,?,?,?,?)",
        ("p_demo_hero", user_id, "Hero — Landing v3", "canvas", json.dumps(canvas_seed, ensure_ascii=False), stamp, stamp),
    )

    room_id = "r_demo_review"
    conn.execute(
        "INSERT INTO rooms (id, owner_id, title, share_code, status, created_at) VALUES (?,?,?,?,?,?)",
        (room_id, user_id, "Review: Design System Components", secrets.token_urlsafe(6), "open", stamp),
    )
    conn.execute(
        "INSERT INTO room_members (room_id, user_id, role, joined_at) VALUES (?,?,?,?)",
        (room_id, user_id, "owner", stamp),
    )
    conn.execute(
        "INSERT INTO votes (room_id, user_id, option_id, created_at) VALUES (?,?,?,?)",
        (room_id, user_id, "hero-b", stamp),
    )
    for body, x, y in [
        ("Padding kanan terasa sempit dibanding kiri, coba samakan 96px.", 62, 34),
        ("Kontras label di tombol sekunder di bawah 4.5:1, perlu digelapkan.", 41, 72),
    ]:
        conn.execute(
            "INSERT INTO comments (room_id, user_id, body, x, y, resolved, created_at) VALUES (?,?,?,?,?,?,?)",
            (room_id, user_id, body, x, y, 0, stamp),
        )
    for kind, message in [
        ("lesson", "Menyelesaikan sesi “Heuristik Nielsen dalam praktik”."),
        ("canvas", "Menyimpan kanvas “Hero — Landing v3”."),
        ("collab", "Membuka ruang review Design System Components."),
    ]:
        conn.execute(
            "INSERT INTO activity (user_id, kind, message, created_at) VALUES (?,?,?,?)",
            (user_id, kind, message, stamp),
        )
