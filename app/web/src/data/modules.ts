export const modulesData = [
  { id: 1, num: '01', title: 'Pengantar UX Design', category: 'fondasi', tags: ['Fondasi'], emoji: '📘', duration: '45 menit', subs: 4, weight: 5, status: 'done' as const, progress: 100, desc: 'Memahami apa itu UX Design, perannya dalam pengembangan produk digital, dan perbedaan antara UX dan UI.' },
  { id: 2, num: '02', title: 'Analisis Pengguna & Persona', category: 'fondasi', tags: ['Fondasi'], emoji: '👥', duration: '50 menit', subs: 5, weight: 5, status: 'done' as const, progress: 100, desc: 'Teknik riset pengguna, pembuatan user persona, empathy mapping, dan user journey.' },
  { id: 3, num: '03', title: 'Information Architecture', category: 'fondasi', tags: ['Fondasi'], emoji: '🏗️', duration: '55 menit', subs: 5, weight: 5, status: 'done' as const, progress: 100, desc: 'Organisasi konten, card sorting, sitemap, dan navigasi yang efektif.' },
  { id: 4, num: '04', title: 'Wireframing & Sketsa', category: 'inti', tags: ['Inti'], emoji: '✏️', duration: '60 menit', subs: 5, weight: 5, status: 'done' as const, progress: 100, desc: 'Low-fidelity wireframing, rapid sketching, dan prinsip layout dasar.' },
  { id: 5, num: '05', title: 'Grid Systems & Layout', category: 'inti', tags: ['Inti'], emoji: '📐', duration: '50 menit', subs: 4, weight: 5, status: 'done' as const, progress: 100, desc: 'Sistem grid responsif, alignment, spacing, dan komposisi visual.' },
  { id: 6, num: '06', title: 'Color Theory & Palette', category: 'inti', tags: ['Inti'], emoji: '🎨', duration: '55 menit', subs: 5, weight: 5, status: 'done' as const, progress: 100, desc: 'Teori warna, psikologi warna, kontras WCAG, dan pembuatan palet warna.' },
  { id: 7, num: '07', title: 'Typography & Readability', category: 'inti', tags: ['Inti'], emoji: '🔤', duration: '45 menit', subs: 4, weight: 5, status: 'done' as const, progress: 100, desc: 'Pemilihan typeface, hierarki tipografi, readability, dan pairing font.' },
  { id: 8, num: '08', title: 'UTS — Interactive Prototyping', category: 'eval', tags: ['Evaluasi', 'UTS'], emoji: '📝', duration: '120 menit', subs: 3, weight: 15, status: 'done' as const, progress: 100, desc: 'Ujian tengah semester: membuat prototipe interaktif dari brief yang diberikan.' },
  { id: 9, num: '09', title: 'Design System & UI Tokens', category: 'inti', tags: ['Inti'], emoji: '⚙️', duration: '60 menit', subs: 6, weight: 5, status: 'progress' as const, progress: 60, desc: 'Membangun design system: komponen, token, variabel, dan dokumentasi.' },
  { id: 10, num: '10', title: 'Interaction Design', category: 'inti', tags: ['Inti'], emoji: '🖱️', duration: '50 menit', subs: 5, weight: 5, status: 'locked' as const, progress: 0, desc: 'Prinsip interaksi, micro-interaction, gesture design, dan feedback visual.' },
  { id: 11, num: '11', title: 'Responsive & Adaptive', category: 'inti', tags: ['Inti'], emoji: '📱', duration: '55 menit', subs: 5, weight: 5, status: 'locked' as const, progress: 0, desc: 'Desain responsif, breakpoint, mobile-first, dan adaptive layout.' },
  { id: 12, num: '12', title: 'Usability Testing', category: 'lanjutan', tags: ['Lanjutan'], emoji: '🧪', duration: '60 menit', subs: 5, weight: 5, status: 'locked' as const, progress: 0, desc: 'Metode usability testing, task analysis, think-aloud, dan heuristic evaluation.' },
  { id: 13, num: '13', title: 'Design Handoff', category: 'lanjutan', tags: ['Lanjutan'], emoji: '🤝', duration: '45 menit', subs: 4, weight: 5, status: 'locked' as const, progress: 0, desc: 'Persiapan handoff ke developer, spesifikasi desain, dan tools kolaborasi.' },
  { id: 14, num: '14', title: 'Portfolio UX', category: 'proyek', tags: ['Proyek'], emoji: '💼', duration: '90 menit', subs: 6, weight: 10, status: 'locked' as const, progress: 0, desc: 'Membuat portfolio UX case study: struktur, storytelling, dan presentasi.' },
  { id: 15, num: '15', title: 'Capstone Project', category: 'proyek', tags: ['Proyek'], emoji: '🚀', duration: '180 menit', subs: 8, weight: 10, status: 'locked' as const, progress: 0, desc: 'Proyek akhir: redesign aplikasi nyata dari riset hingga prototipe hi-fi.' },
  { id: 16, num: '16', title: 'UAS — Design Review', category: 'eval', tags: ['Evaluasi', 'UAS'], emoji: '🏆', duration: '120 menit', subs: 3, weight: 15, status: 'locked' as const, progress: 0, desc: 'Ujian akhir semester: presentasi dan review proyek capstone.' },
]

export const categories = [
  { id: 'semua', label: 'Semua' },
  { id: 'fondasi', label: 'Fondasi' },
  { id: 'inti', label: 'Inti' },
  { id: 'lanjutan', label: 'Lanjutan' },
  { id: 'proyek', label: 'Proyek' },
  { id: 'eval', label: 'Evaluasi' },
]
