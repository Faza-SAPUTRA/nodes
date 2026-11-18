# Jawaban Soal UTS IMK 2627 — Bagian Programmer

**Nama Project:** NODES (Nusantara Online Design Education System)
**Matakuliah:** Interaksi Manusia dan Komputer (IMK)
**Semester:** Genap 2026/2027

---

## Soal 1: Jelaskan secara detail mengenai pemilihan Software yang digunakan dalam membangun system tersebut, dan mengapa menggunakan software tersebut?

### A. Software Frontend (Sisi Klien/Browser)

#### 1. React 18 — Library UI
React dipilih sebagai library utama untuk membangun antarmuka pengguna (User Interface) karena:
- **Komponen Reusable:** React menggunakan arsitektur berbasis komponen, sehingga setiap elemen UI (tombol, kartu modul, sidebar, form) bisa dibuat sekali dan dipakai ulang di seluruh halaman. Contoh: komponen `ModuleCard` dipakai di halaman Dashboard maupun Katalog Modul.
- **Virtual DOM:** React menggunakan Virtual DOM yang hanya mengubah bagian halaman yang berubah, sehingga performa tetap cepat meskipun data sering berubah (misalnya saat real-time update di fitur kolaborasi).
- **Ekosistem Besar:** Komunitas React sangat besar, sehingga banyak library pendukung yang tersedia dan dokumentasinya lengkap.
- **Lazy Loading:** React mendukung `React.lazy()` untuk memuat halaman secara on-demand, sehingga halaman awal (Landing Page) bisa tampil lebih cepat karena kode halaman lain belum dimuat.

#### 2. TypeScript 5 — Bahasa Pemrograman
TypeScript dipilih sebagai pengganti JavaScript murni karena:
- **Type Safety:** TypeScript mendeteksi kesalahan tipe data sebelum program dijalankan (saat compile-time), mengurangi bug yang sulit ditemukan.
- **IntelliSense & Autocomplete:** IDE bisa memberikan saran kode yang lebih akurat karena semua tipe data terdefinisi, mempercepat proses development.
- **Maintainability:** Dengan tipe yang jelas, kode lebih mudah dipahami oleh anggota tim lain. Contoh: tipe `User`, `Module`, `Project` didefinisikan di folder `src/lib/types.ts`.

#### 3. Vite 6 — Build Tool & Dev Server
Vite dipilih sebagai pengganti Webpack karena:
- **Hot Module Replacement (HMR) Instan:** Perubahan kode langsung terlihat di browser dalam hitungan milidetik tanpa perlu reload seluruh halaman.
- **Build Cepat:** Vite menggunakan esbuild (berbasis Go) untuk bundling yang jauh lebih cepat dibanding Webpack.
- **Proxy API:** Vite menyediakan fitur proxy bawaan, sehingga request ke `/api` di frontend secara otomatis diteruskan ke server backend FastAPI di `http://127.0.0.1:8010`, menghindari masalah CORS saat development.

#### 4. React Router DOM 6 — Navigasi Halaman
Dipilih untuk mengelola navigasi antar halaman secara client-side (SPA) karena:
- **Tanpa Reload:** Perpindahan halaman (misalnya dari Dashboard ke Katalog Modul) terjadi instan tanpa memuat ulang seluruh halaman dari server.
- **Nested Routes:** Mendukung rute bersarang — semua halaman di bawah `/app` (Dashboard, Modul, Kanvas, dll.) berbagi layout sidebar yang sama melalui komponen `AppShell`.
- **Protected Routes:** Mudah membuat guard navigasi — halaman `/app/*` hanya bisa diakses pengguna yang sudah login, pengguna yang belum login otomatis diarahkan ke `/masuk`.

#### 5. Lucide React — Library Ikon
Dipilih karena:
- **Ringan & Tree-shakeable:** Hanya ikon yang dipakai yang masuk ke bundle final, tidak membebani ukuran file.
- **Konsisten:** Semua ikon memiliki gaya visual yang sama (stroke width, ukuran), menjaga konsistensi desain.

### B. Software Backend (Sisi Server)

