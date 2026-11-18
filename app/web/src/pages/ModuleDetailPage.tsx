import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, BookOpen, Clock, Award, ChevronDown, Save } from 'lucide-react'

const subBabs = [
  { id: 1, title: 'Apa itu Design System?', done: true },
  { id: 2, title: 'Komponen UI Dasar', done: true },
  { id: 3, title: 'Token & Variabel Desain', done: true },
  { id: 4, title: 'Membangun Component Library', done: false, active: true },
  { id: 5, title: 'Dokumentasi & Handoff', done: false },
  { id: 6, title: 'Studi Kasus: Design System Nyata', done: false },
]

export default function ModuleDetailPage() {
  const { slug } = useParams()
  const [activeSub, setActiveSub] = useState(4)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const title = slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Design System'

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-ink-5 flex-wrap">
        <Link to="/app" className="hover:text-teal-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/app/modul" className="hover:text-teal-600 transition-colors">Katalog Modul</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-ink font-medium truncate">{title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className={`lg:w-72 flex-shrink-0 ${sidebarOpen ? '' : 'lg:w-auto'}`}>
          {/* Module header */}
          <div className="p-5 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl text-white mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 text-[0.5625rem] font-bold bg-white/20 rounded-full">Sesi 09</span>
              <span className="px-2 py-0.5 text-[0.5625rem] font-bold bg-white/20 rounded-full">Inti</span>
            </div>
            <h2 className="text-lg font-bold mb-2 leading-snug">{title}</h2>
            <div className="flex items-center gap-4 text-xs text-teal-100">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 60 menit</span>
              <span className="flex items-center gap-1"><Award className="w-3 h-3" /> Bobot 5%</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span className="font-bold">60%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
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
                  {subBabs.map((sub) => (
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
          <div className="bg-white border border-ink-7 rounded-2xl p-6 md:p-8 mb-4">
            <h1 className="text-2xl font-extrabold text-ink tracking-tight mb-6">Membangun Component Library</h1>

            <div className="prose max-w-none text-ink-3 text-[0.9375rem] leading-relaxed space-y-5">
              <p>
                Component library adalah kumpulan komponen UI yang dapat digunakan kembali (reusable) di seluruh produk.
                Sebuah component library yang baik akan mempercepat proses desain dan development, menjaga konsistensi visual,
                dan memudahkan kolaborasi antara desainer dan developer.
              </p>

              <h2 className="text-lg font-bold text-ink mt-8 mb-3">Prinsip Utama</h2>

              <ul className="space-y-2 ml-0 list-none">
                {[
                  { title: 'Atomic Design', desc: 'Memecah UI menjadi atom, molekul, organisme, template, dan halaman.' },
                  { title: 'Konsistensi', desc: 'Setiap komponen harus berperilaku dan terlihat sama di mana pun digunakan.' },
                  { title: 'Aksesibilitas', desc: 'Semua komponen harus memenuhi standar WCAG 2.1 AA minimal.' },
                  { title: 'Dokumentasi', desc: 'Setiap komponen wajib memiliki dokumentasi penggunaan, props, dan contoh.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 p-3 bg-ink-9 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <strong className="text-ink">{item.title}</strong>
                      <span className="text-ink-4"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mt-6">
                <div className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  <div>
                    <strong className="text-teal-700 text-sm">Tips Praktis</strong>
                    <p className="text-sm text-teal-700/80 mt-1">
                      Mulai dari komponen yang paling sering digunakan: Button, Input, Card, Modal.
                      Pastikan setiap komponen memiliki minimal 3 varian: default, hover, dan disabled.
                    </p>
                  </div>
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
│   │   ├── Button.figma
│   │   ├── Button.docs.md
│   │   └── variants.png
│   ├── Input/
│   └── Card/
└── documentation/
    └── getting-started.md`}</pre>
              </div>
            </div>

            {/* Mark complete */}
            <div className="mt-8 pt-6 border-t border-ink-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Sudah memahami materi ini?</h3>
                <p className="text-xs text-ink-5">Tandai sebagai selesai untuk melanjutkan ke sub-bab berikutnya.</p>
              </div>
              <button className="px-6 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors flex items-center gap-2">
                <Check className="w-4 h-4" /> Tandai Selesai
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-ink-7 rounded-2xl p-6">
            <h3 className="text-base font-bold text-ink mb-3">Catatan Pribadi</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis catatan kamu tentang materi ini..."
              rows={4}
              className="w-full p-3 bg-ink-9 border border-ink-7 rounded-xl text-sm text-ink placeholder:text-ink-5 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none resize-none transition-all"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
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
