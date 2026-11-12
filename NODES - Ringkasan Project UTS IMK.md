# 📘 NODES — Ringkasan Project untuk UTS IMK 2627

> **NODES** = **Nusantara Online Design Education System**
> Platform belajar UI/UX gratis, terstruktur, berbasis web untuk mahasiswa Indonesia.

---

## 1. Gambaran Umum Project

NODES adalah platform edukasi berbasis web yang menyediakan:
- **Modul Belajar Terstruktur** — 16 sesi materi dari dasar hingga lanjutan
- **Kanvas Praktik** — editor desain interaktif (mirip Figma sederhana)
- **Ruang Kolaborasi** — review desain bersama, pin komentar, chat, & voting
- **Tracking Progres** — statistik belajar, badges, XP, streak harian

**Target Pengguna:** Mahasiswa Indonesia yang ingin belajar desain UI/UX dari nol.

---

## 2. Tech Stack & Software yang Digunakan

### Frontend
| Teknologi | Fungsi | Alasan Pemilihan |
|-----------|--------|------------------|
| **React 19** | Library UI komponen | Ekosistem besar, komponen reusable, virtual DOM cepat |
| **TypeScript** | Type-safe JavaScript | Mengurangi bug, autocomplete, maintainability |
| **Vite** | Build tool & dev server | Hot reload cepat, build optimal dibanding Webpack |
| **TailwindCSS** | Utility-first CSS | Styling cepat, konsisten, tanpa CSS file terpisah |
| **React Router DOM** | Client-side routing | SPA navigation tanpa reload halaman |
| **Zustand** | State management | Ringan, simple dibanding Redux, boilerplate minimal |
| **TanStack React Query** | Server state / caching | Auto-cache, refetch, loading state |
| **Framer Motion** | Animasi | Deklaratif, smooth transition antar halaman |
| **Fabric.js** | Canvas editor | Library canvas HTML5 untuk fitur Kanvas Praktik |
| **Lucide React** | Ikon SVG | Konsisten, ringan, tree-shakeable |
| **React Markdown** | Render konten modul | Konten materi ditulis dalam format Markdown |

### Backend (BaaS)
| Teknologi | Fungsi |
|-----------|--------|
| **Supabase** | Backend-as-a-Service — menyediakan Auth, Database PostgreSQL, Realtime WebSocket, Storage |

**Alasan memilih Supabase:**
- Gratis untuk skala project mahasiswa
- PostgreSQL (relational DB, bukan NoSQL)
- Auth built-in (email/password + OAuth Google/GitHub)
- Realtime subscription untuk fitur kolaborasi
- REST API otomatis tanpa perlu bikin backend manual

---

## 3. Arsitektur Program

### Arsitektur SPA (Single Page Application)

```
┌─────────────────────────────────────────────────────┐
│                    Browser Client                    │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  React UI │  │ React Router │  │   Zustand    │ │
│  │ Components│  │  (Navigasi)  │  │(Client State)│ │
│  └─────┬─────┘  └──────────────┘  └──────────────┘ │
│        │                                            │
│  ┌─────▼─────────────────────────────────────────┐  │
│  │        TanStack Query + Axios                  │  │
│  │        (Data Fetching & Caching)               │  │
│  └─────────────────┬─────────────────────────────┘  │
└────────────────────┼────────────────────────────────┘
                     │ HTTPS / WebSocket
┌────────────────────▼────────────────────────────────┐
│                 Supabase Cloud                       │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌──────┐ │
│  │   Auth   │ │ PostgreSQL │ │ Realtime │ │ Store│ │
│  │ Service  │ │  Database  │ │WebSocket │ │  age │ │
│  └──────────┘ └────────────┘ └──────────┘ └──────┘ │
└─────────────────────────────────────────────────────┘
```

### Prosedur Program (Alur Kerja)

1. **User buka URL** → React Router render halaman Landing Page
2. **User klik Masuk/Daftar** → Navigasi ke halaman Auth (SPA, tanpa reload)
3. **User submit form** → Axios kirim data ke Supabase Auth → validasi → token JWT
4. **Login sukses** → Zustand simpan session → redirect ke Dashboard (protected route)
5. **User navigasi** → React Router render halaman sesuai path, Sidebar highlight aktif
6. **Fetch data** → TanStack Query request ke Supabase REST API → cache response
7. **Kanvas Praktik** → Fabric.js render canvas HTML5, state disimpan di Zustand
8. **Kolaborasi** → Supabase Realtime WebSocket untuk chat & komentar live
9. **User logout** → Supabase Auth hapus session → redirect ke halaman Login

---

