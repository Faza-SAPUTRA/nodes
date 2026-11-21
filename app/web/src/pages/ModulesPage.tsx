import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { Search, Check, Lock, Clock, BookOpen, Users, Building2, Pencil, Ruler, Palette, Type, ClipboardList, Settings, MousePointer2, Smartphone, FlaskConical, Handshake, Briefcase, Rocket, Trophy } from 'lucide-react'
import { modulesData, categories } from '../data/modules'
import { loadProgress, getModuleStatus, getModuleProgress } from '../store/progressStore'

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

const tagColors: Record<string, string> = {
  Fondasi: 'bg-blue-50 text-blue-600 border-blue-200',
  Inti: 'bg-teal-50 text-teal-600 border-teal-200',
  Lanjutan: 'bg-purple-50 text-purple-600 border-purple-200',
  Proyek: 'bg-amber-50 text-amber-700 border-amber-200',
  Evaluasi: 'bg-red-50 text-red-600 border-red-200',
  UTS: 'bg-orange-50 text-orange-600 border-orange-200',
  UAS: 'bg-rose-50 text-rose-600 border-rose-200',
}

const moduleIcons: Record<string, typeof BookOpen> = {
  book: BookOpen, users: Users, building: Building2, pencil: Pencil,
  ruler: Ruler, palette: Palette, type: Type, clipboard: ClipboardList,
  settings: Settings, pointer: MousePointer2, smartphone: Smartphone,
  flask: FlaskConical, handshake: Handshake, briefcase: Briefcase,
  rocket: Rocket, trophy: Trophy,
}

export default function ModulesPage() {
  const [activeCategory, setActiveCategory] = useState('semua')
  const [search, setSearch] = useState('')

  const progress = loadProgress()

  const filtered = modulesData.filter((m) => {
    const matchCat = activeCategory === 'semua' || m.category === activeCategory
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal>
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-ink tracking-tight">Katalog Modul</h1>
          <p className="text-sm text-ink-4 mt-1">16 sesi perkuliahan UI/UX Design — dari fondasi hingga proyek akhir.</p>
        </div>
      </Reveal>

      {/* Search */}
      <Reveal delay={0.05}>
        <div className="relative max-w-md" data-tour="modules-search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari modul..."
            className="w-full pl-10 pr-4 py-2.5 bg-ink-9 border border-ink-7 rounded-xl text-sm text-ink placeholder:text-ink-5 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none transition-all"
          />
        </div>
      </Reveal>

      {/* Filter tabs */}
      <Reveal delay={0.1}>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" data-tour="modules-filter">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-ink-9 text-ink-4 hover:bg-ink-8 hover:text-ink-3'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" data-tour="modules-grid">
        {filtered.map((m, i) => {
          const slug = m.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          const status = getModuleStatus(progress, m.id, modulesData.length)
          const moduleProgress = getModuleProgress(progress, m.id)
          const isDone = status === 'done'
          const isProgress = status === 'progress'
          const isLocked = status === 'locked'
          const circumference = 2 * Math.PI * 20
          const offset = circumference - (moduleProgress / 100) * circumference

          return (
            <Reveal key={m.id} delay={i * 0.05}>
              <Link
                to={isLocked ? '#' : `/app/modul/${slug}`}
                className={`group block p-5 border rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-600/5 ${
                  isDone ? 'bg-teal-50/30 border-teal-200/60 hover:border-teal-300' :
                  isLocked ? 'bg-ink-9/50 border-ink-7 opacity-70 cursor-not-allowed' :
                  'bg-white border-ink-7 hover:border-teal-200'
                }`}
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[0.625rem] font-bold text-ink-5 tracking-widest">{m.num}</span>
                    {m.tags.map((tag) => (
                      <span key={tag} className={`px-2 py-0.5 text-[0.5625rem] font-bold rounded-full border ${tagColors[tag] || 'bg-ink-8 text-ink-5 border-ink-7'}`}>
                        {tag}
                      </span>
                    ))}
                    <span className="flex items-center gap-1 text-[0.6875rem] text-ink-5">
                      <Clock className="w-3 h-3" /> {m.duration}
                    </span>
                  </div>
                  {isDone && <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5" strokeWidth={2.5} /></div>}
                  {isLocked && <div className="w-6 h-6 rounded-full bg-ink-8 text-ink-5 flex items-center justify-center flex-shrink-0"><Lock className="w-3 h-3" /></div>}
                </div>

                {/* Body */}
                <h3 className="text-base font-bold text-ink mb-1.5 group-hover:text-teal-600 transition-colors leading-snug">{m.title}</h3>
                <p className="text-[0.8125rem] text-ink-4 leading-relaxed mb-4 line-clamp-2">{m.desc}</p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[0.6875rem] text-ink-5 mb-1">{m.subs} sub-bab · {isDone ? 'Selesai' : isProgress ? 'Berlangsung' : 'Belum dimulai'}</div>
                    <div className="w-32 h-1.5 bg-ink-7 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${isDone ? 'bg-teal-600' : isProgress ? 'bg-teal-500' : ''}`} style={{ width: `${moduleProgress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                      <svg viewBox="0 0 48 48" className="w-full h-full">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-ink-7)" strokeWidth="3" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke="var(--color-teal-600)" strokeWidth="3"
                          strokeDasharray={circumference} strokeDashoffset={offset}
                          strokeLinecap="round" transform="rotate(-90 24 24)" className="transition-all duration-700" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center">{(() => { const Icon = moduleIcons[m.emoji]; return Icon ? <Icon className="w-4 h-4 text-ink-4" /> : null })()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-7/50">
                  <span className="text-[0.625rem] text-ink-5">Bobot: {m.weight}%</span>
                  <span className={`px-3 py-1 text-[0.6875rem] font-semibold rounded-lg ${
                    isDone ? 'bg-teal-50 text-teal-600' :
                    isProgress ? 'bg-teal-600 text-white' :
                    isLocked ? 'bg-ink-8 text-ink-5' :
                    'bg-teal-50 text-teal-600'
                  }`}>
                    {isDone ? 'Review' : isProgress ? 'Lanjutkan' : isLocked ? 'Terkunci' : 'Mulai'}
                  </span>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-ink-5">Tidak ada modul yang ditemukan.</p>
        </div>
      )}
    </div>
  )
}
