import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Star, Calendar, Trophy,
  Share2,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/ui/Toast'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { resetAllTours } from '../components/ui/OnboardingTour'
import { supabase } from '../lib/supabase'
import { loadProgress, getTotalProgress, getModuleProgress, getModuleStatus } from '../store/progressStore'
import { modulesData } from '../data/modules'

/* ─── Types ─── */
type TabKey = 'progress' | 'badges' | 'projects' | 'settings'

interface ProgressItem {
  name: string
  pct: number
  color: string
}

interface Badge {
  emoji: string
  name: string
  desc: string
  earned: boolean
  date?: string
}

interface Project {
  title: string
  desc: string
  date: string
  layers: number
  gradient: string
  type: string
  typeColor?: string
}

interface TimelineEvent {
  color: string
  title: string
  desc: string
  time: string
}

/* ─── Heatmap helper ─── */
const heatColors = ['#E2E8F0', 'rgba(13,148,136,.2)', 'rgba(13,148,136,.4)', 'rgba(13,148,136,.7)', '#0D9488']
const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function generateHeatmap(activities: { time: string }[]): { level: number; tooltip: string; date: string }[] {
  // Build a map of activity counts per date from real data
  const countMap = new Map<string, number>()
  const today = new Date().toISOString().split('T')[0]
  // Each activity approximated to today since times are relative ("Baru saja", etc)
  if (activities.length > 0) {
    countMap.set(today, activities.length)
  }

  // Generate 12 weeks (84 days) going back from today
  const cells: { level: number; tooltip: string; date: string }[] = []
  const now = new Date()
  // Start from 83 days ago
  for (let i = 83; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const count = countMap.get(dateStr) || 0
    const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4
    const dayName = dayLabels[(d.getDay() + 6) % 7]
    cells.push({
      level,
      tooltip: `${dayName}, ${d.getDate()}/${d.getMonth() + 1}: ${count === 0 ? 'Tidak aktif' : count + ' aktivitas'}`,
      date: dateStr,
    })
  }
  return cells
}

