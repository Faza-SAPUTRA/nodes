# NODES — Platform E-Learning UI/UX Interaktif

> **Proyek Akhir Mata Kuliah Interaksi Manusia & Komputer (IMK)**
> Teknik Informatika — Institut Teknologi Indonesia

---

## 📌 Apa itu NODES?

**NODES** adalah prototipe high-fidelity web-based e-learning platform yang dirancang khusus untuk mata kuliah **UI/UX Design** di program studi Teknik Informatika. Platform ini menggabungkan materi pembelajaran terstruktur, canvas desain interaktif, dan fitur kolaborasi real-time dalam satu ekosistem.

Nama "NODES" merepresentasikan **titik-titik koneksi** dalam proses belajar — setiap sesi, setiap praktik, dan setiap kolaborasi adalah node yang saling terhubung membentuk pemahaman utuh tentang UI/UX Design.

---

## 🎯 Masalah yang Diselesaikan

| Masalah | Solusi NODES |
|---------|-------------|
| E-learning konvensional hanya menyediakan materi bacaan statis | Canvas interaktif untuk praktik langsung di browser |
| Tools belajar terfragmentasi (slide di satu tempat, tugas di tempat lain) | Satu platform terintegrasi: materi → praktik → review |
| Feedback dari dosen/teman terlambat | Kolaborasi real-time dengan komentar langsung di canvas |
| Progress belajar tidak terukur | Dashboard dengan tracking progress per sesi & sub-topik |

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | HTML5, CSS3 (Vanilla), JavaScript (ES6+) |
| **Styling** | CSS Custom Properties, Glassmorphism, Micro-animations |
| **Animasi** | GSAP 3.12 + ScrollTrigger, Lenis Smooth Scroll |
| **Font** | Inter (Google Fonts) |
| **Video Intro** | Remotion (React-based video framework) |
| **Deployment** | Static files (GitHub Pages ready) |

> **Catatan:** Ini adalah **high-fidelity mockup/prototype** — semua data bersifat dummy untuk keperluan presentasi dan demonstrasi UX flow.

---

## 📂 Struktur Proyek

```
nodes-learning/
├── index.html                  # Redirect ke landing page
├── assets/
│   ├── css/sidebar.css         # Shared sidebar component
│   ├── js/sidebar.js           # Sidebar toggle logic
│   └── images/                 # Logo, favicon, assets
├── pages/
│   ├── landing/                # Landing page (awwwards-level)
│   ├── auth/                   # Login & Register
│   ├── dashboard/              # Dashboard utama
│   ├── modules/                # Daftar 16 sesi modul
│   ├── module-detail/          # Detail modul (Sesi 5)
│   ├── canvas/                 # Canvas interaktif
│   ├── collab/                 # Kolaborasi real-time
│   └── profile/                # Profil mahasiswa
└── nodes-ads/                  # Remotion video intro (30 detik)
    ├── src/NodesAd.tsx          # Video composition
    └── public/                  # Audio SFX assets
```

---

## 📄 Halaman yang Tersedia (8 Pages)

### 1. 🏠 Landing Page (`pages/landing/`)
- Hero section dengan floating particles & parallax
- Lenis smooth scroll (buttery smooth feel)
- Magnetic buttons, text scramble effect
- Marquee topik RPS, challenge cards, bento feature grid
- Process steps (Cara Kerja), social proof, CTA

### 2. 🔐 Auth Page (`pages/auth/`)
- Login & Register dengan tab switching
- Form validation visual
- Glassmorphism card design

### 3. 📊 Dashboard (`pages/dashboard/`)
- Overview progress: 8/16 sesi selesai (50%)
- Current session: Sesi 9 — Design System
- Progress ring, recent activity, quick actions

### 4. 📚 Modules (`pages/modules/`)
- Grid 2 kolom menampilkan 16 sesi sesuai RPS
- Status: ✅ Selesai, 🔵 Aktif, 🔒 Terkunci
- Search & filter, progress emoji badges
- Visual panel di kanan (progress ring)

### 5. 📖 Module Detail (`pages/module-detail/`)
- Detail Sesi 5: Color Theory & Accessibility
- Node progress bar (5 sub-topik)
- Video placeholder, objectives, key concepts
- Interactive tabs: Materi, Latihan, Diskusi, Referensi

### 6. 🎨 Canvas (`pages/canvas/`)
- Simulasi design tool (terinspirasi Figma)
- Connected ke Sesi 9: Design System
- Toolbar, layers panel, zoom/pan controls
- Preview: color tokens, typography scale, buttons, cards