#### 6. Python + FastAPI — Framework Backend
FastAPI dipilih sebagai framework backend karena:
- **Performa Tinggi:** FastAPI adalah salah satu framework Python tercepat karena berbasis ASGI (Asynchronous Server Gateway Interface) dan menggunakan Uvicorn sebagai server.
- **Validasi Otomatis:** Menggunakan Pydantic untuk validasi data request secara otomatis. Jika data yang dikirim klien tidak sesuai skema, server langsung mengembalikan pesan error yang jelas per field.
- **Dokumentasi API Otomatis:** FastAPI otomatis menghasilkan dokumentasi Swagger/OpenAPI, sehingga programmer frontend bisa langsung melihat endpoint yang tersedia.
- **Modular Router:** Endpoint API diorganisir dalam modul terpisah (`auth.py`, `content.py`, `projects.py`, `collab.py`, `profile.py`, `uploads.py`), sehingga kode terstruktur rapi.

#### 7. SQLite — Database
SQLite dipilih sebagai database karena:
- **Zero Configuration:** Tidak perlu instalasi server database terpisah (seperti MySQL/PostgreSQL). Database berupa satu file (`nodes.db`) yang langsung bisa dipakai.
- **Portable:** File database bisa dipindahkan bersama project, memudahkan deployment dan demo.
- **Cukup untuk Skala Project:** Untuk project edukasi dengan skala pengguna yang tidak terlalu besar, SQLite sudah memadai dari segi performa.
- **WAL Mode:** Diaktifkan untuk memungkinkan pembacaan dan penulisan secara bersamaan tanpa saling memblokir.

#### 8. Uvicorn — ASGI Server
Uvicorn digunakan sebagai server yang menjalankan aplikasi FastAPI karena:
- **Asynchronous:** Mendukung request asinkron, sehingga satu server bisa menangani banyak koneksi bersamaan.
- **Ringan:** Sangat efisien dalam penggunaan memori.

### C. Software Development Tools

| Software | Fungsi |
|----------|--------|
| **Visual Studio Code** | Code editor utama dengan ekstensi TypeScript, Python, Tailwind |
| **Git & GitHub** | Version control dan kolaborasi tim |
| **Node.js & npm** | Runtime JavaScript dan package manager untuk frontend |
| **Python 3.13** | Runtime bahasa Python untuk backend |
| **PlantUML** | Membuat diagram STN (State Transition Network) |
| **Browser DevTools** | Debugging dan inspeksi UI di browser |

---

## Soal 2: Jelaskan secara detail mengenai Arsitektur dan Prosedur Program pada project yang kalian kerjakan?

### A. Arsitektur Program

NODES menggunakan arsitektur **Client-Server** dengan pola **Single Page Application (SPA)** di sisi frontend dan **REST API** di sisi backend.

```
┌──────────────────────────────────────────────────────────┐
│                    BROWSER (CLIENT)                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │               React Application                   │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌───────────┐ │   │
│  │  │   Pages    │  │  Components │  │    UI      │ │   │
│  │  │ (8 halaman)│  │ (reusable)  │  │ (tombol,  │ │   │
│  │  │            │  │             │  │  input,   │ │   │
│  │  │ Landing    │  │ AppShell    │  │  modal)   │ │   │
│  │  │ Auth       │  │ Sidebar     │  │           │ │   │
│  │  │ Dashboard  │  │ Topbar      │  │           │ │   │
│  │  │ Modules    │  │             │  │           │ │   │
│  │  │ Detail     │  │             │  │           │ │   │
│  │  │ Canvas     │  │             │  │           │ │   │
│  │  │ Collab     │  │             │  │           │ │   │
│  │  │ Profile    │  │             │  │           │ │   │
│  │  └────────────┘  └─────────────┘  └───────────┘ │   │
│  │                                                   │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │         Lib (Utilitas & Logika)              │  │   │
│  │  │  auth.tsx  →  Kelola sesi login/logout      │  │   │
│  │  │  api.ts    →  HTTP client + error handling  │  │   │
│  │  │  types.ts  →  Tipe data TypeScript          │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                          │                               │
│                   fetch('/api/...')                       │
│                   (HTTP Request)                          │
└──────────────────────────┼───────────────────────────────┘
                           │
              ─────────────┼──────────────
                     INTERNET / LOCALHOST
              ─────────────┼──────────────
                           │
┌──────────────────────────▼───────────────────────────────┐
│                SERVER (BACKEND - FastAPI)                  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                   main.py (Entry Point)              │ │
│  │   - CORS Middleware                                  │ │
│  │   - Error Handler (HTTP, Validasi, Unhandled)        │ │
│  │   - SPA Fallback (sajikan index.html)                │ │
│  └────────────────────────┬────────────────────────────┘ │
│                           │                               │
│  ┌────────────────────────▼────────────────────────────┐ │
│  │               API Routers (Endpoint)                 │ │
│  │                                                      │ │
│  │   /api/auth/*      → auth.py     (login, register,  │ │
│  │                                    me, logout)       │ │
│  │   /api/content/*   → content.py  (daftar modul,     │ │
│  │                                    detail sesi,      │ │
│  │                                    progress, catatan)│ │
│  │   /api/projects/*  → projects.py (CRUD proyek kanvas)│ │
│  │   /api/collab/*    → collab.py   (ruang, komentar,   │ │
│  │                                    chat, vote)       │ │
│  │   /api/profile/*   → profile.py  (update profil,     │ │
│  │                                    password, prefs)  │ │
│  │   /api/uploads/*   → uploads.py  (upload gambar)     │ │
│  └────────────────────────┬────────────────────────────┘ │
│                           │                               │
│  ┌────────────────────────▼────────────────────────────┐ │
│  │              Database Layer (db.py)                   │ │
│  │                                                      │ │
│  │   SQLite (nodes.db) — 10 Tabel:                      │ │
│  │   users, modules, lessons, progress,                 │ │
│  │   projects, rooms, room_members,                     │ │
│  │   comments, votes, messages, activity                │ │
│  │                                                      │ │
│  │   + Security (security.py) — hash password, JWT      │ │
│  │   + Config (config.py) — konfigurasi terpusat        │ │
│  └──────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
```

