# **Kode PlantUML Diagram STN Lengkap (Revisi)**

> **Revisi:** Menambahkan **reaksi sistem** di bawah setiap garis transisi aksi user, sesuai kaidah STN dari materi:
> - Baris 1 (atas garis): **Aksi User**
> - Baris 2 (bawah garis): **Reaksi Sistem**
>
> Referensi: Mockup HTML di folder `Mockup/pages/` dan materi PDF `State Transition Network (STN).pdf`

---

### **1. STN Main Program (Hierarchical STN)**

```plantuml
@startuml
title STN Diagram - Main Program (Navigasi Global NODES)
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  FontSize 12
  RoundCorner 0
}

[*] --> LandingPage : Akses URL (Publik)\nTampil Landing Page

state "Landing Page\n----\n(o)---(o)\n  \\   /\n   (o)" as LandingPage
state "Login (/masuk)\n----\n(o)---(o)\n  \\   /\n   (o)" as Login
state "Register (/daftar)\n----\n(o)---(o)\n  \\   /\n   (o)" as Register
state "Dashboard (/app)\n----\n(o)---(o)\n  \\   /\n   (o)" as Dashboard
state "Katalog Modul\n----\n(o)---(o)\n  \\   /\n   (o)" as KatalogModul
state "Detail Modul\n----\n(o)---(o)\n  \\   /\n   (o)" as DetailModul
state "Kanvas Praktik\n----\n(o)---(o)\n  \\   /\n   (o)" as KanvasPraktik
state "Ruang Kolaborasi\n----\n(o)---(o)\n  \\   /\n   (o)" as Kolaborasi
state "Profil & Pengaturan\n----\n(o)---(o)\n  \\   /\n   (o)" as Profil

LandingPage --> Login : klik "Masuk"\nTampil form login
LandingPage --> Register : klik "Mulai belajar"\nTampil form registrasi

Login -down-> Register : klik "Daftar sekarang"\nTampil form registrasi
Register -up-> Login : klik "Masuk di sini"\nTampil form login

Login --> Dashboard : Submit sukses\nRedirect & tampil dashboard
Register --> Dashboard : Submit sukses\nRedirect & tampil dashboard

Dashboard --> KatalogModul : navigasi sidebar\nTampil daftar modul & filter
Dashboard --> KanvasPraktik : navigasi sidebar\nTampil daftar proyek kanvas
Dashboard --> Kolaborasi : navigasi sidebar\nTampil daftar ruang kolaborasi
Dashboard --> Profil : navigasi sidebar\nTampil halaman profil & pengaturan

KatalogModul --> DetailModul : klik kartu modul\nTampil konten materi sesi

' Navigasi kembali
Login -left-> LandingPage : klik "Kembali"\nTampil landing page
Register -left-> LandingPage : klik "Kembali"\nTampil landing page
DetailModul -left-> KatalogModul : klik "Kembali"\nTampil daftar modul

Profil -up-> Login : klik "Keluar" (Logout)\nHapus sesi & tampil form login
@enduml
```

---

### **2. STN Landing Page**

```plantuml
@startuml
title STN Diagram - Landing Page
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  RoundCorner 50
}

[*] --> ViewHero : Buka '/'\nTampil hero section & navbar

state "Hero Section" as ViewHero
state "Section Masalah" as ViewMasalah
state "Section Fitur" as ViewFitur
state "Section Cara Kerja" as ViewCara

ViewHero --> ViewMasalah : scroll ke bawah\nTampil kartu tantangan mahasiswa
ViewMasalah --> ViewFitur : scroll ke bawah\nTampil grid fitur utama platform
ViewFitur --> ViewCara : scroll ke bawah\nTampil 4 langkah cara kerja
ViewCara -left-> ViewHero : scroll ke atas\nKembali ke hero section

ViewHero --> [*] : klik "Masuk" / "Mulai belajar"\nNavigasi ke halaman Auth
@enduml
```

---

### **3. STN Halaman Masuk (Login)**

```plantuml
@startuml
title STN Diagram - Halaman Masuk (Login)
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  RoundCorner 50
}

[*] --> FormLogin : Buka /masuk\nTampil form login (email & password)

state "Form Login" as FormLogin
state "Validasi Data" as Validasi
state "Proses Auth" as ProsesAuth
state "Error Banner" as ErrorBanner

FormLogin --> FormLogin : isi email & password\nField terisi, validasi realtime
FormLogin --> FormLogin : klik toggle mata\nTampil/sembunyikan teks password
FormLogin --> Validasi : klik "Masuk"\nProses validasi client-side

Validasi -down-> ErrorBanner : input kosong/salah format\nTampil pesan "Email dan password wajib diisi"
ErrorBanner -up-> FormLogin : perbaiki input\nHapus error, aktifkan form

Validasi --> ProsesAuth : input valid\nKirim data ke server autentikasi
ProsesAuth -down-> ErrorBanner : kredensial salah\nTampil pesan "Email atau password salah"

ProsesAuth --> [*] : Login sukses\nRedirect ke Dashboard

FormLogin --> [*] : klik "Daftar sekarang"\nTampil form registrasi
FormLogin --> [*] : klik "Kembali ke beranda"\nNavigasi ke Landing Page
@enduml
```