## 4. Struktur Menu & Navigasi

### Struktur Menu Hierarki

```
NODES Website
│
├── 🌐 Landing Page (/) — Publik
│   ├── Hero Section
│   ├── Section Masalah
│   ├── Section Fitur
│   ├── Section Cara Kerja
│   ├── Tombol "Masuk" → /masuk
│   └── Tombol "Mulai Belajar" → /daftar
│
├── 🔐 Auth (/masuk, /daftar) — Publik
│   ├── Tab Login (Form email & password)
│   └── Tab Register (Form nama, email, password)
│
└── 📱 App (/app) — Protected (perlu login)
    │
    ├── 📊 Dashboard (/app)
    │   ├── Greeting & Statistik
    │   ├── Lanjutkan Belajar (modul terakhir)
    │   ├── Modul Perjalananmu (grid modul)
    │   └── Quick Actions (Kanvas, Kolaborasi, Progres)
    │
    ├── 📚 Modul Belajar (/app/modul)
    │   ├── Search bar
    │   ├── Filter tab (Semua/Fondasi/Inti/Lanjutan/Proyek/Evaluasi)
    │   └── Grid kartu modul (16 sesi)
    │       └── 📖 Detail Modul (/app/modul/:slug)
    │           ├── Sidebar navigasi sub-bab
    │           ├── Konten materi (Markdown)
    │           ├── Tombol "Tandai selesai"
    │           └── Area catatan (textarea)
    │
    ├── 🎨 Kanvas Praktik (/app/kanvas)
    │   ├── Daftar proyek (sidebar kiri)
    │   ├── Modal "Proyek Baru"
    │   └── Editor Canvas
    │       ├── Toolbar (Select, Frame, Text, Hand, Pen)
    │       ├── Panel layer
    │       ├── Panel properti (X, Y, warna, font)
    │       └── Tombol Simpan
    │
    ├── 👥 Kolaborasi (/app/kolaborasi)
    │   ├── Daftar ruang & filter
    │   ├── Modal Undang/Buat ruang
    │   └── Ruang Aktif
    │       ├── Preview desain + pin komentar
    │       ├── Panel Chat
    │       └── Panel Voting (A vs B)
    │
    └── 👤 Profil & Pengaturan (/app/profil)
        ├── Tab Progres (statistik, heatmap)
        ├── Tab Badges (earned & locked)
        ├── Tab Proyek (kartu proyek canvas)
        └── Tab Pengaturan (profil, password, preferensi, hapus akun)
```

### Struktur Navigasi

**Tipe:** Navigasi Sidebar (tetap di sisi kiri layar)

| Menu Sidebar | Ikon | Path |
|-------------|------|------|
| Dashboard | LayoutDashboard | `/app` |
| Modul Belajar | BookOpen | `/app/modul` |
| Kanvas Praktik | Palette | `/app/kanvas` |
| Kolaborasi | Users | `/app/kolaborasi` |

**Navigasi Tambahan:**
- **Avatar profil** (di bawah sidebar) → `/app/profil`
- **Logo NODES** (di atas sidebar) → `/` (landing page)
- **Breadcrumb** di Detail Modul → kembali ke Katalog Modul
- **Top bar** → Search bar, notifikasi bell icon

---

## 5. Diagram Analisis yang Digunakan

### A. STN (State Transition Network) — 10 Diagram

Diagram STN menggambarkan **transisi state** pada setiap halaman, dengan format:
- **Atas garis panah** = Aksi User (apa yang user lakukan)
- **Bawah garis panah** = Reaksi Sistem (respons sistem)

| # | Diagram | Jumlah State | Jumlah Transisi |
|---|---------|:------------:|:---------------:|
| 1 | Main Program (Hierarchical) | 9 sub-diagram | 16 transisi |
| 2 | Landing Page | 4 state | 5 transisi |
| 3 | Halaman Login | 4 state | 9 transisi |
| 4 | Halaman Register | 5 state | 9 transisi |
| 5 | Dashboard | 1 state | 7 transisi |
| 6 | Katalog Modul | 3 state | 5 transisi |
| 7 | Detail Modul | 3 state | 7 transisi |
| 8 | Kanvas Praktik | 4 state | 9 transisi |
| 9 | Ruang Kolaborasi | 5 state | 9 transisi |
| 10 | Profil & Pengaturan | 4 state | 8 transisi |

**Contoh transisi STN (Dashboard):**
- Aksi: `klik "Jelajahi modul"` → Reaksi: `Tampil halaman Katalog Modul dengan daftar & filter`
- Aksi: `klik "Buka kanvas praktik"` → Reaksi: `Tampil daftar proyek kanvas`

