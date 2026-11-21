import { Lightbulb } from 'lucide-react'

export interface SubBabData {
  id: number
  title: string
}

export interface SubBabContent {
  heading: string
  body: React.ReactNode
}

/**
 * Sub-bab definitions per module (keyed by module id).
 * The number of sub-babs MUST match the `subs` count in modules.ts.
 */
export const moduleSubBabs: Record<number, SubBabData[]> = {
  /* ── 01 Pengantar UX Design (4 sub-bab) ── */
  1: [
    { id: 1, title: 'Apa itu UX Design?' },
    { id: 2, title: 'UX vs UI: Perbedaan Mendasar' },
    { id: 3, title: 'Peran UX dalam Produk Digital' },
    { id: 4, title: 'Proses Design Thinking' },
  ],

  /* ── 02 Analisis Pengguna & Persona (5 sub-bab) ── */
  2: [
    { id: 1, title: 'Riset Pengguna' },
    { id: 2, title: 'Membuat User Persona' },
    { id: 3, title: 'Empathy Mapping' },
    { id: 4, title: 'User Journey Map' },
    { id: 5, title: 'Studi Kasus: Persona Nyata' },
  ],

  /* ── 03 Information Architecture (5 sub-bab) ── */
  3: [
    { id: 1, title: 'Dasar Information Architecture' },
    { id: 2, title: 'Card Sorting' },
    { id: 3, title: 'Sitemap & Navigasi' },
    { id: 4, title: 'Labeling & Taxonomy' },
    { id: 5, title: 'Studi Kasus: IA Aplikasi' },
  ],

  /* ── 04 Wireframing & Sketsa (5 sub-bab) ── */
  4: [
    { id: 1, title: 'Pengenalan Wireframing' },
    { id: 2, title: 'Teknik Rapid Sketching' },
    { id: 3, title: 'Low-Fidelity Wireframe' },
    { id: 4, title: 'Prinsip Layout Dasar' },
    { id: 5, title: 'Tools & Best Practice' },
  ],

  /* ── 05 Grid Systems & Layout (4 sub-bab) ── */
  5: [
    { id: 1, title: 'Sistem Grid Responsif' },
    { id: 2, title: 'Alignment & Spacing' },
    { id: 3, title: 'Komposisi Visual' },
    { id: 4, title: 'Studi Kasus: Grid Nyata' },
  ],

  /* ── 06 Color Theory & Palette (5 sub-bab) ── */
  6: [
    { id: 1, title: 'Dasar Teori Warna' },
    { id: 2, title: 'Psikologi Warna' },
    { id: 3, title: 'Kontras & Aksesibilitas WCAG' },
    { id: 4, title: 'Membuat Palet Warna' },
    { id: 5, title: 'Studi Kasus: Palet Produk' },
  ],

  /* ── 07 Typography & Readability (4 sub-bab) ── */
  7: [
    { id: 1, title: 'Pemilihan Typeface' },
    { id: 2, title: 'Hierarki Tipografi' },
    { id: 3, title: 'Readability & Legibility' },
    { id: 4, title: 'Font Pairing' },
  ],

  /* ── 08 UTS — Interactive Prototyping (3 sub-bab) ── */
  8: [
    { id: 1, title: 'Brief Ujian & Panduan' },
    { id: 2, title: 'Membuat Prototipe Interaktif' },
    { id: 3, title: 'Presentasi & Submission' },
  ],

  /* ── 09 Design System & UI Tokens (6 sub-bab) ── */
  9: [
    { id: 1, title: 'Apa itu Design System?' },
    { id: 2, title: 'Komponen UI Dasar' },
    { id: 3, title: 'Token & Variabel Desain' },
    { id: 4, title: 'Membangun Component Library' },
    { id: 5, title: 'Dokumentasi & Handoff' },
    { id: 6, title: 'Studi Kasus: Design System Nyata' },
  ],

  /* ── 10 Interaction Design (5 sub-bab) ── */
  10: [
    { id: 1, title: 'Prinsip Interaksi' },
    { id: 2, title: 'Micro-Interaction' },
    { id: 3, title: 'Gesture Design' },
    { id: 4, title: 'Feedback Visual' },
    { id: 5, title: 'Studi Kasus: Interaksi Produk' },
  ],

  /* ── 11 Responsive & Adaptive (5 sub-bab) ── */
  11: [
    { id: 1, title: 'Desain Mobile-First' },
    { id: 2, title: 'Breakpoint & Media Query' },
    { id: 3, title: 'Responsive Layout Pattern' },
    { id: 4, title: 'Adaptive vs Responsive' },
    { id: 5, title: 'Studi Kasus: Responsif Nyata' },
  ],

  /* ── 12 Usability Testing (5 sub-bab) ── */
  12: [
    { id: 1, title: 'Metode Usability Testing' },
    { id: 2, title: 'Task Analysis' },
    { id: 3, title: 'Think-Aloud Protocol' },
    { id: 4, title: 'Heuristic Evaluation' },
    { id: 5, title: 'Analisis & Laporan Hasil' },
  ],

  /* ── 13 Design Handoff (4 sub-bab) ── */
  13: [
    { id: 1, title: 'Persiapan Handoff' },
    { id: 2, title: 'Spesifikasi Desain' },
    { id: 3, title: 'Tools Kolaborasi' },
    { id: 4, title: 'Best Practice Handoff' },
  ],

  /* ── 14 Portfolio UX (6 sub-bab) ── */
  14: [
    { id: 1, title: 'Struktur Portfolio' },
    { id: 2, title: 'UX Case Study' },
    { id: 3, title: 'Visual Storytelling' },
    { id: 4, title: 'Platform & Tools' },
    { id: 5, title: 'Review & Feedback' },
    { id: 6, title: 'Contoh Portfolio Inspiratif' },
  ],

  /* ── 15 Capstone Project (8 sub-bab) ── */
  15: [
    { id: 1, title: 'Pemilihan Topik & Brief' },
    { id: 2, title: 'Riset & Discovery' },
    { id: 3, title: 'Ideation & Sketsa' },
    { id: 4, title: 'Wireframe & IA' },
    { id: 5, title: 'Visual Design & UI' },
    { id: 6, title: 'Prototipe Hi-Fi' },
    { id: 7, title: 'Usability Testing' },
    { id: 8, title: 'Dokumentasi Final' },
  ],

  /* ── 16 UAS — Design Review (3 sub-bab) ── */
  16: [
    { id: 1, title: 'Panduan Presentasi' },
    { id: 2, title: 'Review & Evaluasi' },
    { id: 3, title: 'Refleksi & Penutup' },
  ],
}

/**
 * Sub-bab content per sub-bab title.
 * Content is shared across modules when titles match.
 */
