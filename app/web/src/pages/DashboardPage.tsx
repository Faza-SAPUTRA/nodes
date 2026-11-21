import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, BookOpen, Check, Lock, Inbox } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/ui/Toast'
import { modulesData } from '../data/modules'
import { loadProgress, saveProgress, updateStreak, getModuleStatus, getModuleProgress, getTotalProgress } from '../store/progressStore'

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('Selamat pagi')
  const { warning } = useToast()
  const displayName = useAuthStore((s) => s.displayName)

  // Load progress from localStorage
  const [progress] = useState(() => {
    const p = loadProgress()
    const updated = updateStreak(p)
    if (updated !== p) saveProgress(updated)
    return updated
  })

  const totalStats = getTotalProgress(progress, modulesData.length)
  const streakPctTarget = (progress.streak.current / 7) * 100

  // Find the "continue learning" module (first in-progress or first available)
  const continueModule = modulesData.find(m => {
    const status = getModuleStatus(progress, m.id, modulesData.length)
    return status === 'progress'
  }) || modulesData.find(m => {
    const status = getModuleStatus(progress, m.id, modulesData.length)
    return status === 'available'
  })

  const continueProgress = continueModule ? getModuleProgress(progress, continueModule.id) : 0

  // Recent modules (first 4 that are not locked)
  const recentModules = modulesData.slice(0, 4).map(m => ({
    ...m,
    status: getModuleStatus(progress, m.id, modulesData.length),
    progress: getModuleProgress(progress, m.id),
  }))

  // Animated counters
  const [streakPct, setStreakPct] = useState(0)
  const [progPct, setProgPct] = useState(0)
  const [ccPct, setCcPct] = useState(0)

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 18 ? 'Selamat sore' : 'Selamat malam')
    setTimeout(() => {
      setStreakPct(streakPctTarget)
      setProgPct(totalStats.pct)
      setCcPct(continueProgress)
    }, 400)
  }, [])

  // Module slug mapping
  const moduleSlugMap: Record<number, string> = {
    1: 'pengantar-ux-design',
    2: 'analisis-pengguna-persona',
    3: 'information-architecture',
    4: 'wireframing-sketsa',
    5: 'grid-systems-layout',
    6: 'color-theory-palette',
    7: 'typography-readability',
    8: 'uts-interactive-prototyping',
    9: 'design-system-ui-tokens',
    10: 'interaction-design',
    11: 'responsive-adaptive',
    12: 'usability-testing',
    13: 'design-handoff',
    14: 'portfolio-ux',
    15: 'capstone-project',
    16: 'uas-design-review',
  }

  const days = ['S', 'S', 'R', 'K', 'J', 'S', 'M']

  function handleModuleClick(e: React.MouseEvent, status: string) {
    if (status === 'locked') {
      e.preventDefault()
      warning('Modul Terkunci', 'Selesaikan modul sebelumnya untuk membuka modul ini.')
    }
  }

  return (
    <div className="space-y-6" data-tour="welcome">
      {/* Welcome + Streak */}
      <Reveal>
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-2">
          <div>
            <span className="text-sm text-ink-5">{greeting}</span>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight mt-1">{displayName().split(' ')[0]}</h1>
            <p className="text-sm text-ink-4 mt-1">
              {totalStats.notStarted === modulesData.length
                ? 'Mulai perjalanan belajarmu hari ini.'
                : <>Kamu punya <strong className="text-ink">{totalStats.notStarted} sesi</strong> yang belum selesai. Lanjutkan belajar.</>
              }
            </p>
          </div>
          <div className="flex items-center gap-4" data-tour="streak">
            <div className="relative w-[100px] h-[100px]">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(13,148,136,.1)" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="url(#streakG)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${streakPct * 3.267} ${326.7 - streakPct * 3.267}`}
                  transform="rotate(-90 60 60)" className="transition-all duration-1000 ease-out" />
                <defs><linearGradient id="streakG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#14B8A6" /><stop offset="100%" stopColor="#0D9488" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-ink">{progress.streak.current}</span>
                <span className="text-[0.5625rem] text-ink-5 font-medium">hari streak</span>
              </div>
            </div>
            <div className="flex gap-1">
              {days.map((d, i) => (
                <span key={i} className={`w-7 h-7 rounded-lg text-[0.625rem] font-bold flex items-center justify-center transition-all ${progress.streak.weekDays[i] ? 'bg-teal-600 text-white' : i === (new Date().getDay() + 6) % 7 ? 'bg-teal-100 text-teal-700 ring-2 ring-teal-600' : 'bg-ink-8 text-ink-5'}`}>
                  {d}
                </span>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Continue card — only show if there's a module to continue */}
      {continueModule && (
        <Reveal delay={0.1}>
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink-2 to-ink p-8 md:p-10" data-tour="continue-card">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 text-[0.625rem] font-bold bg-teal-600/20 text-teal-400 rounded-full uppercase tracking-wider">{continueProgress > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}</span>
                  <span className="text-xs text-ink-5">Sesi {continueModule.num} · {continueModule.tags[0]}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight mb-4">{continueModule.title}</h2>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 max-w-xs h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${ccPct}%` }} />
                  </div>
                  <span className="text-sm font-bold text-teal-400">{ccPct}%</span>
                </div>
                <Link to={`/app/modul/${moduleSlugMap[continueModule.id] || 'pengantar-ux-design'}`} className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-ink text-sm font-semibold rounded-xl hover:bg-teal-50 transition-colors cursor-pointer">
                  {continueProgress > 0 ? 'Lanjutkan' : 'Mulai Belajar'} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              {/* Color wheel */}
              <svg viewBox="0 0 200 200" className="w-32 h-32 md:w-40 md:h-40 animate-spin-slow opacity-80" aria-hidden="true">
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="16" />
                {[
                  { d: 'M100 20 A80 80 0 0 1 169.28 60', c: '#EF4444' },
                  { d: 'M169.28 60 A80 80 0 0 1 169.28 140', c: '#F59E0B' },
                  { d: 'M169.28 140 A80 80 0 0 1 100 180', c: '#10B981' },
                  { d: 'M100 180 A80 80 0 0 1 30.72 140', c: '#3B82F6' },
                  { d: 'M30.72 140 A80 80 0 0 1 30.72 60', c: '#8B5CF6' },
                  { d: 'M30.72 60 A80 80 0 0 1 100 20', c: '#EC4899' },
                ].map((p, i) => <path key={i} d={p.d} fill="none" stroke={p.c} strokeWidth="16" strokeLinecap="round" />)}
                <circle cx="100" cy="100" r="40" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.1)" strokeWidth="1" />
                <text x="100" y="96" textAnchor="middle" fill="rgba(255,255,255,.5)" fontFamily="Inter" fontSize="10" fontWeight="600">WCAG</text>
                <text x="100" y="112" textAnchor="middle" fill="white" fontFamily="Inter" fontSize="14" fontWeight="800">AA</text>
              </svg>
            </div>
          </section>
        </Reveal>
      )}

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progress */}
        <Reveal delay={0.15} className="p-6 bg-white border border-ink-7 rounded-2xl hover:shadow-lg hover:shadow-teal-600/5 transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-ink">Progress Belajar</h3>
            <span className="text-xs text-ink-5">Semester ini</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle cx="60" cy="60" r="48" fill="none" stroke="var(--color-ink-7)" strokeWidth="10" />
                <circle cx="60" cy="60" r="48" fill="none" stroke="url(#progG)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${progPct * 3.016} ${301.6 - progPct * 3.016}`}
                  transform="rotate(-90 60 60)" className="transition-all duration-1000 ease-out" />
                <defs><linearGradient id="progG" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#14B8A6" /><stop offset="100%" stopColor="#0D9488" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold text-ink">{totalStats.done}</span>
                <span className="text-[0.5625rem] text-ink-5">dari {modulesData.length} sesi</span>
              </div>
            </div>
            <div className="flex gap-6">
              {[{ val: totalStats.done, label: 'Selesai' }, { val: totalStats.inProgress, label: 'Berlangsung' }, { val: totalStats.notStarted, label: 'Belum mulai' }].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-xl font-extrabold text-ink">{s.val}</div>
                  <div className="text-[0.625rem] text-ink-5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Modul Terbaru */}
        <Reveal delay={0.2} className="p-6 bg-white border border-ink-7 rounded-2xl hover:shadow-lg hover:shadow-teal-600/5 transition-shadow" data-tour="modules-recent">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-ink">Modul Terbaru</h3>
            <Link to="/app/modul" className="text-xs font-medium text-teal-600 hover:underline cursor-pointer">Lihat Semua</Link>
          </div>
          <div className="space-y-1">
            {recentModules.map((m) => (
              <Link
                key={m.id}
                to={m.status === 'locked' ? '#' : `/app/modul/${moduleSlugMap[m.id] || 'pengantar-ux-design'}`}
                onClick={(e) => handleModuleClick(e, m.status)}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors group ${
                  m.status === 'locked' ? 'opacity-60 cursor-not-allowed' : 'hover:bg-ink-9'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.status === 'done' ? 'bg-teal-50 text-teal-600' : m.status === 'progress' ? 'bg-blue-50 text-blue-600' : m.status === 'available' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'}`}>
                  <BookOpen className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ink truncate group-hover:text-teal-600 transition-colors">{m.title}</div>
                  <div className="text-xs text-ink-5">Sesi {m.num} · {m.subs} sub-bab</div>
                </div>
                {m.status === 'done' && <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center"><Check className="w-3.5 h-3.5" strokeWidth={3} /></div>}
                {m.status === 'progress' && <span className="text-xs font-bold text-teal-600">{m.progress}%</span>}
                {m.status === 'locked' && <div className="w-6 h-6 rounded-full bg-ink-8 text-ink-5 flex items-center justify-center"><Lock className="w-3 h-3" /></div>}
              </Link>
            ))}
          </div>
        </Reveal>

        {/* Aktivitas */}
        <Reveal delay={0.25} className="p-6 bg-white border border-ink-7 rounded-2xl hover:shadow-lg hover:shadow-teal-600/5 transition-shadow">
          <h3 className="text-base font-bold text-ink mb-4">Aktivitas Terbaru</h3>
          {progress.activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Inbox className="w-8 h-8 text-ink-6 mb-2" />
              <p className="text-sm text-ink-5">Belum ada aktivitas.</p>
              <p className="text-xs text-ink-6 mt-1">Mulai belajar untuk melihat riwayat aktivitasmu di sini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.activities.slice(0, 5).map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${t.color} flex-shrink-0 mt-1.5`} />
                    {i < Math.min(progress.activities.length, 5) - 1 && <div className="w-px flex-1 bg-ink-7 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-ink leading-snug">{t.text}</p>
                    <span className="text-xs text-ink-5 mt-0.5 block">{t.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Reveal>

        {/* Quick Links */}
        <Reveal delay={0.3} className="p-6 bg-white border border-ink-7 rounded-2xl hover:shadow-lg hover:shadow-teal-600/5 transition-shadow">
          <h3 className="text-base font-bold text-ink mb-4">Akses Cepat</h3>
          <div className="space-y-2">
            <Link to="/app/modul" className="flex items-center gap-3 p-3 rounded-xl border border-ink-7 hover:border-teal-600 hover:bg-teal-50/50 transition-all group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <BookOpen className="w-[18px] h-[18px]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink group-hover:text-teal-600 transition-colors">Katalog Modul</div>
                <div className="text-xs text-ink-5">{modulesData.length} modul tersedia</div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-5 ml-auto group-hover:text-teal-600 transition-colors" />
            </Link>
            <Link to="/app/canvas" className="flex items-center gap-3 p-3 rounded-xl border border-ink-7 hover:border-teal-600 hover:bg-teal-50/50 transition-all group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-ink group-hover:text-teal-600 transition-colors">Canvas Praktik</div>
                <div className="text-xs text-ink-5">Buat desain dan prototipe</div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-5 ml-auto group-hover:text-teal-600 transition-colors" />
            </Link>
            <Link to="/app/kolaborasi" className="flex items-center gap-3 p-3 rounded-xl border border-ink-7 hover:border-teal-600 hover:bg-teal-50/50 transition-all group cursor-pointer">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v-2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-ink group-hover:text-teal-600 transition-colors">Kolaborasi</div>
                <div className="text-xs text-ink-5">Review bersama tim</div>
              </div>
              <ArrowRight className="w-4 h-4 text-ink-5 ml-auto group-hover:text-teal-600 transition-colors" />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  )
}
