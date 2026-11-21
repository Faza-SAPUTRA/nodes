import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/* ─── Tips per halaman ─── */
const pageTips: Record<string, string[]> = {
  '/app': [
    'Coba selesaikan modul yang sedang berlangsung untuk menjaga streak kamu.',
    'Klik modul di panel kanan untuk langsung lanjut belajar.',
    'Gunakan shortcut Ctrl+K untuk pencarian cepat.',
  ],
  '/app/modul': [
    'Filter modul berdasarkan kategori untuk menemukan topik yang kamu cari.',
    'Modul terkunci akan terbuka setelah kamu menyelesaikan modul sebelumnya.',
    'Setiap modul punya bobot nilai yang berbeda — perhatikan sebelum UAS.',
  ],
  '/app/kanvas': [
    'Tekan V untuk Select, F untuk Frame, T untuk Text, dan H untuk Pan.',
    'Ctrl+Z untuk Undo, Ctrl+D untuk duplikasi layer.',
    'Double-click pada Text layer untuk langsung mengedit teks.',
    'Gunakan scroll + Ctrl untuk zoom in/out di canvas.',
  ],
  '/app/kolaborasi': [
    'Klik pada area preview untuk menambahkan pin komentar.',
    'Gunakan tombol Resolve untuk menandai feedback yang sudah selesai.',
    'Switch perangkat preview dengan tombol di toolbar atas.',
  ],
  '/app/profil': [
    'Lengkapi bio di pengaturan untuk personalisasi profil kamu.',
    'Pantau streak harian di halaman ini — konsistensi adalah kunci.',
    'Badge terkunci bisa dibuka dengan menyelesaikan tantangan tertentu.',
  ],
}

const defaultTips = [
  'Butuh bantuan? Klik aku untuk tips seputar halaman ini.',
  'Jelajahi semua fitur NODES — dari modul, canvas, hingga kolaborasi.',
  'Konsistensi belajar lebih penting daripada durasi belajar.',
]

/* ─── Cat SVG ─── */
function CatSVG({ blinking }: { blinking: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="32" cy="40" rx="18" ry="14" fill="#0F172A" />
      {/* Head */}
      <circle cx="32" cy="26" r="14" fill="#0F172A" />
      {/* Ears */}
      <polygon points="20,16 14,4 26,12" fill="#0F172A" />
      <polygon points="44,16 50,4 38,12" fill="#0F172A" />
      <polygon points="21,15 16,6 25,12" fill="#1E293B" />
      <polygon points="43,15 48,6 39,12" fill="#1E293B" />
      {/* Eyes */}
      {blinking ? (
        <>
          <line x1="24" y1="24" x2="28" y2="24" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="24" x2="40" y2="24" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="26" cy="24" r="3" fill="#0D9488" />
          <circle cx="38" cy="24" r="3" fill="#0D9488" />
          <circle cx="27" cy="23" r="1" fill="white" />
          <circle cx="39" cy="23" r="1" fill="white" />
        </>
      )}
      {/* Nose */}
      <ellipse cx="32" cy="28" rx="1.5" ry="1" fill="#64748B" />
      {/* Mouth */}
      <path d="M30 29.5 Q32 31.5 34 29.5" stroke="#64748B" strokeWidth="0.8" fill="none" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="12" y1="26" x2="24" y2="27" stroke="#475569" strokeWidth="0.6" />
      <line x1="12" y1="29" x2="24" y2="29" stroke="#475569" strokeWidth="0.6" />
      <line x1="40" y1="27" x2="52" y2="26" stroke="#475569" strokeWidth="0.6" />
      <line x1="40" y1="29" x2="52" y2="29" stroke="#475569" strokeWidth="0.6" />
      {/* Tail */}
      <path d="M50 40 Q56 32 52 24" stroke="#0F172A" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Paws */}
      <ellipse cx="22" cy="52" rx="5" ry="3" fill="#1E293B" />
      <ellipse cx="42" cy="52" rx="5" ry="3" fill="#1E293B" />
      {/* Collar */}
      <path d="M20 34 Q32 38 44 34" stroke="#0D9488" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="36" r="2" fill="#0D9488" />
    </svg>
  )
}

/* ─── Component ─── */
export default function CatMascot() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [blinking, setBlinking] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('nodes-cat-dismissed') === 'true')

  // Get tips for current page
  const currentPath = Object.keys(pageTips).find(p =>
    p === '/app' ? location.pathname === '/app' : location.pathname.startsWith(p)
  )
  const tips = currentPath ? pageTips[currentPath] : defaultTips

  // Blink animation
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 200)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [])

  // Cycle tips
  useEffect(() => {
    if (!isOpen) return
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isOpen, tips.length])

  // Reset tip index when page changes
  useEffect(() => {
    setTipIndex(0)
  }, [location.pathname])

  if (dismissed) return null

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {/* Tip bubble */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="relative max-w-[260px] bg-white border border-ink-7 rounded-xl shadow-lg p-4 mr-2"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 w-5 h-5 rounded-full hover:bg-ink-9 flex items-center justify-center text-ink-5 hover:text-ink transition-colors"
              aria-label="Tutup tips"
            >
              <X className="w-3 h-3" />
            </button>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-ink-3 leading-relaxed pr-4"
              >
                {tips[tipIndex]}
              </motion.p>
            </AnimatePresence>
            <div className="flex items-center gap-1 mt-2">
              {tips.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTipIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === tipIndex ? 'bg-teal-600' : 'bg-ink-7'}`}
                  aria-label={`Tip ${i + 1}`}
                />
              ))}
            </div>
            {/* Triangle pointer */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-ink-7 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cat button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-2xl bg-white border border-ink-7 shadow-lg flex items-center justify-center cursor-pointer hover:shadow-xl hover:border-teal-200 transition-all overflow-hidden p-1.5"
        aria-label="Tips dari Neko"
        title="Neko — Asisten NODES"
      >
        <CatSVG blinking={blinking} />
      </motion.button>
    </div>
  )
}