export const subBabContent: Record<string, SubBabContent> = {
  /* ════════════════════════════════════════════
   *  MODULE 1: Pengantar UX Design
   * ════════════════════════════════════════════ */
  'Apa itu UX Design?': {
    heading: 'Apa itu UX Design?',
    body: (
      <div className="space-y-5">
        <p>User Experience (UX) Design adalah proses merancang produk yang memberikan pengalaman bermakna dan relevan bagi penggunanya. UX mencakup seluruh aspek interaksi pengguna dengan produk — mulai dari kegunaan, aksesibilitas, hingga kesenangan saat menggunakannya.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Elemen Utama UX</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Usefulness', desc: 'Produk harus berguna dan menyelesaikan masalah nyata pengguna.' },
            { title: 'Usability', desc: 'Produk mudah digunakan dan dipelajari.' },
            { title: 'Desirability', desc: 'Produk menarik secara visual dan emosional.' },
            { title: 'Accessibility', desc: 'Produk dapat digunakan oleh semua orang, termasuk penyandang disabilitas.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'UX vs UI: Perbedaan Mendasar': {
    heading: 'UX vs UI: Perbedaan Mendasar',
    body: (
      <div className="space-y-5">
        <p>Banyak orang mencampurkan UX dan UI, padahal keduanya adalah disiplin yang berbeda namun saling melengkapi. Memahami perbedaannya penting agar kamu bisa fokus pada skill yang tepat.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-ink-9 rounded-xl">
            <strong className="text-ink text-sm block mb-2">UX Design</strong>
            <ul className="space-y-1 text-sm text-ink-4">
              <li>Fokus pada pengalaman keseluruhan</li>
              <li>Riset pengguna & data</li>
              <li>Wireframe & prototipe</li>
              <li>User journey & flow</li>
            </ul>
          </div>
          <div className="p-4 bg-ink-9 rounded-xl">
            <strong className="text-ink text-sm block mb-2">UI Design</strong>
            <ul className="space-y-1 text-sm text-ink-4">
              <li>Fokus pada tampilan visual</li>
              <li>Warna, tipografi, iconography</li>
              <li>Komponen & style guide</li>
              <li>Animasi & micro-interaction</li>
            </ul>
          </div>
        </div>
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mt-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div><strong className="text-teal-700 text-sm">Analogi Sederhana</strong><p className="text-sm text-teal-700/80 mt-1">UX adalah bagaimana rumah dirancang agar nyaman ditinggali (denah, sirkulasi), sedangkan UI adalah bagaimana rumah didekorasi agar indah (cat, furnitur).</p></div>
          </div>
        </div>
      </div>
    ),
  },
  'Peran UX dalam Produk Digital': {
    heading: 'Peran UX dalam Produk Digital',
    body: (
      <div className="space-y-5">
        <p>UX Design memainkan peran krusial dalam keberhasilan produk digital. Produk dengan UX yang baik memiliki tingkat adopsi lebih tinggi, retensi pengguna lebih baik, dan biaya support lebih rendah.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Dampak UX yang Baik</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Konversi Meningkat', desc: 'UX yang baik bisa meningkatkan konversi hingga 200-400%.' },
            { title: 'Biaya Lebih Rendah', desc: 'Memperbaiki masalah di tahap desain 100x lebih murah daripada di tahap development.' },
            { title: 'Loyalitas Pengguna', desc: '88% pengguna tidak kembali setelah pengalaman buruk.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Proses Design Thinking': {
    heading: 'Proses Design Thinking',
    body: (
      <div className="space-y-5">
        <p>Design Thinking adalah metodologi yang digunakan oleh desainer untuk menyelesaikan masalah kompleks. Prosesnya iteratif dan berpusat pada pengguna.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">5 Tahapan Design Thinking</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Empathize', desc: 'Memahami kebutuhan dan masalah pengguna melalui observasi dan riset.' },
            { title: 'Define', desc: 'Merumuskan masalah utama yang akan diselesaikan.' },
            { title: 'Ideate', desc: 'Menghasilkan ide-ide solusi sebanyak mungkin.' },
            { title: 'Prototype', desc: 'Membuat versi sederhana dari solusi terbaik.' },
            { title: 'Test', desc: 'Menguji prototipe dengan pengguna nyata dan iterasi.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },

  /* ════════════════════════════════════════════
   *  MODULE 2: Analisis Pengguna & Persona
   * ════════════════════════════════════════════ */
  'Riset Pengguna': {
    heading: 'Riset Pengguna',
    body: (
      <div className="space-y-5">
        <p>Riset pengguna adalah fondasi dari desain yang baik. Tanpa memahami pengguna, kita hanya menebak-nebak. Ada dua jenis utama riset: kualitatif dan kuantitatif.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Metode Riset Populer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Wawancara Mendalam', 'Survei Online', 'Observasi Kontekstual', 'A/B Testing', 'Analisis Kompetitor', 'Diary Study'].map((m, i) => (
            <div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{m}</strong></div>
          ))}
        </div>
      </div>
    ),
  },
  'Membuat User Persona': {
    heading: 'Membuat User Persona',
    body: (
      <div className="space-y-5">
        <p>User Persona adalah representasi fiktif dari pengguna ideal kamu, berdasarkan data riset nyata. Persona membantu tim membuat keputusan desain yang berpusat pada pengguna.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Elemen Persona</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Demografi', desc: 'Nama, usia, pekerjaan, lokasi, pendidikan.' },
            { title: 'Goals & Motivasi', desc: 'Apa yang ingin dicapai pengguna.' },
            { title: 'Pain Points', desc: 'Frustrasi dan masalah yang dihadapi.' },
            { title: 'Perilaku', desc: 'Bagaimana mereka menggunakan teknologi sehari-hari.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Empathy Mapping': {
    heading: 'Empathy Mapping',
    body: (
      <div className="space-y-5">
        <p>Empathy Map adalah alat visual untuk memahami pengguna secara mendalam. Dibagi menjadi 4 kuadran yang menggambarkan apa yang pengguna pikirkan, rasakan, katakan, dan lakukan.</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: 'Think & Feel', desc: 'Apa yang ada di pikiran pengguna? Apa kekhawatiran mereka?' },
            { title: 'See', desc: 'Apa yang dilihat pengguna di lingkungan mereka?' },
            { title: 'Say & Do', desc: 'Apa yang dikatakan dan dilakukan pengguna?' },
            { title: 'Hear', desc: 'Apa yang didengar dari teman, keluarga, media?' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-ink-9 rounded-xl">
              <strong className="text-ink text-sm">{item.title}</strong>
              <p className="text-xs text-ink-4 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  'User Journey Map': {
    heading: 'User Journey Map',
    body: (
      <div className="space-y-5">
        <p>User Journey Map adalah visualisasi langkah-langkah yang diambil pengguna saat berinteraksi dengan produk kamu. Map ini membantu mengidentifikasi titik-titik masalah dan peluang perbaikan.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Komponen Journey Map</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Tahapan (Stages)', desc: 'Fase-fase utama dalam perjalanan pengguna.' },
            { title: 'Aksi (Actions)', desc: 'Apa yang dilakukan pengguna di setiap tahap.' },
            { title: 'Emosi', desc: 'Perasaan pengguna: positif, netral, atau negatif.' },
            { title: 'Touchpoints', desc: 'Titik kontak antara pengguna dan produk.' },
            { title: 'Peluang', desc: 'Area yang bisa ditingkatkan.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Studi Kasus: Persona Nyata': {
    heading: 'Studi Kasus: Persona Nyata',
    body: (
      <div className="space-y-5">
        <p>Mari lihat contoh persona dan journey map dari produk nyata untuk memahami penerapannya.</p>
        <div className="p-4 bg-ink-9 rounded-xl">
          <strong className="text-ink text-sm">Contoh: Aplikasi E-Learning</strong>
          <p className="text-xs text-ink-4 mt-2">Persona: Rina, 22 tahun, mahasiswa semester 5. Goal: Belajar UI/UX secara mandiri di luar jam kuliah. Pain point: Materi tersebar, sulit mengukur progress.</p>
        </div>
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div><strong className="text-teal-700 text-sm">Latihan</strong><p className="text-sm text-teal-700/80 mt-1">Coba buat persona untuk aplikasi yang sering kamu gunakan sehari-hari. Identifikasi minimal 3 pain points.</p></div>
          </div>
        </div>
      </div>
    ),
  },

  /* ════════════════════════════════════════════
   *  MODULE 3: Information Architecture
   * ════════════════════════════════════════════ */
  'Dasar Information Architecture': {
    heading: 'Dasar Information Architecture',
    body: (
      <div className="space-y-5">
        <p>Information Architecture (IA) adalah seni dan ilmu mengorganisasi, menyusun, dan melabeli konten agar pengguna bisa menemukan apa yang mereka butuhkan dengan mudah.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Prinsip Utama IA</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Findability', desc: 'Konten harus mudah ditemukan.' },
            { title: 'Understandability', desc: 'Struktur harus logis dan mudah dipahami.' },
            { title: 'Scalability', desc: 'Arsitektur harus bisa tumbuh bersama produk.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Card Sorting': {
    heading: 'Card Sorting',
    body: (
      <div className="space-y-5">
        <p>Card sorting adalah metode riset UX untuk memahami bagaimana pengguna mengkategorikan informasi. Metode ini membantu membuat struktur navigasi yang intuitif.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">Open Card Sort</strong><p className="text-xs text-ink-4 mt-1">Peserta bebas mengelompokkan dan memberi nama kategori.</p></div>
          <div className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">Closed Card Sort</strong><p className="text-xs text-ink-4 mt-1">Kategori sudah ditentukan, peserta mengelompokkan item ke dalamnya.</p></div>
        </div>
      </div>
    ),
  },
  'Sitemap & Navigasi': {
    heading: 'Sitemap & Navigasi',
    body: (
      <div className="space-y-5">
        <p>Sitemap adalah diagram visual yang menunjukkan hierarki dan hubungan antar halaman. Navigasi yang baik membantu pengguna berpindah antar bagian produk dengan efisien.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Pola Navigasi Umum</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Tab Bar', 'Hamburger Menu', 'Breadcrumb', 'Sidebar Navigation'].map((n, i) => (
            <div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{n}</strong></div>
          ))}
        </div>
      </div>
    ),
  },
  'Labeling & Taxonomy': {
    heading: 'Labeling & Taxonomy',
    body: (
      <div className="space-y-5">
        <p>Labeling adalah proses memberi nama yang tepat pada elemen navigasi, tombol, dan kategori. Label yang baik adalah yang langsung dipahami pengguna tanpa perlu berpikir.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Prinsip Labeling</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Jelas & Spesifik', desc: 'Gunakan bahasa yang langsung menjelaskan konten.' },
            { title: 'Konsisten', desc: 'Gunakan terminologi yang sama di seluruh produk.' },
            { title: 'Familiar', desc: 'Gunakan istilah yang sudah dikenal pengguna.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Studi Kasus: IA Aplikasi': {
    heading: 'Studi Kasus: IA Aplikasi',
    body: (
      <div className="space-y-5">
        <p>Mari analisis information architecture dari aplikasi populer dan pelajari mengapa strukturnya efektif.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Tokopedia', desc: 'Hierarki kategori produk yang mendalam namun tetap navigable.' },
            { name: 'Gojek', desc: 'Layanan dikelompokkan berdasarkan kebutuhan pengguna.' },
          ].map((app, i) => (
            <div key={i} className="p-4 bg-ink-9 rounded-xl">
              <strong className="text-ink text-sm">{app.name}</strong>
              <p className="text-xs text-ink-4 mt-1">{app.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* ════════════════════════════════════════════
   *  MODULE 4: Wireframing & Sketsa
   * ════════════════════════════════════════════ */
  'Pengenalan Wireframing': {
    heading: 'Pengenalan Wireframing',
    body: (
      <div className="space-y-5">
        <p>Wireframe adalah representasi visual low-fidelity dari sebuah halaman atau screen. Wireframe fokus pada struktur konten, hierarki informasi, dan fungsionalitas — bukan estetika visual.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Jenis Wireframe</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Low-Fidelity', desc: 'Sketsa kasar, cepat dibuat, fokus pada layout dan flow.' },
            { title: 'Mid-Fidelity', desc: 'Lebih detail, sudah ada placeholder konten dan sizing.' },
            { title: 'High-Fidelity', desc: 'Mendekati desain final, detail tipografi dan spacing.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Teknik Rapid Sketching': {
    heading: 'Teknik Rapid Sketching',
    body: (
      <div className="space-y-5">
        <p>Rapid sketching adalah teknik cepat untuk mengeksplorasi banyak ide dalam waktu singkat. Tujuannya bukan membuat gambar yang bagus, melainkan mengeksplorasi sebanyak mungkin solusi.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Metode Populer</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Crazy 8s', '6-Up Sketching', 'Storyboarding', 'Concept Sketching'].map((m, i) => (
            <div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{m}</strong></div>
          ))}
        </div>
      </div>
    ),
  },
  'Low-Fidelity Wireframe': {
    heading: 'Low-Fidelity Wireframe',
    body: (
      <div className="space-y-5">
        <p>Low-fi wireframe adalah langkah pertama dalam menerjemahkan ide menjadi bentuk visual. Gunakan kotak, garis, dan teks sederhana untuk merepresentasikan elemen UI.</p>
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div><strong className="text-teal-700 text-sm">Tips</strong><p className="text-sm text-teal-700/80 mt-1">Jangan terlalu detail di tahap ini. Fokus pada penempatan elemen utama dan alur interaksi.</p></div>
          </div>
        </div>
      </div>
    ),
  },
  'Prinsip Layout Dasar': {
    heading: 'Prinsip Layout Dasar',
    body: (
      <div className="space-y-5">
        <p>Layout yang baik memandu mata pengguna ke informasi yang paling penting. Prinsip-prinsip dasar layout membantu kamu membuat wireframe yang efektif.</p>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Visual Hierarchy', desc: 'Elemen penting harus paling menonjol.' },
            { title: 'Proximity', desc: 'Elemen yang terkait harus berdekatan.' },
            { title: 'Alignment', desc: 'Elemen harus sejajar untuk menciptakan keteraturan.' },
            { title: 'Whitespace', desc: 'Ruang kosong membantu fokus dan readability.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Tools & Best Practice': {
    heading: 'Tools & Best Practice',
    body: (
      <div className="space-y-5">
        <p>Ada banyak tools untuk membuat wireframe, dari yang sederhana hingga profesional.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Figma', desc: 'Kolaboratif, gratis, dan bisa untuk wireframe hingga hi-fi.' },
            { name: 'Whimsical', desc: 'Simpel dan cepat untuk wireframe dan flowchart.' },
            { name: 'Balsamiq', desc: 'Fokus wireframe low-fi dengan tampilan sketsa.' },
            { name: 'Pensil & Kertas', desc: 'Cara tercepat untuk eksplorasi ide awal.' },
          ].map((tool, i) => (
            <div key={i} className="p-4 bg-ink-9 rounded-xl">
              <strong className="text-ink text-sm">{tool.name}</strong>
              <p className="text-xs text-ink-4 mt-1">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* ════════════════════════════════════════════
   *  MODULE 5: Grid Systems & Layout
   * ════════════════════════════════════════════ */
  'Sistem Grid Responsif': {
    heading: 'Sistem Grid Responsif',
    body: (
      <div className="space-y-5">
        <p>Grid system adalah kerangka kolom dan baris yang digunakan untuk mengatur tata letak konten secara konsisten. Grid 12 kolom adalah standar yang paling umum digunakan di web design.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Komponen Grid</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Columns', desc: 'Kolom vertikal tempat konten diletakkan (umumnya 12).' },
            { title: 'Gutters', desc: 'Jarak antar kolom untuk memberi ruang napas.' },
            { title: 'Margins', desc: 'Jarak antara tepi konten dan tepi layar.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Alignment & Spacing': {
    heading: 'Alignment & Spacing',
    body: (
      <div className="space-y-5">
        <p>Alignment dan spacing yang konsisten membuat desain terlihat profesional dan mudah dibaca. Gunakan spacing scale (4, 8, 12, 16, 24, 32, 48, 64) untuk konsistensi.</p>
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div><strong className="text-teal-700 text-sm">Tips</strong><p className="text-sm text-teal-700/80 mt-1">Gunakan kelipatan 4px atau 8px sebagai base unit spacing. Ini memudahkan konsistensi di seluruh desain.</p></div>
          </div>
        </div>
      </div>
    ),
  },
  'Komposisi Visual': {
    heading: 'Komposisi Visual',
    body: (
      <div className="space-y-5">
        <p>Komposisi visual menentukan bagaimana elemen-elemen disusun untuk menciptakan harmoni dan mengarahkan perhatian pengguna ke informasi yang paling penting.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Prinsip Komposisi</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Rule of Thirds', desc: 'Bagi area menjadi 3x3 grid, letakkan elemen penting di titik pertemuan.' },
            { title: 'F-Pattern & Z-Pattern', desc: 'Pola scanning mata pengguna saat membaca konten web.' },
            { title: 'Visual Weight', desc: 'Elemen yang lebih besar, berwarna tegas, atau kontras tinggi menarik perhatian lebih.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Studi Kasus: Grid Nyata': {
    heading: 'Studi Kasus: Grid Nyata',
    body: (
      <div className="space-y-5">
        <p>Mari analisis penggunaan grid system di website populer dan pelajari bagaimana grid diterapkan secara efektif.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Apple.com', desc: 'Grid yang sangat bersih dengan whitespace generus.' },
            { name: 'Medium.com', desc: 'Single column optimal untuk readability konten panjang.' },
          ].map((site, i) => (
            <div key={i} className="p-4 bg-ink-9 rounded-xl">
              <strong className="text-ink text-sm">{site.name}</strong>
              <p className="text-xs text-ink-4 mt-1">{site.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* ════════════════════════════════════════════
   *  MODULE 6–16: Remaining modules
   *  Using a consistent pattern
   * ════════════════════════════════════════════ */

  /* Module 6 */
  'Dasar Teori Warna': { heading: 'Dasar Teori Warna', body: (<div className="space-y-5"><p>Teori warna adalah fondasi desain visual. Memahami color wheel, hubungan warna (complementary, analogous, triadic), dan model warna (RGB, HSL, CMYK) sangat penting.</p><h2 className="text-lg font-bold text-ink mt-8 mb-3">Model Warna</h2><div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{['RGB (Additive)', 'CMYK (Subtractive)', 'HSL (Hue-Sat-Light)'].map((m, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl text-center"><strong className="text-ink text-sm">{m}</strong></div>))}</div></div>) },
  'Psikologi Warna': { heading: 'Psikologi Warna', body: (<div className="space-y-5"><p>Warna memiliki pengaruh psikologis yang kuat. Pemilihan warna yang tepat bisa mempengaruhi emosi, persepsi, dan tindakan pengguna.</p><div className="grid grid-cols-2 gap-3">{[{ c: 'Biru', d: 'Kepercayaan, profesionalisme' }, { c: 'Hijau', d: 'Alam, pertumbuhan, kesehatan' }, { c: 'Merah', d: 'Urgensi, energi, passion' }, { c: 'Kuning', d: 'Optimisme, kehangatan' }].map((w, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{w.c}</strong><p className="text-xs text-ink-4">{w.d}</p></div>))}</div></div>) },
  'Kontras & Aksesibilitas WCAG': { heading: 'Kontras & Aksesibilitas WCAG', body: (<div className="space-y-5"><p>WCAG menetapkan rasio kontras minimum agar konten dapat dibaca oleh semua orang. Teks normal membutuhkan minimal 4.5:1, teks besar minimal 3:1 (level AA).</p><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Tools Cek Kontras</strong><p className="text-sm text-teal-700/80 mt-1">Gunakan WebAIM Contrast Checker, Stark plugin di Figma, atau Chrome DevTools untuk memverifikasi rasio kontras.</p></div></div></div></div>) },
  'Membuat Palet Warna': { heading: 'Membuat Palet Warna', body: (<div className="space-y-5"><p>Palet warna yang baik biasanya terdiri dari: primary color, secondary color, semantic colors (error, warning, success, info), dan neutral colors (gray scale).</p><h2 className="text-lg font-bold text-ink mt-8 mb-3">Langkah Membuat Palet</h2><ul className="space-y-2 ml-0 list-none">{[{ title: 'Pilih Primary', desc: 'Warna utama yang merepresentasikan brand.' }, { title: 'Generate Shades', desc: 'Buat 9-10 shade dari terang ke gelap.' }, { title: 'Tambahkan Semantic', desc: 'Warna untuk status: error, warning, success.' }, { title: 'Tes Aksesibilitas', desc: 'Pastikan semua kombinasi memenuhi WCAG.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Studi Kasus: Palet Produk': { heading: 'Studi Kasus: Palet Produk', body: (<div className="space-y-5"><p>Pelajari bagaimana produk besar memilih dan menggunakan palet warna mereka.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Spotify', desc: 'Hijau cerah #1DB954 pada dark theme — high contrast & energetic.' }, { name: 'Slack', desc: 'Palet multi-warna untuk membedakan workspace dan channel.' }].map((p, i) => (<div key={i} className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{p.name}</strong><p className="text-xs text-ink-4 mt-1">{p.desc}</p></div>))}</div></div>) },

  /* Module 7 */
  'Pemilihan Typeface': { heading: 'Pemilihan Typeface', body: (<div className="space-y-5"><p>Typeface menentukan karakter dan tone produk kamu. Sans-serif umumnya lebih modern dan mudah dibaca di layar, sedangkan serif lebih formal dan klasik.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Sans-Serif', desc: 'Inter, Roboto, SF Pro — modern, clean.' }, { name: 'Serif', desc: 'Georgia, Merriweather — formal, editorial.' }, { name: 'Monospace', desc: 'JetBrains Mono, Fira Code — kode, data.' }, { name: 'Display', desc: 'Playfair, Poppins Bold — heading, branding.' }].map((t, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{t.name}</strong><p className="text-xs text-ink-4">{t.desc}</p></div>))}</div></div>) },
  'Hierarki Tipografi': { heading: 'Hierarki Tipografi', body: (<div className="space-y-5"><p>Hierarki tipografi membantu pengguna memahami mana konten yang paling penting. Gunakan variasi ukuran, weight, dan warna untuk membedakan level informasi.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Display/Hero', desc: '32-48px, Extra Bold — headline utama.' }, { title: 'Heading', desc: '20-28px, Bold — judul section.' }, { title: 'Body', desc: '14-16px, Regular — konten utama.' }, { title: 'Caption', desc: '12px, Regular — info sekunder, label.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Readability & Legibility': { heading: 'Readability & Legibility', body: (<div className="space-y-5"><p>Readability adalah seberapa mudah teks dibaca, sedangkan legibility adalah seberapa mudah huruf individual dikenali. Keduanya penting untuk UX yang baik.</p><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Best Practice</strong><p className="text-sm text-teal-700/80 mt-1">Line height: 1.5-1.7x font size. Panjang baris optimal: 50-75 karakter. Hindari justified text di web.</p></div></div></div></div>) },
  'Font Pairing': { heading: 'Font Pairing', body: (<div className="space-y-5"><p>Font pairing adalah seni menggabungkan dua atau lebih typeface agar harmonis. Prinsip utamanya: contrast tapi complement.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ pair: 'Inter + Merriweather', desc: 'Sans + Serif — modern yet warm.' }, { pair: 'Poppins + Open Sans', desc: 'Geometric heading + humanist body.' }].map((p, i) => (<div key={i} className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{p.pair}</strong><p className="text-xs text-ink-4 mt-1">{p.desc}</p></div>))}</div></div>) },

  /* Module 8 */
  'Brief Ujian & Panduan': { heading: 'Brief Ujian & Panduan', body: (<div className="space-y-5"><p>UTS menguji kemampuan kamu membuat prototipe interaktif dari brief yang diberikan. Baca panduan ini dengan seksama sebelum memulai.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Durasi', desc: '120 menit untuk menyelesaikan seluruh proses.' }, { title: 'Output', desc: 'Prototipe interaktif minimal 5 screen.' }, { title: 'Penilaian', desc: 'Kelengkapan flow, kualitas visual, dan interaksi.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Membuat Prototipe Interaktif': { heading: 'Membuat Prototipe Interaktif', body: (<div className="space-y-5"><p>Prototipe interaktif mensimulasikan pengalaman pengguna yang sebenarnya. Gunakan Figma atau tools prototyping lainnya untuk menghubungkan screen dengan interaksi.</p><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Tips UTS</strong><p className="text-sm text-teal-700/80 mt-1">Mulai dari user flow utama, lalu tambahkan detail interaksi. Pastikan setiap tombol dan link terhubung.</p></div></div></div></div>) },
  'Presentasi & Submission': { heading: 'Presentasi & Submission', body: (<div className="space-y-5"><p>Setelah prototipe selesai, siapkan presentasi singkat yang menjelaskan keputusan desain kamu dan submit hasilnya.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Jelaskan user flow', desc: 'Tunjukkan alur pengguna dari awal hingga akhir.' }, { title: 'Keputusan desain', desc: 'Mengapa memilih layout, warna, dan interaksi tertentu.' }, { title: 'Submit link prototipe', desc: 'Pastikan link Figma bisa diakses reviewer.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },

  /* Module 9 — same as before */
  'Apa itu Design System?': { heading: 'Apa itu Design System?', body: (<div className="space-y-5"><p>Design system adalah kumpulan standar, prinsip, dan komponen yang terorganisir untuk memandu pembuatan produk digital secara konsisten. Ia bukan hanya tentang komponen UI — melainkan tentang proses, dokumentasi, dan pedoman desain.</p><h2 className="text-lg font-bold text-ink mt-8 mb-3">Mengapa Penting?</h2><ul className="space-y-2 ml-0 list-none">{[{ title: 'Konsistensi', desc: 'Semua halaman dan fitur terasa satu kesatuan.' }, { title: 'Efisiensi', desc: 'Tim tidak perlu mendesain ulang komponen yang sama.' }, { title: 'Kolaborasi', desc: 'Designer dan developer berbicara dalam bahasa yang sama.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Komponen UI Dasar': { heading: 'Komponen UI Dasar', body: (<div className="space-y-5"><p>Komponen UI dasar adalah fondasi dari setiap design system. Komponen-komponen ini digunakan berulang kali di seluruh produk dan harus dirancang dengan fleksibilitas tinggi.</p><h2 className="text-lg font-bold text-ink mt-8 mb-3">Komponen Fundamental</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{['Button', 'Input Field', 'Card', 'Modal', 'Badge', 'Tooltip'].map((c, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{c}</strong></div>))}</div><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mt-6"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Tips</strong><p className="text-sm text-teal-700/80 mt-1">Mulai dari komponen yang paling sering digunakan di produk kamu.</p></div></div></div></div>) },
  'Token & Variabel Desain': { heading: 'Token & Variabel Desain', body: (<div className="space-y-5"><p>Design tokens adalah value dasar dari design system: warna, spacing, font size, border radius, dan lainnya. Tokens membuat design system menjadi scalable dan mudah diubah secara global.</p><h2 className="text-lg font-bold text-ink mt-8 mb-3">Jenis Token</h2><ul className="space-y-2 ml-0 list-none">{[{ title: 'Color Tokens', desc: 'Primary, secondary, semantic (error, success, warning).' }, { title: 'Spacing Tokens', desc: 'Scale spacing: 4px, 8px, 12px, 16px, 24px, 32px, 48px.' }, { title: 'Typography Tokens', desc: 'Font family, size, weight, line-height, letter-spacing.' }, { title: 'Shadow Tokens', desc: 'Elevation levels: sm, md, lg, xl.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Membangun Component Library': { heading: 'Membangun Component Library', body: (<div className="space-y-5"><p>Component library adalah kumpulan komponen UI yang dapat digunakan kembali (reusable) di seluruh produk.</p><h2 className="text-lg font-bold text-ink mt-8 mb-3">Prinsip Utama</h2><ul className="space-y-2 ml-0 list-none">{[{ title: 'Atomic Design', desc: 'Memecah UI menjadi atom, molekul, organisme, template, dan halaman.' }, { title: 'Konsistensi', desc: 'Setiap komponen harus berperilaku dan terlihat sama di mana pun digunakan.' }, { title: 'Aksesibilitas', desc: 'Semua komponen harus memenuhi standar WCAG 2.1 AA minimal.' }, { title: 'Dokumentasi', desc: 'Setiap komponen wajib memiliki dokumentasi penggunaan.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Dokumentasi & Handoff': { heading: 'Dokumentasi & Handoff', body: (<div className="space-y-5"><p>Dokumentasi yang baik adalah kunci keberhasilan design system. Tanpa dokumentasi, design system hanya menjadi kumpulan file yang tidak terpakai.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Usage Guidelines', desc: 'Kapan dan bagaimana menggunakan komponen.' }, { title: 'Code Examples', desc: 'Contoh implementasi dalam kode.' }, { title: "Do's and Don'ts", desc: 'Praktik terbaik dan kesalahan umum.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Studi Kasus: Design System Nyata': { heading: 'Studi Kasus: Design System Nyata', body: (<div className="space-y-5"><p>Mari kita pelajari beberapa design system dunia nyata yang dapat menjadi inspirasi.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Material Design', by: 'Google', desc: 'Design system komprehensif dengan panduan lengkap untuk Android, Web, dan Flutter.' }, { name: 'Carbon', by: 'IBM', desc: 'Design system open-source dengan fokus pada aksesibilitas dan enterprise.' }, { name: 'Polaris', by: 'Shopify', desc: 'Design system untuk membangun pengalaman merchant yang konsisten.' }, { name: 'Atlassian Design', by: 'Atlassian', desc: 'Design system untuk produk-produk kolaborasi tim.' }].map((ds, i) => (<div key={i} className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{ds.name}</strong><span className="text-xs text-ink-5 ml-1">by {ds.by}</span><p className="text-xs text-ink-4 mt-1">{ds.desc}</p></div>))}</div></div>) },

  /* Module 10 */
  'Prinsip Interaksi': { heading: 'Prinsip Interaksi', body: (<div className="space-y-5"><p>Interaction design berfokus pada bagaimana pengguna berinteraksi dengan produk. Prinsip-prinsip utamanya memastikan setiap interaksi terasa alami dan bermakna.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Feedback', desc: 'Setiap aksi pengguna harus mendapat respons yang jelas.' }, { title: 'Affordance', desc: 'Elemen harus terlihat seperti apa yang bisa dilakukan dengannya.' }, { title: 'Consistency', desc: 'Pola interaksi yang sama di seluruh produk.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Micro-Interaction': { heading: 'Micro-Interaction', body: (<div className="space-y-5"><p>Micro-interaction adalah animasi kecil yang memberikan feedback, memberi petunjuk, atau menambah kesenangan saat pengguna berinteraksi dengan produk.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{['Like Button Animation', 'Pull to Refresh', 'Loading Spinner', 'Toggle Switch', 'Swipe to Delete', 'Scroll Progress'].map((m, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{m}</strong></div>))}</div></div>) },
  'Gesture Design': { heading: 'Gesture Design', body: (<div className="space-y-5"><p>Gesture design menentukan bagaimana pengguna berinteraksi dengan perangkat melalui sentuhan, swipe, pinch, dan gerakan lainnya.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Tap', desc: 'Interaksi dasar — klik pada mobile.' }, { title: 'Swipe', desc: 'Navigasi horizontal, delete, action panel.' }, { title: 'Pinch & Zoom', desc: 'Memperbesar/memperkecil konten.' }, { title: 'Long Press', desc: 'Aksi kontekstual atau mode edit.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Feedback Visual': { heading: 'Feedback Visual', body: (<div className="space-y-5"><p>Feedback visual memberi tahu pengguna bahwa aksi mereka telah diterima dan diproses. Tanpa feedback, pengguna merasa tidak yakin dan frustrasi.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Hover State', desc: 'Perubahan visual saat cursor di atas elemen.' }, { name: 'Loading State', desc: 'Indikator proses sedang berjalan.' }, { name: 'Success/Error', desc: 'Notifikasi hasil dari aksi pengguna.' }, { name: 'Transition', desc: 'Animasi perpindahan antar state.' }].map((f, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{f.name}</strong><p className="text-xs text-ink-4">{f.desc}</p></div>))}</div></div>) },
  'Studi Kasus: Interaksi Produk': { heading: 'Studi Kasus: Interaksi Produk', body: (<div className="space-y-5"><p>Pelajari bagaimana produk populer mengimplementasikan interaction design yang excellent.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Instagram', desc: 'Double-tap like, smooth scroll, story swipe.' }, { name: 'Duolingo', desc: 'Gamification micro-interactions yang membuat belajar menyenangkan.' }].map((p, i) => (<div key={i} className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{p.name}</strong><p className="text-xs text-ink-4 mt-1">{p.desc}</p></div>))}</div></div>) },

  /* Module 11 */
  'Desain Mobile-First': { heading: 'Desain Mobile-First', body: (<div className="space-y-5"><p>Mobile-first adalah pendekatan desain yang memulai dari layar terkecil (mobile) lalu secara progresif meningkatkan untuk layar lebih besar. Ini memastikan konten esensial diprioritaskan.</p><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Fakta</strong><p className="text-sm text-teal-700/80 mt-1">Lebih dari 60% traffic web global berasal dari perangkat mobile.</p></div></div></div></div>) },
  'Breakpoint & Media Query': { heading: 'Breakpoint & Media Query', body: (<div className="space-y-5"><p>Breakpoint adalah titik di mana layout berubah untuk mengakomodasi ukuran layar yang berbeda.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Mobile', desc: '< 640px — single column.' }, { name: 'Tablet', desc: '640-1024px — 2 columns.' }, { name: 'Desktop', desc: '1024-1280px — multi column.' }, { name: 'Wide', desc: '> 1280px — max-width container.' }].map((b, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{b.name}</strong><p className="text-xs text-ink-4">{b.desc}</p></div>))}</div></div>) },
  'Responsive Layout Pattern': { heading: 'Responsive Layout Pattern', body: (<div className="space-y-5"><p>Ada beberapa pola layout responsif yang umum digunakan untuk menangani perubahan ukuran layar.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Column Drop', desc: 'Kolom berpindah ke bawah saat layar mengecil.' }, { title: 'Mostly Fluid', desc: 'Layout fluid dengan max-width constraint.' }, { title: 'Layout Shifter', desc: 'Layout berubah drastis di breakpoint tertentu.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Adaptive vs Responsive': { heading: 'Adaptive vs Responsive', body: (<div className="space-y-5"><p>Responsive design menggunakan fluid layout yang menyesuaikan secara kontinu, sedangkan adaptive design menggunakan layout fixed yang berubah di breakpoint tertentu.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm block mb-2">Responsive</strong><p className="text-xs text-ink-4">Layout fleksibel, satu codebase, lebih maintenance-friendly.</p></div><div className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm block mb-2">Adaptive</strong><p className="text-xs text-ink-4">Layout spesifik per device, performa optimal, lebih banyak kode.</p></div></div></div>) },
  'Studi Kasus: Responsif Nyata': { heading: 'Studi Kasus: Responsif Nyata', body: (<div className="space-y-5"><p>Pelajari implementasi responsive design dari website yang melakukannya dengan baik.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Stripe.com', desc: 'Contoh responsif yang elegan — layout berubah halus tanpa kehilangan impact visual.' }, { name: 'GitHub', desc: 'Navigasi dan layout yang adaptif di semua ukuran layar.' }].map((s, i) => (<div key={i} className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{s.name}</strong><p className="text-xs text-ink-4 mt-1">{s.desc}</p></div>))}</div></div>) },

  /* Module 12 */
  'Metode Usability Testing': { heading: 'Metode Usability Testing', body: (<div className="space-y-5"><p>Usability testing adalah proses mengevaluasi produk dengan mengujinya langsung pada pengguna nyata. Tujuannya menemukan masalah usability sebelum produk diluncurkan.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{['Moderated Testing', 'Unmoderated Testing', 'Remote Testing', 'In-Person Testing', 'Guerrilla Testing', 'A/B Testing'].map((m, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{m}</strong></div>))}</div></div>) },
  'Task Analysis': { heading: 'Task Analysis', body: (<div className="space-y-5"><p>Task analysis memecah aktivitas pengguna menjadi langkah-langkah kecil untuk memahami bagaimana mereka mencapai tujuan. Ini membantu mengidentifikasi langkah yang tidak perlu atau membingungkan.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Definisikan Task', desc: 'Tentukan tugas spesifik yang akan diuji.' }, { title: 'Scenario', desc: 'Buat skenario realistis untuk peserta.' }, { title: 'Metrik Sukses', desc: 'Tentukan kriteria keberhasilan task.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Think-Aloud Protocol': { heading: 'Think-Aloud Protocol', body: (<div className="space-y-5"><p>Think-aloud adalah teknik di mana peserta diminta menyuarakan pikiran mereka saat mengerjakan tugas. Ini memberikan insight tentang proses berpikir dan kebingungan pengguna.</p><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Tips Fasilitasi</strong><p className="text-sm text-teal-700/80 mt-1">Jangan membantu atau mengarahkan peserta. Biarkan mereka berjuang sendiri — itu justru mengungkap masalah desain.</p></div></div></div></div>) },
  'Heuristic Evaluation': { heading: 'Heuristic Evaluation', body: (<div className="space-y-5"><p>Heuristic evaluation menggunakan prinsip-prinsip usability (heuristics) untuk mengevaluasi desain tanpa melibatkan pengguna. Metode Nielsen Norman adalah yang paling populer.</p><h2 className="text-lg font-bold text-ink mt-8 mb-3">10 Heuristics Nielsen</h2><ul className="space-y-2 ml-0 list-none">{[{ title: 'Visibility of System Status', desc: 'Sistem selalu memberi tahu pengguna apa yang sedang terjadi.' }, { title: 'Error Prevention', desc: 'Desain yang mencegah kesalahan lebih baik dari pesan error.' }, { title: 'Recognition over Recall', desc: 'Minimkan beban memori pengguna.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Analisis & Laporan Hasil': { heading: 'Analisis & Laporan Hasil', body: (<div className="space-y-5"><p>Setelah testing, analisis data yang dikumpulkan dan buat laporan yang actionable. Fokus pada temuan prioritas tinggi yang memiliki dampak terbesar pada pengalaman pengguna.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Kompilasi Temuan', desc: 'Kelompokkan masalah berdasarkan severity.' }, { title: 'Prioritaskan', desc: 'High impact + high frequency = perbaiki dulu.' }, { title: 'Rekomendasi', desc: 'Berikan solusi konkret untuk setiap masalah.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },

  /* Module 13 */
  'Persiapan Handoff': { heading: 'Persiapan Handoff', body: (<div className="space-y-5"><p>Design handoff adalah proses menyerahkan desain final ke developer. Persiapan yang baik mengurangi ambiguitas dan mempercepat development.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Naming Convention', desc: 'Beri nama layer dan komponen secara konsisten.' }, { title: 'Auto Layout', desc: 'Gunakan auto layout agar spacing konsisten.' }, { title: 'Component Organization', desc: 'Susun komponen di library dengan rapi.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Spesifikasi Desain': { heading: 'Spesifikasi Desain', body: (<div className="space-y-5"><p>Spesifikasi desain mendokumentasikan detail teknis dari setiap elemen: ukuran, warna, spacing, typography, dan behavior.</p><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Tips</strong><p className="text-sm text-teal-700/80 mt-1">Gunakan fitur Inspect di Figma untuk auto-generate spesifikasi CSS/Swift/Kotlin dari desain kamu.</p></div></div></div></div>) },
  'Tools Kolaborasi': { heading: 'Tools Kolaborasi', body: (<div className="space-y-5"><p>Tools kolaborasi memudahkan komunikasi antara designer dan developer. Pilih tools yang sesuai dengan workflow tim kamu.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Figma Dev Mode', desc: 'Inspect desain, copy CSS, dan lihat redlines.' }, { name: 'Zeplin', desc: 'Platform handoff dengan style guide otomatis.' }, { name: 'Storybook', desc: 'Dokumentasi komponen interaktif.' }, { name: 'Notion', desc: 'Dokumentasi desain dan spesifikasi.' }].map((t, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{t.name}</strong><p className="text-xs text-ink-4">{t.desc}</p></div>))}</div></div>) },
  'Best Practice Handoff': { heading: 'Best Practice Handoff', body: (<div className="space-y-5"><p>Handoff yang baik bukan hanya menyerahkan file — tapi membangun pemahaman bersama antara designer dan developer.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Walk-through Meeting', desc: 'Presentasikan desain dan jelaskan keputusan di baliknya.' }, { title: 'Edge Cases', desc: 'Dokumentasikan semua edge case: empty state, error, loading.' }, { title: 'Responsive Specs', desc: 'Jelaskan bagaimana layout berubah di breakpoint berbeda.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },

  /* Module 14 */
  'Struktur Portfolio': { heading: 'Struktur Portfolio', body: (<div className="space-y-5"><p>Portfolio UX yang baik memiliki struktur yang jelas: about me, case studies, dan contact. Setiap case study harus menunjukkan proses, bukan hanya hasil akhir.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Hero Section', desc: 'Headline kuat, foto/avatar, tagline singkat.' }, { title: 'Case Studies', desc: '3-5 proyek terbaik dengan detail proses.' }, { title: 'About & Skills', desc: 'Background, expertise, dan tools yang dikuasai.' }, { title: 'Contact', desc: 'Email, LinkedIn, dan link portfolio online.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'UX Case Study': { heading: 'UX Case Study', body: (<div className="space-y-5"><p>Case study adalah inti dari portfolio UX. Setiap case study harus menjawab: apa masalahnya, bagaimana kamu menyelesaikannya, dan apa hasilnya.</p><h2 className="text-lg font-bold text-ink mt-8 mb-3">Struktur Case Study</h2><ul className="space-y-2 ml-0 list-none">{[{ title: 'Overview', desc: 'Ringkasan proyek, peran, dan timeline.' }, { title: 'Problem', desc: 'Masalah yang ingin diselesaikan.' }, { title: 'Process', desc: 'Langkah-langkah yang diambil (riset, ideation, design).' }, { title: 'Solution', desc: 'Desain akhir dan keputusan di baliknya.' }, { title: 'Impact', desc: 'Metrik dan hasil yang dicapai.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Visual Storytelling': { heading: 'Visual Storytelling', body: (<div className="space-y-5"><p>Visual storytelling membantu reviewer memahami proses desain kamu secara engaging. Gunakan screenshot, mockup, diagram, dan before/after comparison.</p><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Tips</strong><p className="text-sm text-teal-700/80 mt-1">Gunakan narasi yang membawa pembaca dari masalah ke solusi. Tambahkan context, bukan hanya visual.</p></div></div></div></div>) },
  'Platform & Tools': { heading: 'Platform & Tools', body: (<div className="space-y-5"><p>Pilih platform yang sesuai untuk menampilkan portfolio kamu.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Behance', desc: 'Platform Adobe, komunitas besar, mudah digunakan.' }, { name: 'Dribbble', desc: 'Fokus visual, baik untuk showcase UI.' }, { name: 'Website Pribadi', desc: 'Kontrol penuh, lebih profesional.' }, { name: 'Notion', desc: 'Cepat dibuat, mudah di-update.' }].map((p, i) => (<div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{p.name}</strong><p className="text-xs text-ink-4">{p.desc}</p></div>))}</div></div>) },
  'Review & Feedback': { heading: 'Review & Feedback', body: (<div className="space-y-5"><p>Minta feedback dari peers, mentor, atau komunitas desain sebelum mempublikasikan portfolio. Feedback membantu menemukan blindspot yang kamu lewatkan.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Peer Review', desc: 'Minta teman sesama desainer untuk review.' }, { title: 'Mentor Feedback', desc: 'Insight dari profesional berpengalaman.' }, { title: 'Iterasi', desc: 'Portfolio adalah produk — terus perbaiki berdasarkan feedback.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Contoh Portfolio Inspiratif': { heading: 'Contoh Portfolio Inspiratif', body: (<div className="space-y-5"><p>Pelajari portfolio-portfolio yang dianggap excellent oleh industri desain.</p><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{[{ name: 'Case Study Club', desc: 'Koleksi case study terbaik dari seluruh dunia.' }, { name: 'Bestfolios', desc: 'Kurasi portfolio desainer top global.' }].map((p, i) => (<div key={i} className="p-4 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{p.name}</strong><p className="text-xs text-ink-4 mt-1">{p.desc}</p></div>))}</div></div>) },

  /* Module 15 */
  'Pemilihan Topik & Brief': { heading: 'Pemilihan Topik & Brief', body: (<div className="space-y-5"><p>Capstone project dimulai dengan memilih topik yang menantang namun achievable. Pilih aplikasi nyata yang bisa kamu redesign atau masalah yang bisa kamu selesaikan.</p><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Tips Pemilihan Topik</strong><p className="text-sm text-teal-700/80 mt-1">Pilih produk yang sering kamu gunakan — kamu sudah memahami pain points-nya.</p></div></div></div></div>) },
  'Riset & Discovery': { heading: 'Riset & Discovery', body: (<div className="space-y-5"><p>Fase discovery menggabungkan semua skill riset yang sudah kamu pelajari: user interview, competitive analysis, dan data gathering.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Competitive Analysis', desc: 'Analisis 3-5 kompetitor produk target.' }, { title: 'User Interview', desc: 'Wawancara minimal 5 pengguna.' }, { title: 'Data Synthesis', desc: 'Kompilasi insights menjadi findings.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Ideation & Sketsa': { heading: 'Ideation & Sketsa', body: (<div className="space-y-5"><p>Gunakan teknik ideation untuk menghasilkan solusi kreatif. Crazy 8s, mind mapping, dan how-might-we questions akan membantu eksplorasi.</p></div>) },
  'Wireframe & IA': { heading: 'Wireframe & IA', body: (<div className="space-y-5"><p>Buat information architecture dan wireframe yang solid berdasarkan hasil ideation. Ini menjadi blueprint untuk desain visual selanjutnya.</p></div>) },
  'Visual Design & UI': { heading: 'Visual Design & UI', body: (<div className="space-y-5"><p>Terapkan visual design: color palette, typography, spacing, dan komponen UI. Pastikan konsisten dengan design system yang kamu buat.</p></div>) },
  'Prototipe Hi-Fi': { heading: 'Prototipe Hi-Fi', body: (<div className="space-y-5"><p>Buat prototipe high-fidelity yang interaktif di Figma. Hubungkan semua screen dengan flow yang realistis dan tambahkan micro-interactions.</p></div>) },
  'Usability Testing': { heading: 'Usability Testing', body: (<div className="space-y-5"><p>Uji prototipe hi-fi kamu dengan minimal 5 pengguna. Gunakan think-aloud protocol dan catat semua temuan.</p></div>) },
  'Dokumentasi Final': { heading: 'Dokumentasi Final', body: (<div className="space-y-5"><p>Susun dokumentasi lengkap capstone project: problem statement, process, solution, dan impact. Ini menjadi case study utama di portfolio kamu.</p></div>) },

  /* Module 16 */
  'Panduan Presentasi': { heading: 'Panduan Presentasi', body: (<div className="space-y-5"><p>UAS berupa presentasi capstone project. Siapkan presentasi yang menunjukkan proses, keputusan desain, dan hasil akhir kamu.</p><ul className="space-y-2 ml-0 list-none">{[{ title: 'Durasi', desc: '15-20 menit presentasi + 10 menit Q&A.' }, { title: 'Format', desc: 'Slide deck + live demo prototipe.' }, { title: 'Fokus', desc: 'Proses, bukan hanya hasil visual.' }].map((item, i) => (<li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl"><div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div><div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div></li>))}</ul></div>) },
  'Review & Evaluasi': { heading: 'Review & Evaluasi', body: (<div className="space-y-5"><p>Setelah presentasi, dosen dan peers akan memberikan evaluasi dan feedback. Ini kesempatan terakhir untuk memperbaiki capstone sebelum finalisasi.</p></div>) },
  'Refleksi & Penutup': { heading: 'Refleksi & Penutup', body: (<div className="space-y-5"><p>Refleksikan perjalanan belajar kamu selama satu semester. Apa yang sudah dipelajari, apa yang masih ingin dikembangkan, dan langkah selanjutnya di karir UX design.</p><div className="p-4 bg-teal-50 border border-teal-200 rounded-xl"><div className="flex items-start gap-2"><Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" /><div><strong className="text-teal-700 text-sm">Selamat!</strong><p className="text-sm text-teal-700/80 mt-1">Kamu telah menyelesaikan seluruh materi UI/UX Design. Terus belajar dan praktik — perjalanan desainer tidak pernah benar-benar selesai.</p></div></div></div></div>) },
}