### 7. 👥 Collaboration (`pages/collab/`)
- Review session untuk Sesi 9: Design System
- Real-time comments & annotations
- Collaborator avatars, activity feed
- Module context badge

### 8. 👤 Profile (`pages/profile/`)
- Info mahasiswa (Andi Prasetyo — dummy)
- Learning progress bars per area
- Activity timeline (Sesi 7, 8, 9 milestones)
- Project showcase cards

---

## 📋 Kurikulum (Sesuai RPS Resmi)

| Sesi | Topik | Status |
|------|-------|--------|
| 01 | Pengantar UX & Prinsip Desain | ✅ Selesai |
| 02 | Analisis Pengguna & Persona | ✅ Selesai |
| 03 | Information Architecture | ✅ Selesai |
| 04 | Wireframing & Sketching | ✅ Selesai |
| 05 | Color Theory & Accessibility | ✅ Selesai |
| 06 | Typography & Readability | ✅ Selesai |
| 07 | Visual Hierarchy & Layout | ✅ Selesai |
| 08 | UTS — Evaluasi Tengah Semester | ✅ Selesai |
| 09 | Design System & Component Library | 🔵 Aktif |
| 10 | Prototyping & Micro-interaction | 🔒 Terkunci |
| 11 | Interaction Design & Motion | 🔒 Terkunci |
| 12 | Usability Testing | 🔒 Terkunci |
| 13 | Design Handoff & Documentation | 🔒 Terkunci |
| 14 | Studi Kasus & Redesign | 🔒 Terkunci |
| 15 | Portfolio & Presentasi | 🔒 Terkunci |
| 16 | UAS — Evaluasi Akhir Semester | 🔒 Terkunci |

---

## 🎬 Video Intro (Remotion)

Folder `nodes-ads/` berisi video intro 30 detik untuk dibuka sebelum presentasi. Dibuat dengan **Remotion** (React-based programmatic video).

### 5 Scene:
1. **Logo Reveal** (0-5s) — Particles + "nodes." spring animation + flash
2. **Problem Statement** (5-11s) — "E-Learning lama tidak dirancang untuk desainer" + 85% counter
3. **Solution Features** (11-18s) — 4 feature cards (16 Sesi, Canvas, Kolaborasi, Progress)
4. **Module Showcase** (18-23s) — Auto-scrolling 12 modul sesuai RPS
5. **Closing** (23-30s) — Logo + tagline + branding ITI

### Cara Render:
```bash
cd nodes-ads
npm install
npm run dev          # Preview di browser (localhost:3000)
npx remotion render NodesIntro out/nodes-intro.mp4   # Export MP4
```

---

## 🎨 Design System

### Warna Utama
| Token | Hex | Penggunaan |
|-------|-----|------------|
| `--teal` | `#0D9488` | Primary accent, CTA, links |
| `--teal-dark` | `#0F766E` | Hover states |
| `--teal-light` | `#14B8A6` | Secondary accent |
| `--ink` | `#0F172A` | Headings, dark text |
| `--ink-4` | `#64748B` | Body text |
| `--white` | `#FFFFFF` | Backgrounds |

### Typography
- **Font:** Inter (Google Fonts)
- **Headings:** 800 weight, -0.03em tracking
- **Body:** 400-500 weight, 1.6 line-height

### Design Principles
- Clean, light editorial style
- Teal accent on white background
- Micro-animations for engagement
- Awwwards-level motion design

---

## 🚀 Cara Menjalankan

1. **Clone repository:**
   ```bash
   git clone https://github.com/Faza-SAPUTRA/nodes-learning.git
   ```

2. **Buka langsung di browser:**
   ```
   Buka file: pages/landing/index.html
   ```
   > Tidak perlu server — semua static HTML/CSS/JS.

3. **Navigasi antar halaman:**
   - Landing → klik "Mulai Belajar" → Dashboard
   - Dashboard → sidebar menu → Modules, Canvas, Collab, Profile
   - Sidebar bisa collapse/expand

---

## 👥 Tim

| Nama | NIM | Role |
|------|-----|------|
| *(isi nama anggota tim)* | *(isi NIM)* | *(isi role)* |

---

## 📎 Referensi

- RPS Mata Kuliah UI/UX Design — Teknik Informatika ITI
- [Figma](https://figma.com) — Inspirasi canvas interaktif
- [Awwwards](https://awwwards.com) — Referensi desain landing page
- [GSAP](https://gsap.com) — Library animasi
- [Remotion](https://remotion.dev) — Programmatic video

---

> **"Belajar desain bukan cuma membaca, tapi membangun."**
>
> — nodes.