### B. Struktur Database (10 Tabel)

| Tabel | Fungsi | Relasi |
|-------|--------|--------|
| `users` | Menyimpan data akun (email, nama, password hash, bio, avatar, preferensi) | PK: id |
| `modules` | Menyimpan data modul belajar (judul, track, level, durasi) | PK: id |
| `lessons` | Menyimpan sesi materi per modul (judul, konten Markdown, takeaways) | FK: module_id → modules |
| `progress` | Tracking progres belajar per user per sesi (status selesai/belum, catatan) | FK: user_id → users, lesson_id → lessons |
| `projects` | Menyimpan proyek kanvas (nama, data JSON layer & elemen) | FK: user_id → users |
| `rooms` | Menyimpan ruang kolaborasi (judul, kode share, status) | FK: owner_id → users |
| `room_members` | Anggota per ruang kolaborasi (role: owner/viewer) | FK: room_id → rooms, user_id → users |
| `comments` | Pin komentar di desain (posisi X/Y, isi, status resolved) | FK: room_id → rooms, user_id → users |
| `votes` | Voting A/B di ruang kolaborasi | FK: room_id → rooms, user_id → users |
| `messages` | Pesan chat di ruang kolaborasi | FK: room_id → rooms, user_id → users |
| `activity` | Log aktivitas pengguna (selesai sesi, simpan kanvas, dll.) | FK: user_id → users |

### C. Prosedur Program (Alur Kerja Sistem)

#### 1. Prosedur Akses Awal (Landing → Auth)
```
User buka URL "/"
  → Vite serve index.html
  → React mount komponen App
  → React Router render LandingPage
  → User klik "Mulai Belajar"
  → React Router navigasi ke /daftar (tanpa reload)
  → Render AuthPage (mode register)
```

#### 2. Prosedur Registrasi
```
User isi form (nama, email, password)
  → Klik "Buat Akun"
  → Frontend validasi client-side (field kosong, format email)
  → Jika tidak valid → tampil error per field, proses berhenti
  → Jika valid → kirim POST /api/auth/register {name, email, password}
  → Backend (auth.py):
      1. Validasi ulang dengan Pydantic (email format, password min 8 char)
      2. Cek email belum terdaftar di tabel users
      3. Hash password dengan algoritma aman (security.py)
      4. INSERT ke tabel users
      5. Generate JWT token (berlaku 12 jam)
      6. Return {token, user}
  → Frontend terima response:
      1. Simpan token di localStorage
      2. Set state user di AuthContext
      3. Redirect ke /app (Dashboard)
```

#### 3. Prosedur Login
```
User isi form (email, password)
  → Klik "Masuk"
  → Kirim POST /api/auth/login {email, password, remember}
  → Backend:
      1. Cari user berdasarkan email
      2. Verifikasi password hash
      3. Jika gagal → cek batas percobaan (maks 5x, lock 5 menit)
      4. Jika sukses → generate JWT token
      5. Return {token, user}
  → Frontend: simpan token, set user, redirect ke Dashboard
```

#### 4. Prosedur Protected Route (Penjagaan Halaman)
```
User akses /app/* (halaman manapun yang butuh login)
  → Komponen Protected cek:
      1. Apakah token ada di localStorage?
      2. Jika tidak ada → redirect ke /masuk
      3. Jika ada → kirim GET /api/auth/me (dengan header Authorization: Bearer <token>)
      4. Server validasi JWT → jika expired/invalid → return 401
      5. Jika valid → return data user → render halaman yang diminta
```