---

### **4. STN Halaman Daftar (Register)**

```plantuml
@startuml
title STN Diagram - Halaman Daftar (Register)
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  RoundCorner 50
}

[*] --> FormRegister : Buka /daftar\nTampil form registrasi

state "Form Register" as FormRegister
state "Cek Password" as CekPassword
state "Validasi Data" as Validasi
state "Proses Registrasi" as ProsesReg
state "Error Banner" as ErrorBanner

FormRegister -down-> CekPassword : ketik password\nProses cek kekuatan password
CekPassword -up-> FormRegister : update indikator\nTampil bar & label (Lemah/Sedang/Kuat)

FormRegister --> Validasi : klik "Buat akun"\nProses validasi client-side
Validasi -down-> ErrorBanner : tidak valid\nTampil pesan error field
ErrorBanner -up-> FormRegister : perbaiki input\nHapus error, aktifkan form

Validasi --> ProsesReg : valid\nKirim data ke server registrasi
ProsesReg -down-> ErrorBanner : email terpakai\nTampil pesan "Email sudah terdaftar"

ProsesReg --> [*] : Registrasi sukses\nRedirect ke Dashboard

FormRegister --> [*] : klik "Masuk di sini"\nTampil form login
FormRegister --> [*] : klik "Kembali ke beranda"\nNavigasi ke Landing Page
@enduml
```

---

### **5. STN Dashboard**

```plantuml
@startuml
title STN Diagram - Dashboard
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  RoundCorner 50
}

[*] --> TampilDashboard : Akses /app (sudah login)\nTampil greeting, statistik & modul terbaru

state "Tampil Dashboard" as TampilDashboard

TampilDashboard --> [*] : klik "Jelajahi modul"\nTampil halaman Katalog Modul dengan daftar & filter
TampilDashboard --> [*] : klik kartu modul\nTampil konten sesi materi modul terpilih
TampilDashboard --> [*] : klik "Lanjutkan"\nTampil sesi terakhir yang sedang dipelajari
TampilDashboard --> [*] : klik "Lihat semua"\nTampil daftar semua modul di Katalog
TampilDashboard --> [*] : klik "Buka kanvas praktik"\nTampil daftar proyek kanvas
TampilDashboard --> [*] : klik "Ruang kolaborasi"\nTampil daftar ruang kolaborasi
TampilDashboard --> [*] : klik "Lihat progres lengkap"\nTampil halaman profil & statistik progres
@enduml
```

---

### **6. STN Katalog Modul**

```plantuml
@startuml
title STN Diagram - Katalog Modul
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  RoundCorner 50
}

[*] --> TampilKatalog : Akses /app/modul\nTampil daftar 16 modul & filter

state "Daftar Modul" as TampilKatalog
state "Proses Filter" as ProsesFilter
state "Empty State" as EmptyState

TampilKatalog -right-> ProsesFilter : ketik search / klik filter tab\nFilter daftar modul berdasarkan keyword/kategori
ProsesFilter -left-> TampilKatalog : hasil ditemukan\nRefresh UI tampil modul hasil filter

ProsesFilter -down-> EmptyState : tidak ada hasil\nTampil pesan "Modul tidak ditemukan"
EmptyState -up-> TampilKatalog : klik "Reset filter"\nHapus filter & tampil semua modul

TampilKatalog --> [*] : klik kartu modul\nNavigasi ke halaman Detail Modul
@enduml
```

---

### **7. STN Detail Modul**

```plantuml
@startuml
title STN Diagram - Detail Modul
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  RoundCorner 50
}

[*] --> BacaMateri : Akses /app/modul/:slug\nTampil konten sesi & sidebar navigasi sub-bab

state "Baca Materi" as BacaMateri
state "Ubah Status" as UbahStatus
state "Tulis Catatan" as TulisCatatan

BacaMateri -down-> UbahStatus : klik "Tandai selesai"\nProses update status sesi ke server
UbahStatus -up-> BacaMateri : update UI\nStatus sesi berubah (✓), progress modul update

BacaMateri -down-> TulisCatatan : isi textarea catatan\nKarakter counter update (n/500)
TulisCatatan -up-> BacaMateri : klik "Simpan"\nCatatan tersimpan, tampil notifikasi sukses

BacaMateri --> BacaMateri : klik "Sesi berikutnya"\nTampil konten sub-bab berikutnya
BacaMateri --> BacaMateri : klik node sub-bab di sidebar\nTampil konten sub-bab terpilih

BacaMateri --> [*] : klik "← Katalog modul"\nNavigasi ke halaman Katalog Modul
@enduml
```