/* ─── AnimatedCount ─── */
function AnimatedCount({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame: number
    const duration = 1500
    const start = performance.now()

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

/* ─── Component ─── */
export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('progress')
  const [heatmapCells] = useState(() => generateHeatmap(progress.activities))
  const { success } = useToast()
  const profile = useAuthStore((s) => s.profile)
  const displayName = useAuthStore((s) => s.displayName)
  const initials = useAuthStore((s) => s.initials)

  // Load dynamic progress data
  const progress = useMemo(() => loadProgress(), [])
  const totalStats = useMemo(() => getTotalProgress(progress, modulesData.length), [progress])

  // Dynamic stats
  const xp = totalStats.done * 100 + totalStats.inProgress * 30
  const streakDays = progress.streak.current
  const activeDays = progress.streak.weekDays.filter(Boolean).length
  
  // Dynamic progress items — first 6 modules with real progress
  const dynamicProgressItems: ProgressItem[] = useMemo(() => {
    return modulesData.slice(0, 6).map(m => {
      const pct = getModuleProgress(progress, m.id)
      return {
        name: m.title,
        pct,
        color: pct >= 100 ? '#22C55E' : pct > 0 ? '#F59E0B' : '#94A3B8',
      }
    })
  }, [progress])

  // Dynamic badges
  const dynamicBadges: Badge[] = useMemo(() => {
    const mod1Done = getModuleStatus(progress, 1, modulesData.length) === 'done'
    const mod5Done = getModuleStatus(progress, 5, modulesData.length) === 'done'
    const mod6Done = getModuleStatus(progress, 6, modulesData.length) === 'done'
    const hasNotes = (() => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('nodes-notes-') && localStorage.getItem(key)?.trim()) return true
      }
      return false
    })()

    return [
      { emoji: 'FS', name: 'First Steps', desc: 'Selesaikan modul pertama', earned: mod1Done, date: mod1Done ? 'Tercapai' : undefined },
      { emoji: 'S7', name: 'Streak 7', desc: 'Login 7 hari berturut-turut', earned: streakDays >= 7, date: streakDays >= 7 ? 'Tercapai' : undefined },
      { emoji: 'QL', name: 'Quick Learner', desc: 'Selesaikan 3 modul dalam 1 minggu', earned: totalStats.done >= 3, date: totalStats.done >= 3 ? 'Tercapai' : undefined },
      { emoji: 'CM', name: 'Color Master', desc: 'Selesaikan modul Teori Warna', earned: mod6Done, date: mod6Done ? 'Tercapai' : undefined },
      { emoji: 'GG', name: 'Grid Guru', desc: 'Kuasai layout & grid system', earned: mod5Done, date: mod5Done ? 'Tercapai' : undefined },
      { emoji: 'NT', name: 'Note Taker', desc: 'Tambahkan catatan di modul', earned: hasNotes, date: hasNotes ? 'Tercapai' : undefined },
      { emoji: 'FC', name: 'First Component', desc: 'Buat komponen pertama di canvas', earned: false },
      { emoji: 'CB', name: 'Collaborator', desc: 'Ikut 3 sesi kolaborasi', earned: false },
      { emoji: 'DC', name: 'Design Champion', desc: 'Selesaikan semua modul', earned: totalStats.done >= modulesData.length, date: totalStats.done >= modulesData.length ? 'Tercapai' : undefined },
      { emoji: 'S3', name: 'Streak 30', desc: 'Login 30 hari berturut-turut', earned: streakDays >= 30, date: streakDays >= 30 ? 'Tercapai' : undefined },
      { emoji: 'MT', name: 'Mentor', desc: 'Bantu 5 orang di kolaborasi', earned: false },
      { emoji: 'PF', name: 'Perfectionist', desc: 'Skor 100 di semua quiz', earned: false },
    ]
  }, [progress, totalStats, streakDays])

  const earnedBadgeCount = dynamicBadges.filter(b => b.earned).length

  // Dynamic projects from localStorage (canvas persistence)
  const dynamicProjects: Project[] = useMemo(() => {
    try {
      const saved = localStorage.getItem('nodes-canvas-projects')
      if (saved) {
        const parsed = JSON.parse(saved)
        return parsed.map((p: { name: string; date: string; layers: unknown[]; color: string }) => ({
          title: p.name,
          desc: `${p.layers.length} layers`,
          date: p.date,
          layers: p.layers.length,
          gradient: 'linear-gradient(135deg,#0F172A,#1E293B)',
          type: 'Canvas',
        }))
      }
    } catch { /* ignore */ }
    return []
  }, [])

  // Dynamic timeline from progressStore activities
  const dynamicTimeline: TimelineEvent[] = useMemo(() => {
    const colors = ['#0D9488', '#7C3AED', '#EC4899', '#F59E0B']
    return progress.activities.slice(0, 6).map((a, i) => ({
      color: colors[i % colors.length],
      title: a.text,
      desc: '',
      time: a.time,
    }))
  }, [progress])

  // Dynamic tags from completed modules
  const dynamicTags: string[] = useMemo(() => {
    const tagSet = new Set<string>()
    modulesData.forEach(m => {
      const status = getModuleStatus(progress, m.id, modulesData.length)
      if (status === 'done' || status === 'progress') {
        m.tags.forEach(t => tagSet.add(t))
      }
    })
    return Array.from(tagSet).slice(0, 4)
  }, [progress])

  const statItems = [
    { label: 'Total XP', value: xp, icon: Activity, color: '#0D9488', bg: 'rgba(13,148,136,.1)' },
    { label: 'Streak Hari', value: streakDays, icon: Star, color: '#7C3AED', bg: 'rgba(124,58,237,.1)' },
    { label: 'Hari Aktif', value: activeDays, icon: Calendar, color: '#EC4899', bg: 'rgba(236,72,153,.1)' },
    { label: 'Badges', value: earnedBadgeCount, icon: Trophy, color: '#F59E0B', bg: 'rgba(245,158,11,.1)' },
  ]

  const tabItems: { key: TabKey; label: string }[] = [
    { key: 'progress', label: 'Progres' },
    { key: 'badges', label: 'Badges' },
    { key: 'projects', label: 'Proyek' },
    { key: 'settings', label: 'Pengaturan' },
  ]

  function handleShare() {
    const url = window.location.origin + '/app/profil'
    navigator.clipboard.writeText(url)
    success('Link Tersalin!', 'Link profil berhasil disalin ke clipboard.')
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden">
      {/* ─── Profile Hero ─── */}
      <section className="relative px-4 sm:px-8 pt-8 sm:pt-10 pb-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-teal-600 opacity-[.06]" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 max-w-[960px] mx-auto">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative shrink-0"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-300 flex items-center justify-center text-white text-[1.75rem] font-bold shadow-[0_8px_24px_rgba(13,148,136,.2)]">
              {initials()}
            </div>
            <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-ink text-teal-300 text-[9px] font-bold border-2 border-ink-9">Lv.{Math.min(Math.floor(xp / 200) + 1, 99)}</span>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="flex-1 min-w-0 text-center sm:text-left"
          >
            <h1 className="text-2xl font-bold tracking-tight">{displayName()}</h1>
            <p className="text-xs text-ink-4 mt-1 leading-relaxed">
              {profile?.bio || 'Belum ada bio. Tambahkan di Pengaturan.'}
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap justify-center sm:justify-start">
              {dynamicTags.length > 0 ? dynamicTags.map(t => (
                <span key={t} className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-teal-600/[.08] text-teal-600">{t}</span>
              )) : (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-ink-8 text-ink-4">Mulai belajar untuk mendapat tag</span>
              )}
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex gap-2 shrink-0"
          >
            <button
              onClick={() => setActiveTab('settings')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-ink text-white hover:bg-ink-2 transition-colors cursor-pointer"
            >
              Edit Profil
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-lg border border-ink-7 flex items-center justify-center text-ink-4 hover:border-teal-600 hover:text-teal-600 transition-colors cursor-pointer"
              aria-label="Bagikan profil"
            >
              <Share2 size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats Strip ─── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 sm:px-8 pb-5 max-w-[1024px] mx-auto">
        {statItems.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-ink-7 hover:shadow-md hover:border-teal-600 transition-all"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg, color: s.color }}>
                <Icon size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight"><AnimatedCount target={s.value} /></span>
                <span className="text-[10px] text-ink-4 font-medium mt-0.5">{s.label}</span>
              </div>
            </motion.div>
          )
        })}
      </section>

      {/* ─── Content Tabs ─── */}
      <div className="flex gap-0.5 px-4 sm:px-8 max-w-[1024px] mx-auto mb-4 border-b border-ink-7">
        {tabItems.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={clsx(
              'px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors -mb-px cursor-pointer',
              activeTab === t.key ? 'text-teal-600 border-teal-600' : 'text-ink-4 border-transparent hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      <div className="px-4 sm:px-8 pb-8 max-w-[1024px] mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'progress' && <ProgressTab key="progress" items={dynamicProgressItems} heatmap={heatmapCells} timeline={dynamicTimeline} />}
          {activeTab === 'badges' && <BadgesTab key="badges" badges={dynamicBadges} />}
          {activeTab === 'projects' && <ProjectsTab key="projects" projects={dynamicProjects} />}
          {activeTab === 'settings' && <SettingsTab key="settings" />}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   TAB: Progress
   ══════════════════════════════════════ */
function ProgressTab({ items, heatmap, timeline }: { items: ProgressItem[]; heatmap: { level: number; tooltip: string; date: string }[]; timeline: TimelineEvent[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Learning Progress */}
        <div className="bg-white rounded-xl border border-ink-7 p-5 hover:shadow-md transition-shadow">
          <h3 className="text-[13px] font-bold mb-3.5">Progres Belajar</h3>
          <div className="flex flex-col gap-2.5">
            {items.map(item => (
              <div key={item.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-[11px] font-medium text-ink-4">{item.name}</span>
                  <span className="text-[10px] font-bold">{item.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-ink-8 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: item.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.pct}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white rounded-xl border border-ink-7 p-5 hover:shadow-md transition-shadow">
          <h3 className="text-[13px] font-bold mb-3.5">Aktivitas 12 Minggu</h3>
          <div className="flex gap-1.5">
            {/* Day labels */}
            <div className="flex flex-col gap-[3px] pt-0 mr-0.5">
              {dayLabels.map((d, i) => (
                <span key={i} className="text-[9px] text-ink-5 h-[14px] flex items-center leading-none">{i % 2 === 0 ? d : ''}</span>
              ))}
            </div>
            {/* Grid: 12 columns (weeks) × 7 rows (days) */}
            <div className="flex-1 grid grid-rows-7 grid-flow-col gap-[3px]">
              {heatmap.map((cell, i) => (
                <div
                  key={i}
                  className="w-[14px] h-[14px] rounded-[3px] hover:scale-125 hover:shadow-sm transition-transform cursor-default"
                  style={{ background: heatColors[cell.level] }}
                  title={cell.tooltip}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5 justify-end text-[9px] text-ink-4 mt-2.5">
            <span>Sedikit</span>
            <div className="flex gap-0.5">
              {heatColors.map((c, i) => (
                <span key={i} className="w-[10px] h-[10px] rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <span>Banyak</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-ink-7 p-5 hover:shadow-md transition-shadow">
        <h3 className="text-[13px] font-bold mb-3.5">Aktivitas Terakhir</h3>
        {timeline.length === 0 ? (
          <p className="text-xs text-ink-4 py-4 text-center">Belum ada aktivitas. Mulai belajar untuk melihat riwayat di sini.</p>
        ) : (
        <div className="relative pl-5 flex flex-col gap-4">
          <div className="absolute left-[5px] top-2 bottom-2 w-[1.5px] bg-ink-7" />
          {timeline.map((ev, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative"
            >
              <div className="absolute -left-5 top-1 w-3 h-3 rounded-full border-2 border-ink-9" style={{ background: ev.color }} />
              <strong className="block text-xs mb-0.5">{ev.title}</strong>
              <p className="text-[11px] text-ink-4 leading-snug">{ev.desc}</p>
              <time className="text-[9px] text-ink-5 mt-1 block">{ev.time}</time>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </motion.div>
  )
}

/* ══════════════════════════════════════
   TAB: Badges
   ══════════════════════════════════════ */
function BadgesTab({ badges }: { badges: Badge[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
    >
      {badges.map((b, i) => (
        <motion.div
          key={b.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.04 }}
          className={clsx(
            'bg-white border rounded-xl p-4 text-center transition-all hover:shadow-md',
            b.earned ? 'border-teal-600 bg-teal-600/[.04]' : 'opacity-50 grayscale-[60%] border-ink-7'
          )}
        >
          <div className="w-10 h-10 mx-auto mb-1.5 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold tracking-tight">{b.emoji}</div>
          <h4 className="text-xs font-bold mb-0.5">{b.name}</h4>
          <p className="text-[9px] text-ink-4 leading-snug">{b.desc}</p>
          {b.earned ? (
            <span className="block mt-1.5 text-[8px] text-teal-600 font-semibold">{b.date}</span>
          ) : (
            <span className="block mt-1.5 text-[8px] text-ink-5 font-semibold">Terkunci</span>
          )}
        </motion.div>
      ))}
    </motion.div>
  )
}

/* ══════════════════════════════════════
   TAB: Projects
   ══════════════════════════════════════ */
function ProjectsTab({ projects }: { projects: Project[] }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
    >
      {projects.map((p, i) => (
        <motion.div
          key={p.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => navigate('/app/kanvas')}
          className="bg-white border border-ink-7 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className="h-[100px] flex items-end p-2.5" style={{ background: p.gradient }}>
            <span
              className="text-[9px] font-bold text-white px-2 py-0.5 rounded bg-white/15 backdrop-blur-sm"
              style={p.typeColor ? { color: p.typeColor } : undefined}
            >
              {p.type}
            </span>
          </div>
          <div className="p-3">
            <h4 className="text-xs font-bold mb-0.5">{p.title}</h4>
            <p className="text-[9px] text-ink-4 leading-snug">{p.desc}</p>
            <div className="flex items-center gap-1 mt-1.5 text-[8px] text-ink-5">
              <span>{p.date}</span>
              <span className="text-ink-7">·</span>
              <span>{p.layers} layers</span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* New project */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: projects.length * 0.06 }}
        onClick={() => navigate('/app/kanvas')}
        className="border border-dashed border-ink-5 rounded-xl overflow-hidden cursor-pointer hover:border-teal-600 transition-colors"
      >
        <div className="h-[100px] flex items-center justify-center text-ink-5">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
        </div>
        <div className="p-3">
          <h4 className="text-xs font-bold mb-0.5">Proyek Baru</h4>
          <p className="text-[9px] text-ink-4">Mulai proyek canvas baru</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════
   TAB: Settings
   ══════════════════════════════════════ */
function SettingsTab() {
  const profile = useAuthStore((s) => s.profile)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const deleteAccount = useAuthStore((s) => s.deleteAccount)
  const navigate = useNavigate()
  const { success, warning, error: showError } = useToast()

  // Load persisted preferences
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('nodes-dark') === 'true')
  const [emailNotif, setEmailNotif] = useState(() => localStorage.getItem('nodes-email-notif') !== 'false')
  const [pushNotif, setPushNotif] = useState(() => localStorage.getItem('nodes-push-notif') !== 'false')
  const [publicProfile, setPublicProfile] = useState(() => localStorage.getItem('nodes-public-profile') !== 'false')
  const [language, setLanguage] = useState(() => localStorage.getItem('nodes-language') || 'id')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Controlled form inputs
  const [name, setName] = useState(profile?.full_name || 'User')
  const [email, setEmail] = useState(profile?.email || '')
  const [username, setUsername] = useState(profile?.username || '@user')
  const [bio, setBio] = useState(profile?.bio || '')

  // Sync when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.full_name)
      setEmail(profile.email)
      setUsername(profile.username || '@user')
      setBio(profile.bio || '')
    }
  }, [profile])

  // Persist toggles
  useEffect(() => { localStorage.setItem('nodes-dark', String(darkMode)) }, [darkMode])
  useEffect(() => { localStorage.setItem('nodes-email-notif', String(emailNotif)) }, [emailNotif])
  useEffect(() => { localStorage.setItem('nodes-push-notif', String(pushNotif)) }, [pushNotif])
  useEffect(() => { localStorage.setItem('nodes-public-profile', String(publicProfile)) }, [publicProfile])
  useEffect(() => { localStorage.setItem('nodes-language', language) }, [language])

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  async function handleSaveProfile() {
    setSaving(true)
    const { error } = await updateProfile({
      full_name: name,
      email,
      username,
      bio,
    })
    setSaving(false)

    if (error) {
      showError('Gagal Menyimpan', error)
    } else {
      // Also save preferences to Supabase
      const { user } = useAuthStore.getState()
      if (user) {
        await supabase.from('user_preferences').upsert({
          user_id: user.id,
          dark_mode: darkMode,
          email_notif: emailNotif,
          push_notif: pushNotif,
          public_profile: publicProfile,
          language,
        } as Record<string, unknown>)
      }
      success('Profil Tersimpan', 'Perubahan profil berhasil disimpan.')
    }
  }

  async function handleDeleteAccount() {
    const { error } = await deleteAccount()
    if (error) {
      showError('Gagal', error)
    } else {
      navigate('/auth')
      warning('Akun Dihapus', 'Akun kamu telah dihapus.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-3"
    >
      {/* Account */}
      <div className="bg-white rounded-xl border border-ink-7 p-5 hover:shadow-md transition-shadow">
        <h3 className="text-[13px] font-bold mb-3.5">Akun</h3>
        <div className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-ink-4 mb-1">Nama Lengkap</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-ink-7 text-xs outline-none focus:border-teal-600 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-4 mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 rounded-lg border border-ink-7 text-xs outline-none focus:border-teal-600 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-4 mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-ink-7 text-xs outline-none focus:border-teal-600 transition-colors" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-4 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-ink-7 text-xs outline-none focus:border-teal-600 transition-colors resize-y"
            />
          </div>
          <button onClick={handleSaveProfile} disabled={saving} className="px-5 py-2.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors disabled:opacity-70 cursor-pointer">
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-ink-7 p-5 hover:shadow-md transition-shadow">
        <h3 className="text-[13px] font-bold mb-3.5">Preferensi</h3>

        <ToggleRow label="Mode Gelap" checked={darkMode} onChange={setDarkMode} />
        <ToggleRow label="Notifikasi Email" checked={emailNotif} onChange={setEmailNotif} />
        <ToggleRow label="Notifikasi Push" checked={pushNotif} onChange={setPushNotif} />
        <ToggleRow label="Profil Publik" checked={publicProfile} onChange={setPublicProfile} />

        <h3 className="text-[13px] font-bold mt-5 mb-3">Bahasa</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-ink-7 text-xs outline-none focus:border-teal-600 transition-colors appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%2210%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22%20fill%3D%22none%22%20stroke%3D%22%2394A3B8%22%20stroke-width%3D%222%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_10px_center] pr-7 cursor-pointer"
        >
          <option value="id">Bahasa Indonesia</option>
          <option value="en">English</option>
        </select>

        <h3 className="text-[13px] font-bold mt-5 mb-3">Tour Panduan</h3>
        <p className="text-[11px] text-ink-4 mb-2">Ulangi tour panduan untuk mengenal kembali fitur-fitur NODES.</p>
        <button
          onClick={() => {
            resetAllTours()
            success('Tour Direset', 'Tour panduan akan muncul kembali saat kamu membuka halaman terkait.')
          }}
          className="px-4 py-2 rounded-lg text-[11px] font-semibold text-teal-600 border border-teal-600/20 hover:bg-teal-50 transition-colors cursor-pointer"
        >
          Ulangi Tour
        </button>

        <h3 className="text-[13px] font-bold mt-5 mb-3 text-red-500">Zona Bahaya</h3>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 rounded-lg text-[11px] font-semibold text-red-500 border border-red-500/20 hover:bg-red-500/[.06] transition-colors cursor-pointer"
        >
          Hapus Akun
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Hapus Akun?"
        description="Tindakan ini tidak dapat dibatalkan. Semua data, progress belajar, dan proyek kamu akan dihapus secara permanen."
        confirmLabel="Ya, Hapus Akun"
        cancelLabel="Batal"
        variant="danger"
      />
    </motion.div>
  )
}

/* ─── Toggle Row ─── */
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-ink-8 text-xs text-ink-4">
      <span>{label}</span>
      <label className="relative inline-block w-9 h-5 cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={() => onChange(!checked)} />
        <span className="absolute inset-0 rounded-full bg-ink-5 peer-checked:bg-teal-600 transition-colors" />
        <span className="absolute left-[3px] bottom-[3px] w-3.5 h-3.5 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
      </label>
    </div>
  )
}
