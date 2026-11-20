import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, BookOpen, Clock, Award, ChevronDown, Save } from 'lucide-react'
import { modulesData } from '../data/modules'
import { useToast } from '../components/ui/Toast'

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/* Sub-bab content per module (keyed by sub-bab title) */
const subBabContent: Record<string, { heading: string; body: React.ReactNode }> = {
  'Apa itu Design System?': {
    heading: 'Apa itu Design System?',
    body: (
      <div className="space-y-5">
        <p>Design system adalah kumpulan standar, prinsip, dan komponen yang terorganisir untuk memandu pembuatan produk digital secara konsisten. Ia bukan hanya tentang komponen UI — melainkan tentang proses, dokumentasi, dan pedoman desain.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Mengapa Penting?</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Konsistensi', desc: 'Semua halaman dan fitur terasa satu kesatuan.' },
            { title: 'Efisiensi', desc: 'Tim tidak perlu mendesain ulang komponen yang sama.' },
            { title: 'Kolaborasi', desc: 'Designer dan developer berbicara dalam bahasa yang sama.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">{i + 1}</span>
              </div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  'Komponen UI Dasar': {
    heading: 'Komponen UI Dasar',
    body: (
      <div className="space-y-5">
        <p>Komponen UI dasar adalah fondasi dari setiap design system. Komponen-komponen ini digunakan berulang kali di seluruh produk dan harus dirancang dengan fleksibilitas tinggi.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Komponen Fundamental</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['Button', 'Input Field', 'Card', 'Modal', 'Badge', 'Tooltip'].map((c, i) => (
            <div key={i} className="p-3 bg-ink-9 rounded-xl"><strong className="text-ink text-sm">{c}</strong></div>
          ))}
        </div>
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mt-6">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div><strong className="text-teal-700 text-sm">Tips</strong><p className="text-sm text-teal-700/80 mt-1">Mulai dari komponen yang paling sering digunakan di produk kamu.</p></div>
          </div>
        </div>
      </div>
    ),
  },
  'Token & Variabel Desain': {
    heading: 'Token & Variabel Desain',
    body: (
      <div className="space-y-5">
        <p>Design tokens adalah value dasar dari design system: warna, spacing, font size, border radius, dan lainnya. Tokens membuat design system menjadi scalable dan mudah diubah secara global.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Jenis Token</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Color Tokens', desc: 'Primary, secondary, semantic (error, success, warning).' },
            { title: 'Spacing Tokens', desc: 'Scale spacing: 4px, 8px, 12px, 16px, 24px, 32px, 48px.' },
            { title: 'Typography Tokens', desc: 'Font family, size, weight, line-height, letter-spacing.' },
            { title: 'Shadow Tokens', desc: 'Elevation levels: sm, md, lg, xl.' },
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
  'Membangun Component Library': {
    heading: 'Membangun Component Library',
    body: (
      <div className="space-y-5">
        <p>Component library adalah kumpulan komponen UI yang dapat digunakan kembali (reusable) di seluruh produk. Sebuah component library yang baik akan mempercepat proses desain dan development.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Prinsip Utama</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Atomic Design', desc: 'Memecah UI menjadi atom, molekul, organisme, template, dan halaman.' },
            { title: 'Konsistensi', desc: 'Setiap komponen harus berperilaku dan terlihat sama di mana pun digunakan.' },
            { title: 'Aksesibilitas', desc: 'Semua komponen harus memenuhi standar WCAG 2.1 AA minimal.' },
            { title: 'Dokumentasi', desc: 'Setiap komponen wajib memiliki dokumentasi penggunaan, props, dan contoh.' },
          ].map((item, i) => (
            <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-xs font-bold">{i + 1}</span></div>
              <div><strong className="text-ink">{item.title}</strong><span className="text-ink-4"> — {item.desc}</span></div>
            </li>
          ))}
        </ul>
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mt-6">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div><strong className="text-teal-700 text-sm">Tips Praktis</strong><p className="text-sm text-teal-700/80 mt-1">Mulai dari komponen yang paling sering digunakan: Button, Input, Card, Modal. Pastikan setiap komponen memiliki minimal 3 varian.</p></div>
          </div>
        </div>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Contoh Struktur</h2>
        <div className="p-4 bg-ink rounded-xl text-sm font-mono text-teal-300 overflow-x-auto">
          <pre className="whitespace-pre">{`design-system/
├── tokens/
│   ├── colors.json
│   ├── typography.json
│   └── spacing.json
├── components/
│   ├── Button/
│   ├── Input/
│   └── Card/
└── documentation/
    └── getting-started.md`}</pre>
        </div>
      </div>
    ),
  },
  'Dokumentasi & Handoff': {
    heading: 'Dokumentasi & Handoff',
    body: (
      <div className="space-y-5">
        <p>Dokumentasi yang baik adalah kunci keberhasilan design system. Tanpa dokumentasi, design system hanya menjadi kumpulan file yang tidak terpakai.</p>
        <h2 className="text-lg font-bold text-ink mt-8 mb-3">Elemen Dokumentasi</h2>
        <ul className="space-y-2 ml-0 list-none">
          {[
            { title: 'Usage Guidelines', desc: 'Kapan dan bagaimana menggunakan komponen.' },
            { title: 'Code Examples', desc: 'Contoh implementasi dalam kode.' },
            { title: 'Do\'s and Don\'ts', desc: 'Praktik terbaik dan kesalahan umum.' },
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
  'Studi Kasus: Design System Nyata': {
    heading: 'Studi Kasus: Design System Nyata',
    body: (
      <div className="space-y-5">
        <p>Mari kita pelajari beberapa design system dunia nyata yang dapat menjadi inspirasi.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: 'Material Design', by: 'Google', desc: 'Design system komprehensif dengan panduan lengkap untuk Android, Web, dan Flutter.' },
            { name: 'Carbon', by: 'IBM', desc: 'Design system open-source dengan fokus pada aksesibilitas dan enterprise.' },
            { name: 'Polaris', by: 'Shopify', desc: 'Design system untuk membangun pengalaman merchant yang konsisten.' },
            { name: 'Atlassian Design', by: 'Atlassian', desc: 'Design system untuk produk-produk kolaborasi tim.' },
          ].map((ds, i) => (
            <div key={i} className="p-4 bg-ink-9 rounded-xl">
              <strong className="text-ink text-sm">{ds.name}</strong>
              <span className="text-xs text-ink-5 ml-1">by {ds.by}</span>
              <p className="text-xs text-ink-4 mt-1">{ds.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
}

const defaultSubBabs = [
  { id: 1, title: 'Apa itu Design System?', done: true },
  { id: 2, title: 'Komponen UI Dasar', done: true },
  { id: 3, title: 'Token & Variabel Desain', done: true },
  { id: 4, title: 'Membangun Component Library', done: false },
  { id: 5, title: 'Dokumentasi & Handoff', done: false },
  { id: 6, title: 'Studi Kasus: Design System Nyata', done: false },
]

export default function ModuleDetailPage() {
  const { slug } = useParams()
  const { success } = useToast()

  // Find module from data
  const moduleData = useMemo(() => {
    return modulesData.find((m) => slugify(m.title) === slug)
  }, [slug])

  const title = moduleData?.title || slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Design System'
  const sessionNum = moduleData?.num || '09'
  const category = moduleData?.tags[0] || 'Inti'
  const duration = moduleData?.duration || '60 menit'
  const weight = moduleData?.weight || 5

  // Sub-bab state with done toggling
  const [subBabs, setSubBabs] = useState(() => {
    const saved = localStorage.getItem(`nodes-subbabs-${slug}`)
    if (saved) {
      try { return JSON.parse(saved) } catch { /* ignore */ }
    }
    return defaultSubBabs
  })

  const [activeSub, setActiveSub] = useState(() => {
    // Start at first incomplete sub-bab
    const firstIncomplete = subBabs.find((s: typeof defaultSubBabs[0]) => !s.done)
    return firstIncomplete?.id ?? 1
  })

  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Notes per sub-bab, persisted to localStorage
  const notesKey = `nodes-notes-${slug}-${activeSub}`
  const [notes, setNotes] = useState(() => localStorage.getItem(notesKey) || '')
  const [saved, setSaved] = useState(false)

  // Update notes when switching sub-bab
  useEffect(() => {
    setNotes(localStorage.getItem(notesKey) || '')
    setSaved(false)
  }, [notesKey])

  // Calculate progress
  const doneCount = subBabs.filter((s: typeof defaultSubBabs[0]) => s.done).length
  const progress = Math.round((doneCount / subBabs.length) * 100)

  // Persist sub-bab state
  useEffect(() => {
    localStorage.setItem(`nodes-subbabs-${slug}`, JSON.stringify(subBabs))
  }, [subBabs, slug])

  const handleSave = () => {
    localStorage.setItem(notesKey, notes)
    setSaved(true)
    success('Catatan Tersimpan', 'Catatan kamu berhasil disimpan.')
    setTimeout(() => setSaved(false), 2000)
  }

  const handleMarkDone = () => {
    setSubBabs((prev: typeof defaultSubBabs) =>
      prev.map((s) => s.id === activeSub ? { ...s, done: !s.done } : s)
    )
    const currentSub = subBabs.find((s: typeof defaultSubBabs[0]) => s.id === activeSub)
    if (currentSub && !currentSub.done) {
      success('Sub-bab Selesai! ✅', `"${currentSub.title}" ditandai sebagai selesai.`)
      // Auto advance to next incomplete sub-bab
      const nextSub = subBabs.find((s: typeof defaultSubBabs[0]) => s.id > activeSub && !s.done)
      if (nextSub) {
        setTimeout(() => setActiveSub(nextSub.id), 500)
      }
    }
  }

  const activeSubData = subBabs.find((s: typeof defaultSubBabs[0]) => s.id === activeSub)
  const activeContent = activeSubData ? subBabContent[activeSubData.title] : null

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-ink-5 flex-wrap" aria-label="Breadcrumb">
        <Link to="/app" className="hover:text-teal-600 transition-colors cursor-pointer">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <Link to="/app/modul" className="hover:text-teal-600 transition-colors cursor-pointer">Katalog Modul</Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-ink font-medium truncate">{title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className={`lg:w-72 flex-shrink-0 ${sidebarOpen ? '' : 'lg:w-auto'}`}>
          {/* Module header */}
          <div className="p-5 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl text-white mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-[0.5625rem] font-bold bg-white/20 rounded-full">Sesi {sessionNum}</span>
              <span className="px-2 py-0.5 text-[0.5625rem] font-bold bg-white/20 rounded-full">{category}</span>
            </div>
            <h2 className="text-lg font-bold mb-2 leading-snug">{title}</h2>
            <div className="flex items-center gap-4 text-xs text-teal-100">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {duration}</span>
              <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Bobot {weight}%</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          {/* Toggle sidebar on mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center justify-between w-full p-3 bg-ink-9 border border-ink-7 rounded-xl mb-4 text-sm font-medium text-ink"
          >
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Sub-bab ({subBabs.length})</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Sub-bab list */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-1">
                  {subBabs.map((sub: typeof defaultSubBabs[0]) => (
                    <button
                      key={sub.id}
                      onClick={() => setActiveSub(sub.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all ${
                        activeSub === sub.id
                          ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                          : sub.done
                          ? 'text-ink-4 hover:bg-ink-9'
                          : 'text-ink-3 hover:bg-ink-9'
                      }`}
                    >
                      {sub.done ? (
                        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${activeSub === sub.id ? 'border-teal-600 bg-teal-600' : 'border-ink-6'}`}>
                          {activeSub === sub.id && <div className="w-full h-full rounded-full bg-teal-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                        </div>
                      )}
                      <span className="truncate">{sub.title}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSub}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white border border-ink-7 rounded-2xl p-6 md:p-8 mb-4">
                <h1 className="text-2xl font-extrabold text-ink tracking-tight mb-6">
                  {activeContent?.heading || activeSubData?.title || 'Materi'}
                </h1>

                <div className="prose max-w-none text-ink-3 text-[0.9375rem] leading-relaxed">
                  {activeContent?.body || (
                    <p className="text-ink-4">Konten untuk sub-bab ini sedang disiapkan. Silakan cek kembali nanti.</p>
                  )}
                </div>

                {/* Mark complete */}
                <div className="mt-8 pt-6 border-t border-ink-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Sudah memahami materi ini?</h3>
                    <p className="text-xs text-ink-5">Tandai sebagai selesai untuk melanjutkan ke sub-bab berikutnya.</p>
                  </div>
                  <button
                    onClick={handleMarkDone}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer ${
                      activeSubData?.done
                        ? 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    {activeSubData?.done ? 'Sudah Selesai ✓' : 'Tandai Selesai'}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Notes */}
          <div className="bg-white border border-ink-7 rounded-2xl p-6">
            <h3 className="text-base font-bold text-ink mb-3">Catatan Pribadi</h3>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setSaved(false) }}
              placeholder="Tulis catatan kamu tentang materi ini..."
              rows={4}
              className="w-full p-3 bg-ink-9 border border-ink-7 rounded-xl text-sm text-ink placeholder:text-ink-5 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none resize-none transition-all"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  saved ? 'bg-teal-100 text-teal-700' : 'bg-ink text-white hover:bg-teal-600'
                }`}
              >
                {saved ? <><Check className="w-4 h-4" /> Tersimpan</> : <><Save className="w-4 h-4" /> Simpan</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