#### 5. Prosedur Belajar Modul
```
User di Dashboard klik "Jelajahi Modul"
  → Navigasi ke /app/modul
  → Frontend kirim GET /api/content/modules
  → Server query tabel modules + hitung progress dari tabel progress
  → Return daftar modul dengan persentase progres
  → User klik kartu modul
  → Navigasi ke /app/modul/:slug
  → Frontend kirim GET /api/content/modules/:slug
  → Server query tabel lessons JOIN progress WHERE module.slug = :slug
  → Return detail modul + semua sesi + status per sesi
  → User baca materi → klik "Tandai selesai"
  → Frontend kirim POST /api/content/progress {lesson_id, status: "done"}
  → Server INSERT/UPDATE tabel progress
  → Frontend update UI (centang hijau pada sesi)
```

#### 6. Prosedur Kanvas Praktik
```
User buka /app/kanvas
  → Frontend kirim GET /api/projects?kind=canvas
  → Server query tabel projects WHERE user_id = current_user
  → Return daftar proyek
  → User klik "Proyek Baru" → isi nama → klik "Buat"
  → Frontend kirim POST /api/projects {name, kind: "canvas", data: {layers:[], palette:{}}}
  → Server INSERT ke tabel projects
  → User edit di canvas (tambah rectangle, text, ubah warna, drag)
  → State dikelola di React (tidak dikirim ke server tiap perubahan)
  → User klik "Simpan"
  → Frontend kirim PUT /api/projects/:id {data: <JSON seluruh canvas state>}
  → Server UPDATE tabel projects SET data = :data
  → Batas ukuran data: 512 KB per proyek
```

#### 7. Prosedur Kolaborasi
```
User buka /app/kolaborasi
  → Frontend kirim GET /api/collab/rooms
  → Server query tabel rooms JOIN room_members
  → Return daftar ruang yang user ikuti
  → User klik ruang atau buat ruang baru
  → Frontend kirim GET /api/collab/rooms/:id
  → Server return detail ruang + comments + votes + messages
  → User klik area desain → tulis komentar
  → Frontend kirim POST /api/collab/rooms/:id/comments {body, x, y}
  → Server INSERT ke tabel comments
  → User ketik chat → kirim
  → Frontend kirim POST /api/collab/rooms/:id/messages {body}
  → User klik vote (A/B)
  → Frontend kirim POST /api/collab/rooms/:id/votes {option_id}
```

#### 8. Prosedur Komunikasi Frontend-Backend

Semua komunikasi menggunakan **REST API** melalui HTTP dengan format JSON:

```
Request:
  - Method: GET / POST / PUT / DELETE
  - Header: Authorization: Bearer <JWT_TOKEN>
  - Body: JSON (untuk POST/PUT)

Response (sukses):
  - Status: 200 / 201 / 204
  - Body: JSON {data...}

Response (error):
  - Status: 400 / 401 / 404 / 422 / 500
  - Body: JSON {error: {code, message, fields}}
```

Contoh request-response:
```
→ POST /api/auth/login
  Body: {"email": "demo@nodes.id", "password": "Nodes#2026"}

← 200 OK
  Body: {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "demo@nodes.id",
      "name": "Andi Prasetyo",
      "bio": "Mahasiswa Teknik Informatika...",
      "avatar": null,
      "prefs": {"theme": "light", "language": "id"}
    }
  }
```

### D. Keamanan Sistem

| Aspek | Implementasi |
|-------|-------------|
| **Password** | Di-hash sebelum disimpan ke database (tidak pernah disimpan dalam bentuk plain text) |
| **Autentikasi** | Menggunakan JWT (JSON Web Token) dengan masa berlaku 12 jam |
| **Brute Force Protection** | Maksimal 5x percobaan login gagal, kemudian dikunci selama 5 menit |
| **CORS** | Hanya menerima request dari `localhost:5173` (frontend dev server) |
| **Validasi Input** | Validasi ganda: client-side (React) dan server-side (Pydantic) |
| **Error Handling** | Semua error dibungkus dalam format JSON yang konsisten, tidak pernah menampilkan stack trace ke klien |
| **Upload File** | Dibatasi 4 MB, hanya menerima tipe gambar (PNG, JPEG, WebP) |
| **Secret Key** | Disimpan di file terpisah (`secret.key`), tidak di-hardcode di kode |

