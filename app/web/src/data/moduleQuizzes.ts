export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const PASSING_SCORE = 70

/**
 * Evaluasi pilihan ganda per modul (keyed by module id 1..16).
 * Setiap soal mengacu langsung pada materi sub-bab modul terkait.
 */
export const moduleQuizzes: Record<number, QuizQuestion[]> = {
  /* ── 01 Pengantar UX Design ── */
  1: [
    {
      id: 'm1-q1',
      question: 'Apa perbedaan utama antara UX Design dan UI Design?',
      options: [
        'UX fokus pada keseluruhan pengalaman dan alur pengguna, sedangkan UI fokus pada tampilan visual dan elemen antarmuka.',
        'UX hanya mengurus warna dan tipografi, sedangkan UI mengurus riset pengguna.',
        'UX dilakukan setelah aplikasi dirilis, sedangkan UI dilakukan sebelum riset.',
        'UX dan UI adalah istilah yang sama persis tanpa perbedaan ruang lingkup.',
      ],
      correctIndex: 0,
      explanation: 'UX merancang bagaimana produk bekerja dan dirasakan (riset, alur, arsitektur), sementara UI merancang tampilan antarmuka (warna, tipografi, komponen visual).',
    },
    {
      id: 'm1-q2',
      question: 'Dalam tahapan Design Thinking, langkah apa yang dilakukan tepat setelah "Empathize"?',
      options: ['Prototype', 'Define', 'Test', 'Launch'],
      correctIndex: 1,
      explanation: 'Urutan 5 tahapan Design Thinking adalah Empathize → Define → Ideate → Prototype → Test. Setelah memahami pengguna, kita merumuskan masalah utama di tahap Define.',
    },
    {
      id: 'm1-q3',
      question: 'Elemen UX yang memastikan produk dapat digunakan oleh semua orang termasuk penyandang disabilitas disebut...',
      options: ['Desirability', 'Usability', 'Accessibility', 'Findability'],
      correctIndex: 2,
      explanation: 'Accessibility (aksesibilitas) berfokus pada inklusivitas, seperti kontras warna WCAG, navigasi keyboard, dan dukungan screen reader.',
    },
    {
      id: 'm1-q4',
      question: 'Mengapa memperbaiki masalah UX di tahap desain jauh lebih efisien dibanding saat development?',
      options: [
        'Karena desainer tidak perlu berdiskusi dengan developer.',
        'Karena perubahan pada wireframe atau prototipe jauh lebih murah dan cepat dibanding mengubah kode produksi.',
        'Karena pengguna tidak pernah peduli dengan tampilan akhir.',
        'Karena tahap development tidak membutuhkan dokumentasi.',
      ],
      correctIndex: 1,
      explanation: 'Validasi lebih awal di tahap desain mencegah pengerjaan ulang (rework) kode yang memakan waktu dan biaya jauh lebih besar.',
    },
  ],

  /* ── 02 Analisis Pengguna & Persona ── */
  2: [
    {
      id: 'm2-q1',
      question: 'Apa sumber data utama yang seharusnya digunakan untuk menyusun User Persona?',
      options: [
        'Asumsi pribadi desainer tanpa wawancara.',
        'Data riset nyata seperti wawancara pengguna, observasi, dan survei.',
        'Tren media sosial yang sedang populer saja.',
        'Struktur database backend aplikasi.',
      ],
      correctIndex: 1,
      explanation: 'User Persona harus berbasis bukti riset nyata agar keputusan desain benar-benar mewakili kebutuhan dan pain points pengguna.',
    },
    {
      id: 'm2-q2',
      question: 'Empat kuadran utama dalam Empathy Map terdiri dari...',
      options: [
        'Plan, Build, Ship, Measure',
        'Think & Feel, See, Say & Do, Hear',
        'Color, Grid, Type, Icon',
        'Strength, Weakness, Opportunity, Threat',
      ],
      correctIndex: 1,
      explanation: 'Empathy Map memetakan apa yang dipikirkan/dirasakan (Think & Feel), dilihat (See), dikatakan/dilakukan (Say & Do), dan didengar (Hear) pengguna.',
    },
    {
      id: 'm2-q3',
      question: 'Apa tujuan utama dari pembuatan User Journey Map?',
      options: [
        'Menentukan skema warna tombol utama.',
        'Memetakan langkah, emosi, dan titik hambatan (pain points) pengguna dari awal hingga tujuan tercapai.',
        'Menghitung ukuran file gambar di website.',
        'Menggantikan seluruh kebutuhan coding frontend.',
      ],
      correctIndex: 1,
      explanation: 'User Journey Map memperlihatkan pengalaman pengguna secara kronologis sehingga tim dapat menemukan momen friksi dan peluang perbaikan.',
    },
  ],

  /* ── 03 Information Architecture ── */
  3: [
    {
      id: 'm3-q1',
      question: 'Metode riset di mana partisipan mengelompokkan topik konten ke dalam kategori yang menurut mereka masuk akal disebut...',
      options: ['Card Sorting', 'A/B Testing', 'Color Grading', 'Code Review'],
      correctIndex: 0,
      explanation: 'Card Sorting membantu desainer memahami model mental pengguna untuk menyusun struktur menu dan kategori yang intuitif.',
    },
    {
      id: 'm3-q2',
      question: 'Apa fungsi utama Sitemap dalam Information Architecture?',
      options: [
        'Menentukan animasi transisi antar halaman.',
        'Memvisualisasikan hierarki halaman dan hubungan antar bagian dalam produk digital.',
        'Menguji kecepatan server hosting.',
        'Menulis copywriting iklan.',
      ],
      correctIndex: 1,
      explanation: 'Sitemap memberikan gambaran struktur navigasi tingkat tinggi sebelum masuk ke detail layout tiap halaman.',
    },
    {
      id: 'm3-q3',
      question: 'Prinsip labeling yang baik pada navigasi adalah...',
      options: [
        'Menggunakan istilah teknis internal perusahaan agar terdengar canggih.',
        'Menggunakan istilah singkat, konsisten, dan mudah dipahami pengguna.',
        'Membuat label sepanjang satu paragraf.',
        'Menyembunyikan seluruh label dan hanya memakai ikon abstrak.',
      ],
      correctIndex: 1,
      explanation: 'Label yang jelas dan konsisten mengurangi beban kognitif sehingga pengguna cepat menemukan fitur yang dicari.',
    },
  ],

  /* ── 04 Wireframing & Sketsa ── */
  4: [
    {
      id: 'm4-q1',
      question: 'Mengapa low-fidelity wireframe sengaja dibuat minimalis tanpa warna dan gambar detail?',
      options: [
        'Agar tim fokus mengevaluasi struktur, hierarki informasi, dan alur tanpa terganggu estetika visual.',
        'Karena software desain tidak mendukung warna.',
        'Untuk memperlama proses revisi dengan klien.',
        'Karena wireframe langsung dipakai sebagai halaman produksi.',
      ],
      correctIndex: 0,
      explanation: 'Low-fidelity wireframe mempercepat eksplorasi ide layout dan mencegah diskusi terjebak di detail warna terlalu dini.',
    },
    {
      id: 'm4-q2',
      question: 'Kapan waktu paling tepat untuk melakukan rapid sketching di kertas?',
      options: [
        'Setelah kode selesai di-deploy ke server.',
        'Di awal tahap ideation untuk mengeksplorasi banyak alternatif layout dengan cepat.',
        'Saat menulis unit test backend.',
        'Hanya saat presentasi akhir ke investor.',
      ],
      correctIndex: 1,
      explanation: 'Sketsa cepat berbiaya hampir nol dan memudahkan desainer membandingkan berbagai opsi struktur sebelum mendigitalkannya.',
    },
    {
      id: 'm4-q3',
      question: 'Elemen apa yang paling penting ditunjukkan pada sebuah wireframe?',
      options: [
        'Efek bayangan 3D dan gradien kompleks.',
        'Penempatan blok konten, prioritas informasi, dan alur aksi utama.',
        'Resolusi foto stok 4K.',
        'Pilihan font dekoratif untuk footer.',
      ],
      correctIndex: 1,
      explanation: 'Wireframe berfungsi sebagai cetak biru struktur: apa yang ada di layar, seberapa penting posisinya, dan ke mana aksi mengarah.',
    },
  ],

  /* ── 05 Grid Systems & Layout ── */
  5: [
    {
      id: 'm5-q1',
      question: 'Jumlah kolom grid standar yang paling fleksibel untuk layout web desktop karena mudah dibagi 2, 3, 4, dan 6 adalah...',
      options: ['5 kolom', '7 kolom', '12 kolom', '17 kolom'],
      correctIndex: 2,
      explanation: 'Grid 12 kolom dapat dibagi merata ke banyak kombinasi (12, 6+6, 4+4+4, 3+3+3+3, 8+4) sehingga menjadi standar industri web.',
    },
    {
      id: 'm5-q2',
      question: 'Dalam sistem grid, ruang jarak antar kolom disebut...',
      options: ['Margin', 'Gutter', 'Padding', 'Baseline'],
      correctIndex: 1,
      explanation: 'Gutter adalah celah pemisah antar kolom agar konten di kolom bersebelahan tetap memiliki ruang napas visual.',
    },
    {
      id: 'm5-q3',
      question: 'Apa manfaat utama whitespace (ruang kosong) dalam sebuah antarmuka?',
      options: [
        'Membuat halaman terlihat kosong dan kurang informasi.',
        'Meningkatkan keterbacaan, memperjelas pengelompokan elemen, dan mengarahkan fokus mata.',
        'Mengurangi ukuran file CSS secara drastis.',
        'Menghilangkan kebutuhan akan heading.',
      ],
      correctIndex: 1,
      explanation: 'Whitespace aktif membantu visual hierarchy sehingga pengguna lebih cepat memindai konten tanpa merasa kewalahan.',
    },
  ],

  /* ── 06 Color Theory & Palette ── */
  6: [
    {
      id: 'm6-q1',
      question: 'Berapa rasio kontras minimum standar WCAG AA untuk teks normal terhadap warna latar belakangnya?',
      options: ['1.5 : 1', '2.5 : 1', '4.5 : 1', '10 : 1'],
      correctIndex: 2,
      explanation: 'WCAG AA mensyaratkan rasio kontras minimal 4.5:1 untuk teks normal (dan 3:1 untuk teks besar) agar tetap terbaca dengan jelas.',
    },
    {
      id: 'm6-q2',
      question: 'Dalam aturan proporsi warna 60-30-10 untuk UI, porsi 10% biasanya digunakan untuk...',
      options: [
        'Warna latar belakang utama seluruh halaman.',
        'Warna aksen seperti tombol CTA utama, indikator aktif, atau highlight penting.',
        'Warna teks paragraf panjang.',
        'Warna border tabel yang tidak penting.',
      ],
      correctIndex: 1,
      explanation: 'Proporsi 60% warna dominan/netral, 30% warna sekunder, dan 10% warna aksen menjaga tampilan tetap seimbang dan CTA langsung menonjol.',
    },
    {
      id: 'm6-q3',
      question: 'Mengapa status error pada form tidak boleh hanya mengandalkan warna merah saja?',
      options: [
        'Karena warna merah tidak didukung semua browser.',
        'Karena pengguna dengan buta warna dapat kesulitan membedakannya tanpa tambahan ikon atau teks pesan.',
        'Karena warna merah selalu menurunkan rasio kontras.',
        'Karena form tidak perlu menampilkan error.',
      ],
      correctIndex: 1,
      explanation: 'Prinsip aksesibilitas WCAG melarang warna menjadi satu-satunya penanda informasi; selalu kombinasikan dengan teks atau ikon.',
    },
  ],

  /* ── 07 Typography & Readability ── */
  7: [
    {
      id: 'm7-q1',
      question: 'Berapa kisaran panjang baris (line length) ideal untuk teks paragraf di desktop agar nyaman dibaca?',
      options: [
        '15–25 karakter per baris',
        '45–75 karakter per baris',
        '120–160 karakter per baris',
        'Sepanjang lebar layar penuh tanpa batas',
      ],
      correctIndex: 1,
      explanation: 'Baris terlalu panjang membuat mata lelah mencari awal baris berikutnya; 45–75 karakter adalah rentang optimal untuk readability.',
    },
    {
      id: 'm7-q2',
      question: 'Apa fungsi utama hierarki tipografi dalam UI?',
      options: [
        'Memakai sebanyak mungkin jenis font berbeda di satu halaman.',
        'Membedakan tingkat kepentingan informasi (judul, subjudul, isi, keterangan) lewat ukuran, ketebalan, dan warna.',
        'Membuat semua teks memiliki ukuran dan berat yang sama.',
        'Menghapus spasi antar paragraf.',
      ],
      correctIndex: 1,
      explanation: 'Hierarki tipografi memandu mata pengguna memindai layar dari informasi paling penting ke detail pendukung secara alami.',
    },
    {
      id: 'm7-q3',
      question: 'Nilai line-height yang umumnya nyaman untuk teks body berukuran 14–16px adalah...',
      options: ['0.9 – 1.0', '1.4 – 1.6', '2.8 – 3.2', '0.5'],
      correctIndex: 1,
      explanation: 'Line-height sekitar 1.4x hingga 1.6x ukuran font memberi ruang antar baris yang cukup agar teks mudah dipindai.',
    },
  ],

  /* ── 08 UTS — Interactive Prototyping ── */
  8: [
    {
      id: 'm8-q1',
      question: 'Apa tujuan utama membuat prototipe interaktif sebelum tahap implementasi penuh?',
      options: [
        'Menguji alur navigasi dan interaksi bersama pengguna untuk menemukan cacat desain sejak dini.',
        'Menggantikan seluruh proses penulisan kode backend.',
        'Menghindari diskusi dengan stakeholder.',
        'Mengurangi jumlah halaman dokumentasi.',
      ],
      correctIndex: 0,
      explanation: 'Prototipe interaktif mensimulasikan pengalaman nyata sehingga masalah alur, label, dan interaksi terdeteksi sebelum biaya development keluar.',
    },
    {
      id: 'm8-q2',
      question: 'Komponen interaktif apa yang wajib dirancang state-nya pada prototipe form yang baik?',
      options: [
        'Hanya tampilan default saja.',
        'Default, hover/focus, filled, error, dan loading/success state.',
        'Hanya tampilan ketika browser ditutup.',
        'Hanya warna latar belakang footer.',
      ],
      correctIndex: 1,
      explanation: 'Merancang berbagai state antarmuka memastikan pengguna selalu mendapat umpan balik yang jelas atas setiap aksi.',
    },
    {
      id: 'm8-q3',
      question: 'Dalam evaluasi UTS prototyping, apa indikator bahwa sebuah alur tugas (task flow) sudah efektif?',
      options: [
        'Pengguna dapat menyelesaikan tugas inti tanpa kebingungan dan dengan jumlah langkah yang wajar.',
        'Prototipe memiliki animasi paling rumit di setiap tombol.',
        'Semua tombol memakai warna acak.',
        'Pengguna harus membaca manual 20 halaman terlebih dahulu.',
      ],
      correctIndex: 0,
      explanation: 'Efektivitas prototipe diukur dari kejelasan alur dan keberhasilan pengguna menyelesaikan tujuan utamanya tanpa friksi berarti.',
    },
    {
      id: 'm8-q4',
      question: 'Apa fungsi hotspot atau clickable link dalam prototipe interaktif?',
      options: [
        'Menghubungkan satu layar/komponen ke layar tujuan untuk mensimulasikan navigasi nyata.',
        'Mengompres ukuran font secara otomatis.',
        'Menghapus layer yang tidak terpakai.',
        'Mengubah warna tema sistem operasi.',
      ],
      correctIndex: 0,
      explanation: 'Hotspot memungkinkan penguji mengklik tombol atau menu secara langsung untuk merasakan transisi dan alur produk.',
    },
  ],

  /* ── 09 Design System & UI Tokens ── */
  9: [
    {
      id: 'm9-q1',
      question: 'Apa yang dimaksud dengan Design Tokens dalam sebuah Design System?',
      options: [
        'Koin hadiah untuk pengguna aplikasi.',
        'Variabel terpusat untuk menyimpan nilai desain seperti warna, spacing, radius, dan tipografi agar konsisten antara desain dan kode.',
        'Password untuk masuk ke file Figma.',
        'Nama file gambar berformat PNG.',
      ],
      correctIndex: 1,
      explanation: 'Design tokens menjadi single source of truth nilai visual yang memudahkan sinkronisasi antara desainer dan developer.',
    },
    {
      id: 'm9-q2',
      question: 'Manfaat terbesar menggunakan component library yang reusable adalah...',
      options: [
        'Setiap halaman punya gaya tombol yang berbeda-beda.',
        'Mempercepat pengerjaan, menjaga konsistensi UI, dan mempermudah pembaruan global.',
        'Menghilangkan kebutuhan akan pengujian usability.',
        'Membuat ukuran aplikasi selalu lebih berat.',
      ],
      correctIndex: 1,
      explanation: 'Perubahan pada master component langsung tercermin di seluruh penggunaan, mengurangi inkonsistensi dan kerja berulang.',
    },
    {
      id: 'm9-q3',
      question: 'Mengapa dokumentasi panduan penggunaan (do & don\'t) penting di dalam Design System?',
      options: [
        'Agar seluruh anggota tim tahu konteks pemakaian tiap komponen secara tepat, bukan sekadar menyalin tampilannya.',
        'Hanya untuk menambah jumlah halaman laporan.',
        'Supaya komponen tidak boleh dipakai oleh tim lain.',
        'Karena komponen tidak bisa diberi nama.',
      ],
      correctIndex: 0,
      explanation: 'Tanpa aturan pemakaian, komponen yang sama bisa digunakan secara keliru dan tetap menghasilkan UX yang membingungkan.',
    },
  ],

  /* ── 10 Interaction Design ── */
  10: [
    {
      id: 'm10-q1',
      question: 'Contoh penerapan micro-interaction yang efektif pada tombol simpan adalah...',
      options: [
        'Tidak ada perubahan apa pun saat tombol diklik.',
        'Menampilkan state loading singkat diikuti konfirmasi "Tersimpan" yang jelas.',
        'Mengalihkan pengguna ke halaman iklan.',
        'Menghapus seluruh teks di halaman.',
      ],
      correctIndex: 1,
      explanation: 'Micro-interaction memberi umpan balik instan (visibility of system status) sehingga pengguna yakin aksinya telah diproses.',
    },
    {
      id: 'm10-q2',
      question: 'Menurut Fitts\'s Law, target klik (seperti tombol aksi utama) akan lebih mudah dan cepat dijangkau jika...',
      options: [
        'Berukuran sangat kecil dan jauh dari area kerja.',
        'Memiliki ukuran area klik yang memadai dan berada dekat dengan fokus interaksi pengguna.',
        'Disembunyikan di dalam 4 tingkat submenu.',
        'Bergerak terus-menerus di layar.',
      ],
      correctIndex: 1,
      explanation: 'Fitts\'s Law menyatakan waktu menuju target dipengaruhi jarak dan ukuran target—tombol penting perlu cukup besar dan strategis.',
    },
    {
      id: 'm10-q3',
      question: 'Kapan animasi antarmuka justru merusak UX?',
      options: [
        'Ketika transisi terlalu lambat, berlebihan, atau tidak memiliki makna fungsional sehingga menghambat tugas pengguna.',
        'Ketika membantu menunjukkan asal-usul perubahan elemen di layar.',
        'Ketika durasinya singkat dan halus (150–300ms).',
        'Ketika menghormati preferensi reduced-motion pengguna.',
      ],
      correctIndex: 0,
      explanation: 'Gerakan dalam UI harus punya tujuan (memberi konteks/feedback), bukan sekadar dekorasi yang memperlambat interaksi.',
    },
  ],

  /* ── 11 Responsive & Adaptive ── */
  11: [
    {
      id: 'm11-q1',
      question: 'Apa inti dari pendekatan "Mobile-First Design"?',
      options: [
        'Hanya membuat versi mobile dan mengabaikan desktop.',
        'Merancang untuk layar kecil terlebih dahulu agar fokus pada konten inti, lalu memperkaya layout pada layar lebih besar.',
        'Memperkecil tampilan desktop hingga hurufnya tidak terbaca.',
        'Menghilangkan semua gambar di perangkat mobile.',
      ],
      correctIndex: 1,
      explanation: 'Keterbatasan ruang di mobile memaksa prioritas informasi yang tajam sebelum diperluas secara progresif ke tablet dan desktop.',
    },
    {
      id: 'm11-q2',
      question: 'Berapa ukuran minimum area sentuh (touch target) yang direkomendasikan untuk tombol di layar sentuh mobile?',
      options: ['12 × 12 px', '20 × 20 px', '44 × 44 px', '120 × 120 px'],
      correctIndex: 2,
      explanation: 'Ukuran minimal sekitar 44×44 px (Apple HIG) atau 48×48 dp (Material) mencegah salah tekan saat pengguna menavigasi dengan ibu jari.',
    },
    {
      id: 'm11-q3',
      question: 'Apa fungsi breakpoint dalam desain responsif?',
      options: [
        'Menghentikan aplikasi saat terjadi error.',
        'Titik lebar layar tertentu di mana struktur layout dan grid menyesuaikan agar tetap optimal.',
        'Memotong teks judul secara paksa.',
        'Menghapus navigasi di perangkat tablet.',
      ],
      correctIndex: 1,
      explanation: 'Breakpoint menentukan kapan layout beralih (misal dari 3 kolom di desktop menjadi 1 kolom di mobile) demi kenyamanan baca.',
    },
  ],

  /* ── 12 Usability Testing ── */
  12: [
    {
      id: 'm12-q1',
      question: 'Dalam metode "Think-Aloud Protocol" saat usability testing, apa yang diminta dari partisipan?',
      options: [
        'Menghafalkan seluruh daftar fitur sebelum mencoba.',
        'Mengucapkan apa yang mereka pikirkan, harapkan, dan rasakan saat menyelesaikan tugas di produk.',
        'Menilai desain hanya dari warna favoritnya.',
        'Memperbaiki kode HTML secara langsung.',
      ],
      correctIndex: 1,
      explanation: 'Think-Aloud membuka proses berpikir partisipan sehingga peneliti tahu persis mengapa mereka ragu atau salah mengklik.',
    },
    {
      id: 'm12-q2',
      question: 'Apa perbedaan utama Heuristic Evaluation dan Usability Testing dengan pengguna?',
      options: [
        'Heuristic Evaluation dilakukan oleh ahli UX berdasarkan prinsip (seperti 10 Heuristik Nielsen), sedangkan Usability Testing menguji langsung ke pengguna nyata.',
        'Heuristic Evaluation membutuhkan minimal 1000 partisipan.',
        'Usability Testing tidak menggunakan skenario tugas.',
        'Keduanya adalah proses yang sama persis.',
      ],
      correctIndex: 0,
      explanation: 'Keduanya saling melengkapi: evaluasi heuristik cepat menangkap masalah dasar, lalu usability testing memvalidasi dengan pengguna asli.',
    },
    {
      id: 'm12-q3',
      question: 'Saat memoderasi sesi usability testing, hal apa yang HARUS dihindari fasilitator?',
      options: [
        'Memberikan skenario tugas yang realistis.',
        'Mengarahkan jawaban atau memberi petunjuk tombol mana yang harus diklik terlalu cepat.',
        'Mencatat waktu dan titik kebingungan partisipan.',
        'Menegaskan bahwa yang diuji adalah desainnya, bukan kemampuan partisipan.',
      ],
      correctIndex: 1,
      explanation: 'Pertanyaan yang menggiring (leading questions) atau langsung membantu akan merusak objektivitas temuan masalah UX.',
    },
  ],

  /* ── 13 Design Handoff ── */
  13: [
    {
      id: 'm13-q1',
      question: 'Informasi apa saja yang penting disertakan saat melakukan design handoff ke developer?',
      options: [
        'Hanya screenshot halaman tanpa keterangan ukuran.',
        'Spesifikasi spacing, tipografi, token warna, aset ekspor, serta edge states (kosong, loading, error).',
        'Hanya catatan wawancara mentah.',
        'File desain dengan nama layer acak seperti "Rectangle 99".',
      ],
      correctIndex: 1,
      explanation: 'Handoff yang lengkap mengurangi miskomunikasi dan memastikan hasil implementasi frontend akurat dengan rancangan.',
    },
    {
      id: 'm13-q2',
      question: 'Mengapa penamaan layer dan pengelompokan frame yang rapi penting sebelum handoff?',
      options: [
        'Memudahkan developer menginspeksi struktur hierarki komponen dan memetakan ke struktur kode.',
        'Supaya file tidak bisa dibuka orang lain.',
        'Karena warna akan berubah jika layer tidak dinamai.',
        'Hanya syarat estetika semata tanpa dampak teknis.',
      ],
      correctIndex: 0,
      explanation: 'Struktur layer yang logis langsung membantu developer memahami container, alignment, dan komponen yang dapat digunakan ulang.',
    },
    {
      id: 'm13-q3',
      question: 'Kapan kolaborasi antara desainer dan developer sebaiknya dimulai?',
      options: [
        'Baru bertemu sekali saat seluruh desain selesai 100%.',
        'Sejak awal proses desain untuk menyelaraskan batasan teknis dan kelayakan implementasi.',
        'Setelah produk masuk masa pemeliharaan tahun kedua.',
        'Tidak perlu berkomunikasi selama ada file PDF.',
      ],
      correctIndex: 1,
      explanation: 'Melibatkan developer lebih awal mencegah desain yang tidak realistis secara teknis dan mempercepat proses delivery.',
    },
  ],

  /* ── 14 Portfolio UX ── */
  14: [
    {
      id: 'm14-q1',
      question: 'Apa elemen paling dicari perekrut atau dosen dalam sebuah UX Case Study?',
      options: [
        'Hanya galeri mockup akhir tanpa penjelasan konteks.',
        'Proses berpikir: masalah yang dihadapi, metode riset, keputusan desain, iterasi, dan dampaknya.',
        'Daftar seluruh software yang pernah diinstal.',
        'Teks teori panjang yang disalin dari buku.',
      ],
      correctIndex: 1,
      explanation: 'Case study yang kuat menunjukkan *mengapa* keputusan desain diambil berdasarkan masalah dan data, bukan sekadar hasil visual.',
    },
    {
      id: 'm14-q2',
      question: 'Mengapa mencantumkan peran spesifik kamu dalam proyek tim di portfolio sangat penting?',
      options: [
        'Agar pembaca tahu kontribusi nyata yang kamu kerjakan (misal riset, wireframing, prototyping).',
        'Untuk menyembunyikan anggota tim lain.',
        'Agar halaman terlihat lebih penuh teks.',
        'Tidak penting karena semua proyek dianggap kerja individu.',
      ],
      correctIndex: 0,
      explanation: 'Transparansi peran menunjukkan akuntabilitas dan keahlian utama yang benar-benar kamu kuasai.',
    },
    {
      id: 'm14-q3',
      question: 'Bagaimana cara menyajikan hasil iterasi desain yang meyakinkan di portfolio?',
      options: [
        'Tampilkan perbandingan sebelum dan sesudah perbaikan beserta alasan berbasis temuan testing.',
        'Hapus seluruh sketsa awal agar terlihat sempurna sejak percobaan pertama.',
        'Gunakan teks ukuran 8px agar semua muat dalam satu gambar.',
        'Hindari menyebut tantangan atau kendala proyek.',
      ],
      correctIndex: 0,
      explanation: 'Menunjukkan iterasi berbasis feedback membuktikan kematangan proses UX dan kemampuan belajar dari data.',
    },
  ],

  /* ── 15 Capstone Project ── */
  15: [
    {
      id: 'm15-q1',
      question: 'Apa urutan alur kerja end-to-end yang tepat dalam pengerjaan Capstone Project UI/UX?',
      options: [
        'Visual Hi-Fi → Brief → Riset → Sketsa',
        'Brief & Riset → Ideation & Wireframe → Visual UI & Prototipe Hi-Fi → Usability Testing & Dokumentasi',
        'Dokumentasi Final → Usability Testing → Pemilihan Topik',
        'Langsung buat desain akhir tanpa validasi pengguna',
      ],
      correctIndex: 1,
      explanation: 'Alur terstruktur memastikan desain visual dan prototipe dibangun di atas fondasi riset yang valid lalu diuji kembali.',
    },
    {
      id: 'm15-q2',
      question: 'Mengapa usability testing wajib dilakukan pada prototipe Capstone sebelum dokumentasi final?',
      options: [
        'Untuk memvalidasi apakah solusi benar-benar menyelesaikan masalah pengguna dan menemukan perbaikan terakhir.',
        'Sekadar formalitas tanpa perlu memperbaiki temuan.',
        'Untuk mengganti seluruh topik proyek di hari terakhir.',
        'Agar jumlah slide presentasi bertambah.',
      ],
      correctIndex: 0,
      explanation: 'Data hasil usability testing menjadi bukti objektif kualitas solusi yang kamu bangun pada proyek akhir.',
    },
    {
      id: 'm15-q3',
      question: 'Apa kriteria brief proyek Capstone yang baik?',
      options: [
        'Sangat luas dan tidak jelas target penggunanya.',
        'Memiliki ruang lingkup jelas, target pengguna terdefinisi, masalah nyata, dan indikator keberhasilan.',
        'Hanya berisi permintaan warna favorit pembuatnya.',
        'Meniru 100% aplikasi lain tanpa analisis masalah.',
      ],
      correctIndex: 1,
      explanation: 'Brief yang fokus dan terukur menjaga pengerjaan Capstone tetap terarah dari riset sampai evaluasi akhir.',
    },
  ],

  /* ── 16 UAS — Design Review ── */
  16: [
    {
      id: 'm16-q1',
      question: 'Apa fokus utama saat mempresentasikan hasil desain pada sesi Design Review (UAS)?',
      options: [
        'Membacakan seluruh teks di slide kata demi kata.',
        'Menjelaskan masalah pengguna, alasan di balik keputusan desain, demo alur utama, serta hasil evaluasi/testing.',
        'Hanya menunjukkan logo aplikasi selama 10 menit.',
        'Menghindari pertanyaan dan masukan dari penguji.',
      ],
      correctIndex: 1,
      explanation: 'Design Review menilai kedalaman argumen UX, konsistensi antarmuka, dan bagaimana desain menjawab kebutuhan pengguna.',
    },
    {
      id: 'm16-q2',
      question: 'Bagaimana sikap profesional terbaik saat menerima kritik tajam terhadap desain di sesi Design Review?',
      options: [
        'Langsung membela diri secara emosional dan menolak semua masukan.',
        'Mendengarkan dengan objektif, mencatat poin kritik, mengklarifikasi konteks, dan menjadikannya bahan iterasi.',
        'Menghapus seluruh file proyek saat itu juga.',
        'Menyalahkan pengguna karena tidak paham desain kita.',
      ],
      correctIndex: 1,
      explanation: 'Dalam praktik UX profesional, kritik ditujukan pada artefak desain untuk membuatnya lebih baik bagi pengguna, bukan serangan personal.',
    },
    {
      id: 'm16-q3',
      question: 'Apa aspek penting yang biasanya dinilai dalam rubrik Design Review UI/UX?',
      options: [
        'Kejelasan masalah & riset, konsistensi visual & aksesibilitas, kelancaran alur interaksi, dan kualitas validasi.',
        'Jumlah efek animasi berputar di halaman.',
        'Seberapa mahal laptop yang digunakan saat presentasi.',
        'Banyaknya warna neon yang dipakai sekaligus.',
      ],
      correctIndex: 0,
      explanation: 'Rubrik evaluasi UI/UX berfokus pada ketepatan solusi terhadap pengguna, kemudahan penggunaan (usability), konsistensi, dan aksesibilitas.',
    },
    {
      id: 'm16-q4',
      question: 'Apa tujuan bagian Refleksi di akhir proyek UI/UX?',
      options: [
        'Mengevaluasi pembelajaran yang didapat, keterbatasan desain saat ini, dan rencana pengembangan selanjutnya.',
        'Mengisi halaman kosong tanpa isi bermakna.',
        'Menutup proyek tanpa pernah melihat feedback lagi.',
        'Mengulang kembali daftar isi di awal presentasi.',
      ],
      correctIndex: 0,
      explanation: 'Refleksi menunjukkan kesadaran kritis desainer terhadap proses yang dijalani dan arah perbaikan di iterasi berikutnya.',
    },
  ],
}
