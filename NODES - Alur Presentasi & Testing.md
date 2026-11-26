# NODES — Alur Presentasi & Testing Lengkap

**URL Live:** [https://nodes-learn.vercel.app/](https://nodes-learn.vercel.app/)

---

## 0. Persiapan Sebelum Mulai Presentasi

1. Gunakan browser **Incognito / Guest**, atau buka DevTools (`F12`) → tab **Console** → jalankan:
   ```js
   localStorage.clear()
   ```
   lalu refresh halaman agar state dimulai bersih dari awal (progress, catatan, canvas, sesi kolaborasi, dan tour).
2. Siapkan 1 email baru jika ingin mendemonstrasikan alur **Daftar**, atau akun yang sudah terdaftar untuk langsung demo **Masuk**.

---

## 1. Landing Page (`/`) — Pengenalan & Masalah

- **Link:** `https://nodes-learn.vercel.app/`
- **Alur demo:**
  1. **Hero:** Jelaskan tagline NODES (*"Belajar desain bukan cuma membaca, tapi membangun"*).
  2. **Tantangan Nyata & Solusi (Bento Grid):** Jelaskan alasan NODES menyatukan modul teori, canvas praktik, dan ruang kolaborasi dalam satu platform.
  3. **Cara Kerja & Testimoni:** Tunjukkan 4 langkah alur belajar dari daftar hingga review.
  4. **Footer:** Tunjukkan logo **Institut Teknologi Indonesia (ITI)** di footer.
  5. Klik **"Mulai Belajar"** di navbar atau **"Coba Sekarang — Gratis"** untuk masuk ke `/auth`.

---

## 2. Autentikasi (`/auth`) — Daftar & Masuk

- **Link:** `https://nodes-learn.vercel.app/auth`
- **Yang dicek:**
  - Co-brand **NODES × logo ITI** tampil rapi di panel kiri (desktop) dan di atas form (mobile).
  - Switch tab **Masuk** / **Daftar**.
  - Pada tab **Daftar**, isi **Nama lengkap**, **Email kampus**, dan **Password** (tunjukkan indikator kekuatan password).
  - Klik **Buat Akun** / **Masuk** → masuk ke `/app`.
  - *(Jika verifikasi email diaktifkan)*: tunjukkan halaman `/email-confirmed` yang otomatis mengarahkan ke `/app`.

---

## 3. Dashboard & Onboarding (`/app`) — State Awal Akun Baru

- **Link:** `https://nodes-learn.vercel.app/app`
- **Alur demo:**
  1. Setelah masuk `/app` (~1 detik), popup **Neko ("Hai, aku Neko!")** muncul → klik **"Tour bersama Neko"** untuk demo singkat onboarding tour 10 langkah (atau **"Nanti saja"** untuk skip).
  2. Tunjukkan **clean state akun baru**:
     - Greeting sesuai waktu + nama depan user.
     - **Progress Belajar:** `0` dari `16` sesi (`0 Selesai`, `0 Berlangsung`, `16 Belum mulai`).
     - **Streak Harian:** `1 hari streak` (terhitung dari login hari ini).
     - **Aktivitas Terbaru:** kosong (*"Belum ada aktivitas."*).
     - **Modul Terbaru:** Sesi 01 terbuka, Sesi 02–04 terkunci (ikon gembok — klik memunculkan toast warning *"Modul Terkunci"*).
  3. Demo **Topbar**:
     - Klik ikon **Lonceng (Notifikasi)** → kosong (*"Belum ada notifikasi."*).
     - Klik **Search Bar** atau tekan `Ctrl+K` / `⌘K` → ketik `design` → muncul hasil pencarian modul.
     - Tunjukkan **logo ITI** di pojok kanan topbar.
  4. Klik **maskot kucing Neko** di pojok kanan bawah → bubble tips kontekstual muncul; klik tombol `X` → bubble tertutup namun maskot tetap ada.

---

## 4. Katalog Modul (`/app/modul`) — Kurikulum 16 Sesi

- **Link:** `https://nodes-learn.vercel.app/app/modul`
- **Alur demo:**
  1. Klik **"Modul Belajar"** di sidebar kiri.
  2. *(Kunjungan pertama)*: tour singkat halaman modul (3 langkah) otomatis berjalan.
  3. Tunjukkan **16 modul** terstruktur (Fondasi, Inti, Lanjutan, Proyek, Evaluasi) beserta filter kategori dan kolom pencarian modul.
  4. Tunjukkan hanya modul **01 Pengantar UX Design** yang berstatus **Mulai**, sedangkan modul 02–16 **Terkunci**.
  5. Klik kartu **01 Pengantar UX Design**.

---

## 5. Detail Modul (`/app/modul/pengantar-ux-design`) — Belajar & Sequential Lock

- **Link:** `https://nodes-learn.vercel.app/app/modul/pengantar-ux-design`
- **Alur demo:**
  1. Tunjukkan 4 sub-bab di sidebar modul:
     - *Apa itu UX Design?* (terbuka)
     - *UX vs UI: Perbedaan Mendasar* (terkunci)
     - *Peran UX dalam Produk Digital* (terkunci)
     - *Proses Design Thinking* (terkunci)
  2. **Sequential lock:** klik sub-bab yang terkunci → konten preview tampil blur dengan pesan *"Sub-bab Terkunci"*.
  3. **Catatan Pribadi:** scroll ke bawah, tulis catatan singkat → klik **Simpan** → toast *"Catatan Tersimpan"* (tersimpan di `localStorage`).
  4. **Selesaikan Modul 1 & Evaluasi Quiz:**
     - Klik **"Tandai Selesai"** di sub-bab 1 → otomatis lanjut ke sub-bab 2.
     - Tandai selesai berurutan sampai sub-bab 4 (`Progress 100%`) → otomatis masuk ke **Evaluasi Modul** (4 soal pilihan ganda, batas lulus 70%).
     - Pilih jawaban → klik **"Periksa Jawaban"** → tampil highlight benar/salah + **Pembahasan** singkat → lanjut hingga **Lihat Hasil Evaluasi**.
     - Tunjukkan ringkasan skor & status lulus (bisa klik **"Ulangi Evaluasi"** atau **"Modul Selanjutnya"** untuk langsung ke **02 Analisis Pengguna & Persona**).
     - Skor evaluasi otomatis muncul di kartu **Katalog Modul**, menambah **+50 XP**, dan membuka badge **Perfectionist** di Profil jika skor `100%`.

---

## 6. Canvas Praktik (`/app/kanvas`) — Editor Desain Interaktif

- **Link:** `https://nodes-learn.vercel.app/app/kanvas`
- **Alur demo:**
  1. Buka **Canvas Praktik** dari sidebar (atau dropdown menu `n.`).
  2. Tunjukkan header fullscreen dengan tombol kembali `<`, dropdown `n.`, dan **logo ITI**.
  3. Pada empty state (*"Belum ada proyek"*), klik **"Buat Proyek Pertama"**:
     - Isi nama proyek, pilih dari 4 template (**Kosong**, **Landing Page**, **Wireframe**, **Mobile App**), lalu buat proyek.
  4. Demo fitur canvas:
     - **Tools:** `Select (V)` untuk pilih/geser/resize layer, `Frame (F)` untuk membuat frame baru, `Text (T)` + double-click untuk edit teks, `Hand (H)` untuk pan canvas, `Pen (P)` untuk membuat path.
     - **Panel Kanan (Layers & Properties):** sembunyikan (**Eye**), kunci (**Lock**), atur urutan (**Naik / Turun**), **Duplikasi**, **Hapus Layer**, serta ubah posisi/ukuran/warna/radius/opacity di Properties.
     - **Shortcut:** `Ctrl+Z` (Undo), `Ctrl+Shift+Z` / `Ctrl+Y` (Redo), `Ctrl+D` (Duplikasi), `Delete`/`Backspace` (Hapus), dan klik **Simpan** (`Ctrl+S`).
     - **Integrasi Figma-style:** klik tombol **"Kolaborasi"** di toolbar kanan (sebelah `Simpan`) → langsung membawa proyek Canvas tersebut ke Ruang Kolaborasi untuk direview!

---

## 7. Ruang Kolaborasi (`/app/kolaborasi`) — Review Desain Canvas Asli

- **Link:** `https://nodes-learn.vercel.app/app/kolaborasi`
- **Alur demo:**
  1. Jika belum punya sesi (buka langsung dari sidebar), tunjukkan empty state bersih (*"Belum Ada Sesi Kolaborasi"* + **logo ITI** di header).
  2. Buat sesi lewat modal **"Buat Sesi Kolaborasi"** dengan memilih **Proyek dari Canvas Praktik** (atau langsung otomatis terbuka saat klik **"Kolaborasi"** dari dalam Canvas).
  3. Di **Live Session**, preview menampilkan **desain & layers asli dari Canvas Praktik** (bukan template statis):
     - **Device Preview:** switch tampilan **Desktop / Tablet / Mobile** dan lihat artboard menyesuaikan rapi.
     - **Edit ↔ Review:** klik **"Edit di Canvas"** → ubah warna/teks di Canvas → klik **"Kolaborasi"** lagi → perubahan langsung muncul di review!
     - **Pin Komentar:** klik **"Tambah Pin"** → klik di atas artboard desain → tulis komentar → klik **Pin**. Klik pin untuk demo **Balas**, **Resolve** (berubah hijau), atau hapus (semua pin & chat tersimpan per sesi).
     - **Panel Kanan:**
       - Tab **Chat:** kirim pesan di kolom chat.
       - Tab **Activity:** tunjukkan semua aktivitas sesi tercatat otomatis.
       - Tab **Voting:** beri status review **Siap Lanjut (Approved)** atau **Perlu Revisi** untuk proyek Canvas aktif.
     - **Undang Peserta:** klik ikon **UserPlus** di header → demo **Copy** link kolaborasi proyek.
  4. Klik **"Akhiri Sesi"** untuk kembali ke daftar sesi (semua pin, chat, dan vote tetap tersimpan).

---

## 8. Profil & Pengaturan (`/app/profil`) — Data Dinamis

- **Link:** `https://nodes-learn.vercel.app/app/profil`
- **Alur demo:**
  1. Buka **Profil** dari avatar/nama di sidebar kiri bawah.
  2. Tunjukkan bahwa seluruh data sudah **dinamis dari aktivitas nyata**:
     - **Total XP**, **Level** di badge avatar, **Streak Hari**, **Hari Aktif**, **Badges**.
     - Tab **Progres:** progress bar modul 01 = `100%`, **Aktivitas 12 Minggu** (heatmap), dan **Aktivitas Terakhir** (timeline).
     - Tab **Badges:** badge **First Steps** dan **Note Taker** otomatis terbuka.
     - Tab **Proyek:** proyek yang disimpan di Canvas tampil di tab ini.
     - Tab **Pengaturan:**
       - Edit **Bio** → klik **Simpan Perubahan** → bio di profil langsung terupdate.
       - Tunjukkan fitur yang belum aktif ditandai jujur sebagai **(Segera Hadir)** (Mode Gelap, Notifikasi Email, Notifikasi Push, Bahasa), sementara **Profil Publik**, **Ulangi Tour**, dan **Hapus Akun** aktif.

---

## 9. Penutup: Persistensi, Responsive & Halaman 404

1. **Persistensi Data:** Klik **Keluar** di sidebar kiri bawah → login ulang dengan akun yang sama → verifikasi progress modul 01, catatan pribadi, dan proyek Canvas tetap tersimpan.
2. **Responsive Mobile:** Perkecil lebar browser (`< 1024px`) → buka menu lewat tombol **hamburger** di topbar kiri → klik area backdrop luar untuk menutup sidebar.
3. **Halaman 404 (Opsional):** Akses URL acak seperti `/tes-404` → tampil halaman 404 dengan tombol **Ke Beranda** dan footer **NODES · ITI**.

---

## Checklist Cepat Presentasi

| # | Alur / Fitur | Cek |
|---|--------------|-----|
| 1 | Landing Page + Logo ITI di footer | ☐ |
| 2 | Auth (`/auth`) Daftar / Masuk + Logo ITI | ☐ |
| 3 | Dashboard clean state + Onboarding Tour Neko | ☐ |
| 4 | Topbar: Search (`Ctrl+K`), Notifikasi kosong, Logo ITI | ☐ |
| 5 | Katalog Modul: 16 sesi, filter, sequential lock antar modul | ☐ |
| 6 | Detail Modul: sequential lock sub-bab, blur preview, Catatan, Modul Selanjutnya | ☐ |
| 7 | Canvas (`/app/kanvas`): empty state, 4 template, 5 tools, layer & properties, Simpan | ☐ |
| 8 | Kolaborasi (`/app/kolaborasi`): empty state, buat sesi, device preview, Pin komentar, Chat/Activity/Voting | ☐ |
| 9 | Profil (`/app/profil`): XP, heatmap, timeline, badges dinamis, proyek, pengaturan & Ulangi Tour | ☐ |
| 10 | Logout → login ulang (data persist) & responsive mobile | ☐ |