---

### **8. STN Kanvas Praktik**

```plantuml
@startuml
title STN Diagram - Kanvas Praktik
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  RoundCorner 50
}

[*] --> DaftarProyek : Akses /app/kanvas\nTampil daftar proyek / empty state

state "Daftar Proyek" as DaftarProyek
state "Modal Baru" as ModalBaru
state "Editor Kanvas" as EditorKanvas
state "Manipulasi Layer" as EditLayer

DaftarProyek -down-> ModalBaru : klik "Proyek baru"\nTampil modal input nama proyek
ModalBaru -up-> DaftarProyek : klik "Batal"\nTutup modal, kembali ke daftar
ModalBaru --> EditorKanvas : isi nama & "Buat"\nProyek dibuat, tampil editor kanvas kosong

DaftarProyek --> EditorKanvas : klik proyek (muat data)\nMuat data proyek & tampil di canvas

EditorKanvas -down-> EditLayer : tambah/klik layer\nTampil panel properti (X, Y, warna, font)
EditLayer -up-> EditorKanvas : ubah properti / drag\nElemen diperbarui realtime di canvas

EditorKanvas --> EditorKanvas : klik "Simpan"\nProyek tersimpan, tampil notifikasi sukses
EditorKanvas --> EditorKanvas : klik undo/redo/zoom\nCanvas di-update sesuai aksi

EditorKanvas -left-> DaftarProyek : ganti proyek\nTampil konfirmasi unsaved & kembali ke daftar
@enduml
```

---

### **9. STN Ruang Kolaborasi**

```plantuml
@startuml
title STN Diagram - Ruang Kolaborasi
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  RoundCorner 50
}

[*] --> DaftarRuang : Akses /app/kolaborasi\nTampil daftar ruang & filter

state "Daftar Ruang" as DaftarRuang
state "Modal Ruang" as ModalRuang
state "Ruang Aktif" as RuangAktif
state "Pin Komentar" as PinKomentar
state "Chat & Vote" as ChatVote

DaftarRuang -down-> ModalRuang : klik "Undang/baru"\nTampil modal buat/gabung ruang
ModalRuang -up-> DaftarRuang : klik "Batal"\nTutup modal, kembali ke daftar
ModalRuang --> RuangAktif : buat/gabung ruang\nTampil preview desain & panel review

DaftarRuang --> RuangAktif : klik chip ruang\nMuat konten ruang terpilih

RuangAktif -down-> PinKomentar : klik area desain\nTampil form pin komentar di posisi klik
PinKomentar -up-> RuangAktif : kirim / resolve\nPin muncul/status berubah di desain

RuangAktif -down-> ChatVote : ketik chat / klik vote\nProses kirim pesan / catat vote
ChatVote -up-> RuangAktif : kirim / perbarui\nPesan muncul di feed / bar suara update

RuangAktif --> DaftarRuang : ganti ruang lain\nMuat daftar ruang & filter
@enduml
```

---

### **10. STN Profil & Pengaturan**

```plantuml
@startuml
title STN Diagram - Profil & Pengaturan
left to right direction

skinparam state {
  BackgroundColor #FFFFFF
  BorderColor #000000
  RoundCorner 50
}

[*] --> HalProfil : Akses /app/profil\nTampil halaman profil, statistik & badges

state "Halaman Profil" as HalProfil
state "Update Profil" as UpdateProfil
state "Ganti Password" as GantiPass
state "Modal Hapus" as ModalHapus

HalProfil -down-> UpdateProfil : edit form nama/bio\nField terisi dengan data baru
UpdateProfil -up-> HalProfil : klik "Simpan profil"\nData tersimpan, tampil notifikasi sukses

HalProfil -down-> GantiPass : isi form password baru\nField terisi & validasi
GantiPass -up-> HalProfil : klik "Perbarui"\nPassword diperbarui, form dikosongkan

HalProfil -down-> HalProfil : klik toggle preferensi\nTema/bahasa/animasi berubah realtime (auto-save)

HalProfil --> ModalHapus : klik "Hapus akun"\nTampil modal konfirmasi dengan warning
ModalHapus -left-> HalProfil : klik "Batal"\nTutup modal, kembali ke profil

ModalHapus --> [*] : ketik "HAPUS" & submit\nAkun dihapus, logout & redirect ke Login
HalProfil --> [*] : klik "Keluar" (Logout)\nHapus sesi & redirect ke Login
@enduml
```

---

> **Catatan format label transisi:**
> - Baris pertama (di atas garis panah) = **Aksi User** (apa yang user lakukan)
> - Baris kedua (di bawah garis panah) = **Reaksi Sistem** (apa yang sistem tampilkan/proses sebagai respons)
> - Menggunakan `\n` di PlantUML untuk memisahkan kedua baris pada label transisi