### B. HTA (Hierarchical Task Analysis) — 5 Diagram

Diagram HTA mendekomposisi task utama menjadi sub-task yang lebih detail.

---

## 6. Klasifikasi Perancangan UI — ORIGINAL

### Mengapa Original?

1. **Design System Kustom** — Semua komponen UI dibangun dari nol tanpa menggunakan component library seperti Bootstrap, Material UI, atau Ant Design.

2. **Palet Warna Kustom:**
   ```
   Primary Background : #0a0a0a (hitam)
   Secondary BG       : #141414
   Accent Primary     : #22c55e (hijau NODES)
   Accent Secondary   : #16a34a
   Text Primary       : #ffffff
   Text Secondary     : #a1a1aa
   ```

3. **Branding Asli** — Nama "NODES", logo, identitas visual dibuat sendiri

4. **Layout & Komposisi Asli** — Tata letak setiap halaman di-design khusus untuk kebutuhan platform edukasi UI/UX

5. **Komponen Kustom** — 40+ komponen React kustom (Button, Card, Modal, Badge, Toggle, ProgressBar, Avatar, dll.) tanpa import dari library UI pihak ketiga

### Inspirasi (Bukan Duplikasi)
- **Figma** — Inspirasi untuk fitur Kanvas Praktik
- **Coursera/Dicoding** — Inspirasi untuk alur modul belajar
- **Google Classroom** — Inspirasi untuk fitur kolaborasi

> Platform ini mengikuti **konvensi desain modern** (dark theme, card-based layout, sidebar navigation) namun semua implementasi visual, branding, dan komponen adalah **karya asli**.

---

## 7. Struktur Komponen Program

```
src/
├── pages/                    ← 8 halaman utama
│   ├── LandingPage.tsx
│   ├── AuthPage.tsx
│   ├── DashboardPage.tsx
│   ├── ModulesPage.tsx
│   ├── ModuleDetailPage.tsx
│   ├── CanvasPage.tsx
│   ├── CollabPage.tsx
│   └── ProfilePage.tsx
│
├── components/               ← 40+ komponen reusable
│   ├── layout/               (AppLayout, Sidebar, Topbar)
│   ├── landing/              (Hero, Features, HowItWorks, CTA, Footer)
│   ├── auth/                 (LoginForm, RegisterForm)
│   ├── dashboard/            (StatsCards, ContinueLearning, QuickActions)
│   ├── modules/              (ModuleCard, FilterTabs, SearchBar)
│   ├── module-detail/        (SessionSidebar, ContentArea, NotesSection)
│   ├── canvas/               (CanvasEditor, LayerPanel, PropertiesPanel, Toolbar)
│   ├── collab/               (DesignPreview, ChatPanel, VotingPanel, CommentPin)
│   ├── profile/              (ProfileHeader, BadgesTab, SettingsTab)
│   └── ui/                   (Button, Input, Modal, Card, Badge, Toggle, dll.)
│
├── store/                    ← State management (Zustand)
│   ├── authStore.ts
│   ├── moduleStore.ts
│   ├── canvasStore.ts
│   ├── collabStore.ts
│   └── themeStore.ts
│
├── lib/                      ← Utility & config
│   ├── supabase.ts           (Supabase client)
│   ├── api.ts                (API helpers)
│   └── utils.ts              (General utilities)
│
├── types/                    ← TypeScript types
│   ├── user.ts
│   ├── module.ts
│   ├── canvas.ts
│   └── collab.ts
│
└── App.tsx                   ← Root component + routing
```

---

## 8. Fitur-Fitur Utama (Ringkas)

| Fitur | Deskripsi |
|-------|-----------|
| **Autentikasi** | Login/Register dengan email, OAuth Google & GitHub, session persist |
| **Dashboard** | Statistik belajar (modul terdaftar, sesi selesai, streak), lanjutkan belajar |
| **Modul Belajar** | 16 sesi terstruktur, filter kategori, search, tracking progress per sesi |
| **Detail Modul** | Baca materi Markdown, tandai selesai, catatan pribadi, navigasi sub-bab |
| **Kanvas Praktik** | Editor desain interaktif (rect, text, drag, layer, properti, undo/redo, simpan) |
| **Kolaborasi** | Ruang review desain, pin komentar pada desain, chat realtime, voting A/B |
| **Profil** | Edit profil, ganti password, badges/achievement, toggle preferensi, hapus akun |
| **Responsif** | Layout adaptif untuk mobile, tablet, dan desktop |
| **Dark Theme** | Tema gelap sebagai default dengan accent hijau |

