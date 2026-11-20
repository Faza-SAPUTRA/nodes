import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, X } from 'lucide-react'

/* ─── Neko SVG for tour — head-only version (clean at small sizes) ─── */
function NekoGuide({ expression = 'happy' }: { expression?: 'happy' | 'excited' | 'wink' | 'thinking' }) {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="32" cy="34" r="28" fill="#F0FDFA" />
      {/* Head */}
      <circle cx="32" cy="36" r="18" fill="#0F172A" />
      {/* Left ear */}
      <polygon points="16,24 8,6 26,18" fill="#0F172A" />
      <polygon points="17,22 11,8 24,18" fill="#1E293B" />
      {/* Right ear */}
      <polygon points="48,24 56,6 38,18" fill="#0F172A" />
      <polygon points="47,22 53,8 40,18" fill="#1E293B" />
      {/* Inner ear teal accent */}
      <polygon points="18,21 13,10 23,18" fill="#2DD4BF" opacity="0.3" />
      <polygon points="46,21 51,10 41,18" fill="#2DD4BF" opacity="0.3" />
      {/* Eyes - expression based */}
      {expression === 'happy' && (
        <>
          <circle cx="24" cy="34" r="4" fill="#0D9488" />
          <circle cx="40" cy="34" r="4" fill="#0D9488" />
          <circle cx="25.5" cy="32.5" r="1.5" fill="white" />
          <circle cx="41.5" cy="32.5" r="1.5" fill="white" />
        </>
      )}
      {expression === 'excited' && (
        <>
          <circle cx="24" cy="34" r="5" fill="#0D9488" />
          <circle cx="40" cy="34" r="5" fill="#0D9488" />
          <circle cx="26" cy="32" r="2" fill="white" />
          <circle cx="42" cy="32" r="2" fill="white" />
          {/* Sparkle */}
          <circle cx="48" cy="22" r="1.5" fill="#FBBF24" />
          <circle cx="52" cy="26" r="1" fill="#FBBF24" />
        </>
      )}
      {expression === 'wink' && (
        <>
          <circle cx="24" cy="34" r="4" fill="#0D9488" />
          <circle cx="25.5" cy="32.5" r="1.5" fill="white" />
          <path d="M36 34 Q38 32 40 34" stroke="#0D9488" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {expression === 'thinking' && (
        <>
          <circle cx="24" cy="33" r="4" fill="#0D9488" />
          <circle cx="40" cy="35" r="4" fill="#0D9488" />
          <circle cx="25.5" cy="31.5" r="1.5" fill="white" />
          <circle cx="41.5" cy="33.5" r="1.5" fill="white" />
          {/* Thought bubble */}
          <circle cx="52" cy="20" r="3" fill="#CBD5E1" opacity="0.6" />
          <circle cx="48" cy="25" r="1.5" fill="#CBD5E1" opacity="0.4" />
        </>
      )}
      {/* Nose */}
      <ellipse cx="32" cy="39" rx="2" ry="1.5" fill="#64748B" />
      {/* Mouth */}
      {(expression === 'happy' || expression === 'excited') && (
        <path d="M28 41 Q32 44.5 36 41" stroke="#64748B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      )}
      {expression === 'wink' && (
        <path d="M27 41 Q32 45 37 41" stroke="#64748B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      )}
      {expression === 'thinking' && (
        <ellipse cx="35" cy="42" rx="2.5" ry="1.5" fill="#64748B" opacity="0.5" />
      )}
      {/* Whiskers */}
      <line x1="6" y1="36" x2="20" y2="38" stroke="#475569" strokeWidth="0.8" opacity="0.7" />
      <line x1="6" y1="40" x2="20" y2="40" stroke="#475569" strokeWidth="0.8" opacity="0.7" />
      <line x1="44" y1="38" x2="58" y2="36" stroke="#475569" strokeWidth="0.8" opacity="0.7" />
      <line x1="44" y1="40" x2="58" y2="40" stroke="#475569" strokeWidth="0.8" opacity="0.7" />
      {/* Blush spots */}
      <circle cx="18" cy="40" r="3" fill="#F472B6" opacity="0.15" />
      <circle cx="46" cy="40" r="3" fill="#F472B6" opacity="0.15" />
      {/* Collar (just at the chin) */}
      <path d="M18 50 Q32 56 46 50" stroke="#0D9488" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="53" r="2.5" fill="#0D9488" />
    </svg>
  )
}

/* ─── Types ─── */
interface TourStep {
  /** CSS selector for the target element to highlight */
  target: string
  /** Title of this step */
  title: string
  /** Description */
  desc: string
  /** Position of tooltip relative to target */
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center'
  /** Neko's expression for this step */
  nekoExpression?: 'happy' | 'excited' | 'wink' | 'thinking'
  /** Optional: navigate to this route before showing step */
  route?: string
  /** Optional: delay ms before showing (for animations to settle) */
  delay?: number
}

interface Tour {
  id: string
  name: string
  steps: TourStep[]
}

/* ─── Tour definitions ─── */
const tours: Record<string, Tour> = {
  welcome: {
    id: 'welcome',
    name: 'Selamat Datang di NODES',
    steps: [
      {
        target: '[data-tour="welcome"]',
        title: 'Selamat datang di NODES',
        desc: 'Platform belajar UI/UX interaktif untuk mahasiswa Teknik Informatika. Yuk, kenalan sama fitur-fitur utamanya.',
        placement: 'center',
        nekoExpression: 'excited',
      },
      {
        target: 'aside[role="navigation"]',
        title: 'Sidebar Navigasi',
        desc: 'Ini menu utama kamu. Akses Dashboard, Modul Belajar, Canvas Praktik, dan Kolaborasi dari sini. Klik chevron di bawah untuk expand/collapse.',
        placement: 'right',
        nekoExpression: 'happy',
      },
      {
        target: '[data-tour="search"]',
        title: 'Pencarian Cepat',
        desc: 'Cari modul atau materi dengan cepat. Tekan Ctrl+K untuk membuka pencarian langsung dari keyboard.',
        placement: 'bottom',
        nekoExpression: 'thinking',
      },
      {
        target: '[data-tour="streak"]',
        title: 'Streak Harian',
        desc: 'Pantau konsistensi belajar kamu di sini. Login setiap hari untuk menjaga streak dan mendapatkan badge.',
        placement: 'left',
        nekoExpression: 'happy',
      },
      {
        target: '[data-tour="continue-card"]',
        title: 'Lanjutkan Belajar',
        desc: 'Card ini menunjukkan modul terakhir yang sedang kamu pelajari. Klik "Lanjutkan" untuk langsung melanjutkan dari titik terakhir.',
        placement: 'bottom',
        nekoExpression: 'wink',
      },
      {
        target: '[data-tour="modules-recent"]',
        title: 'Modul Terbaru',
        desc: 'Lihat modul-modul yang baru diakses. Klik "Lihat Semua" untuk membuka katalog lengkap.',
        placement: 'top',
        nekoExpression: 'happy',
      },
      {
        target: '[data-tour="sidebar-canvas"]',
        title: 'Canvas Praktik',
        desc: 'Fitur andalan NODES — canvas interaktif mirip Figma. Langsung praktik bikin desain di sini.',
        placement: 'right',
        nekoExpression: 'excited',
      },
      {
        target: '[data-tour="sidebar-collab"]',
        title: 'Ruang Kolaborasi',
        desc: 'Review dan beri feedback desain bersama teman dan dosen. Pin komentar langsung di atas preview.',
        placement: 'right',
        nekoExpression: 'happy',
      },
      {
        target: '[data-tour="sidebar-profile"]',
        title: 'Profil Kamu',
        desc: 'Lihat progress, badge yang didapat, dan atur preferensi akun di halaman profil.',
        placement: 'right',
        nekoExpression: 'thinking',
      },
      {
        target: '[data-tour="welcome"]',
        title: 'Kamu siap!',
        desc: 'Selamat belajar di NODES. Kamu bisa mengulang tour ini kapan saja dari menu profil. Sekarang, mulai eksplorasi!',
        placement: 'center',
        nekoExpression: 'wink',
      },
    ],
  },
  modules: {
    id: 'modules',
    name: 'Panduan Modul Belajar',
    steps: [
      {
        target: '[data-tour="modules-search"]',
        title: 'Cari Modul',
        desc: 'Ketik kata kunci untuk mencari modul berdasarkan judul atau deskripsi.',
        placement: 'bottom',
        nekoExpression: 'thinking',
      },
      {
        target: '[data-tour="modules-filter"]',
        title: 'Filter Kategori',
        desc: 'Filter modul berdasarkan kategori: Fondasi, Inti, Lanjutan, Proyek, atau Evaluasi.',
        placement: 'bottom',
        nekoExpression: 'happy',
      },
      {
        target: '[data-tour="modules-grid"]',
        title: 'Kartu Modul',
        desc: 'Setiap kartu menampilkan progress, jumlah sub-bab, bobot nilai, dan status. Klik untuk membuka modul.',
        placement: 'top',
        nekoExpression: 'wink',
      },
    ],
  },
  canvas: {
    id: 'canvas',
    name: 'Panduan Canvas Praktik',
    steps: [
      {
        target: '[data-tour="canvas-tools"]',
        title: 'Toolbar',
        desc: 'Pilih tool — Select (V), Frame (F), Text (T), Hand (H), atau Pen (P). Shortcut keyboard juga tersedia.',
        placement: 'bottom',
        nekoExpression: 'excited',
      },
      {
        target: '[data-tour="canvas-projects"]',
        title: 'Panel Proyek',
        desc: 'Daftar proyek kamu ada di sini. Klik proyek untuk beralih, atau buat proyek baru dengan tombol +.',
        placement: 'right',
        nekoExpression: 'happy',
      },
      {
        target: '[data-tour="canvas-area"]',
        title: 'Area Canvas',
        desc: 'Ini area kerja utama. Klik dan drag untuk membuat elemen, scroll untuk pan, Ctrl+scroll untuk zoom.',
        placement: 'top',
        nekoExpression: 'wink',
      },
    ],
  },
}

/* ─── Storage helpers ─── */
const STORAGE_KEY = 'nodes-onboarding'

function getCompletedTours(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function markTourCompleted(tourId: string) {
  const completed = getCompletedTours()
  if (!completed.includes(tourId)) {
    completed.push(tourId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
  }
}

export function resetAllTours() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isTourCompleted(tourId: string): boolean {
  return getCompletedTours().includes(tourId)
}

/* ─── Tooltip positioning ─── */
function getTooltipPosition(rect: DOMRect, placement: TourStep['placement'], tooltipW = 320, tooltipH = 180) {
  const pad = 16
  const arrowSize = 10
  let top = 0, left = 0

  if (placement === 'center') {
    return {
      top: window.innerHeight / 2 - tooltipH / 2,
      left: window.innerWidth / 2 - tooltipW / 2,
    }
  }

  switch (placement) {
    case 'bottom':
      top = rect.bottom + pad + arrowSize
      left = rect.left + rect.width / 2 - tooltipW / 2
      break
    case 'top':
      top = rect.top - tooltipH - pad - arrowSize
      left = rect.left + rect.width / 2 - tooltipW / 2
      break
    case 'right':
      top = rect.top + rect.height / 2 - tooltipH / 2
      left = rect.right + pad + arrowSize
      break
    case 'left':
      top = rect.top + rect.height / 2 - tooltipH / 2
      left = rect.left - tooltipW - pad - arrowSize
      break
  }

  // Clamp to viewport
  left = Math.max(pad, Math.min(left, window.innerWidth - tooltipW - pad))
  top = Math.max(pad, Math.min(top, window.innerHeight - tooltipH - pad))

  return { top, left }
}

/* ─── Spotlight overlay ─── */
function SpotlightOverlay({ rect }: { rect: DOMRect | null }) {
  if (!rect) {
    // Center mode — full overlay
    return <div className="fixed inset-0 bg-black/60 z-[9998] transition-all duration-500" />
  }

  const pad = 8
  const r = 12

  return (
    <svg className="fixed inset-0 w-full h-full z-[9998] pointer-events-auto" style={{ cursor: 'default' }}>
      <defs>
        <mask id="spotlight-mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          <rect
            x={rect.left - pad}
            y={rect.top - pad}
            width={rect.width + pad * 2}
            height={rect.height + pad * 2}
            rx={r}
            ry={r}
            fill="black"
          />
        </mask>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#spotlight-mask)" />
      {/* Glow ring around target */}
      <rect
        x={rect.left - pad}
        y={rect.top - pad}
        width={rect.width + pad * 2}
        height={rect.height + pad * 2}
        rx={r}
        ry={r}
        fill="none"
        stroke="#0D9488"
        strokeWidth="2"
        className="animate-pulse"
      />
    </svg>
  )
}

/* ─── Main component ─── */
export default function OnboardingTour() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTour, setActiveTour] = useState<Tour | null>(null)
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [showWelcomePrompt, setShowWelcomePrompt] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Check if welcome tour should auto-trigger
  useEffect(() => {
    if (location.pathname === '/app' && !isTourCompleted('welcome')) {
      const timer = setTimeout(() => setShowWelcomePrompt(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  // Auto-trigger page-specific tours
  useEffect(() => {
    if (activeTour) return // Don't interrupt active tour

    const path = location.pathname
    if (path.startsWith('/app/modul') && !path.includes('/app/modul/') && !isTourCompleted('modules')) {
      const timer = setTimeout(() => startTour('modules'), 800)
      return () => clearTimeout(timer)
    }
  }, [location.pathname, activeTour])

  // Find and measure target element
  const measureTarget = useCallback(() => {
    if (!activeTour) return
    const currentStep = activeTour.steps[step]
    if (!currentStep) return

    if (currentStep.placement === 'center') {
      setTargetRect(null)
      return
    }

    const el = document.querySelector(currentStep.target) as HTMLElement | null
    if (el) {
      const rect = el.getBoundingClientRect()
      const isVisible =
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth

      if (!isVisible) {
        // Scroll into view, then re-measure after scroll finishes
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          const newRect = el.getBoundingClientRect()
          setTargetRect(newRect)
        }, 400)
      } else {
        setTargetRect(rect)
      }
    } else {
      setTargetRect(null)
    }
  }, [activeTour, step])

  useEffect(() => {
    if (!activeTour) return
    const currentStep = activeTour.steps[step]
    const delay = currentStep?.delay || 300
    const timer = setTimeout(measureTarget, delay)
    return () => clearTimeout(timer)
  }, [activeTour, step, measureTarget])

  // Re-measure on resize
  useEffect(() => {
    if (!activeTour) return
    window.addEventListener('resize', measureTarget)
    return () => window.removeEventListener('resize', measureTarget)
  }, [activeTour, measureTarget])

  // Block scroll while tour is active
  useEffect(() => {
    if (activeTour) {
      document.body.style.overflow = 'hidden'
      // Also block scroll on main content container
      const mainContent = document.querySelector('main') || document.querySelector('[class*="overflow"]')
      if (mainContent instanceof HTMLElement) {
        const prev = mainContent.style.overflow
        mainContent.style.overflow = 'hidden'
        return () => {
          document.body.style.overflow = ''
          mainContent.style.overflow = prev
        }
      }
      return () => { document.body.style.overflow = '' }
    }
  }, [activeTour])

  function startTour(tourId: string) {
    const tour = tours[tourId]
    if (!tour) return
    setShowWelcomePrompt(false)
    setActiveTour(tour)
    setStep(0)

    // Navigate to route if first step requires it
    if (tour.steps[0]?.route && location.pathname !== tour.steps[0].route) {
      navigate(tour.steps[0].route)
    }
  }

  function nextStep() {
    if (!activeTour) return
    if (step < activeTour.steps.length - 1) {
      const nextS = activeTour.steps[step + 1]
      if (nextS.route && location.pathname !== nextS.route) {
        navigate(nextS.route)
      }
      setStep(step + 1)
    } else {
      endTour()
    }
  }

  function prevStep() {
    if (step > 0) setStep(step - 1)
  }

  function endTour() {
    if (activeTour) {
      markTourCompleted(activeTour.id)
    }
    setActiveTour(null)
    setStep(0)
    setTargetRect(null)
  }

  function skipTour() {
    if (activeTour) {
      markTourCompleted(activeTour.id)
    }
    setActiveTour(null)
    setStep(0)
    setTargetRect(null)
  }

  const currentStep = activeTour?.steps[step]
  const isFirst = step === 0
  const isLast = activeTour ? step === activeTour.steps.length - 1 : false
  const progress = activeTour ? ((step + 1) / activeTour.steps.length) * 100 : 0

  // Calculate tooltip position
  const tooltipPos = currentStep
    ? getTooltipPosition(
        targetRect || new DOMRect(0, 0, 0, 0),
        currentStep.placement,
        320,
        200
      )
    : { top: 0, left: 0 }

  return (
    <>
      {/* Welcome prompt for new users */}
      <AnimatePresence>
        {showWelcomePrompt && !activeTour && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 max-w-sm"
          >
            <div className="bg-white border border-ink-7 rounded-2xl shadow-2xl p-5 relative overflow-hidden">
              {/* Accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-600" />

              <div className="flex items-start gap-3">
                <motion.div
                  className="w-12 h-12 flex-shrink-0"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <NekoGuide expression="excited" />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-ink mb-1">Hai, aku Neko!</h3>
                  <p className="text-xs text-ink-4 leading-relaxed mb-3">
                    Baru di NODES? Ikuti tour singkat bersamaku untuk mengenal fitur-fitur utama. Hanya butuh 1 menit.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startTour('welcome')}
                      className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                    >
                      Tour bersama Neko
                    </button>
                    <button
                      onClick={() => {
                        setShowWelcomePrompt(false)
                        markTourCompleted('welcome')
                      }}
                      className="px-3 py-2 text-xs font-medium text-ink-4 hover:text-ink transition-colors cursor-pointer"
                    >
                      Nanti saja
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active tour overlay */}
      <AnimatePresence>
        {activeTour && currentStep && (
          <>
            {/* Spotlight overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => {
                // Allow clicking through to target element
                if (targetRect) {
                  const { clientX, clientY } = e
                  if (
                    clientX >= targetRect.left &&
                    clientX <= targetRect.right &&
                    clientY >= targetRect.top &&
                    clientY <= targetRect.bottom
                  ) {
                    return
                  }
                }
              }}
            >
              <SpotlightOverlay rect={targetRect} />
            </motion.div>

            {/* Tooltip */}
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              key={step}
              className="fixed z-[9999] w-[320px]"
              style={{ top: tooltipPos.top, left: tooltipPos.left }}
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-ink-7 overflow-hidden">
                {/* Progress bar */}
                <div className="h-1 bg-ink-8">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                <div className="p-5">
                  {/* Header with Neko */}
                  <div className="flex items-start gap-3 mb-2">
                    <motion.div
                      className="w-10 h-10 flex-shrink-0"
                      key={`neko-${step}`}
                      initial={{ scale: 0.8, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <NekoGuide expression={currentStep.nekoExpression || 'happy'} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-ink leading-snug">{currentStep.title}</h3>
                      <span className="text-[9px] text-teal-600 font-semibold">Neko</span>
                    </div>
                    <button
                      onClick={skipTour}
                      className="w-6 h-6 rounded-lg hover:bg-ink-9 flex items-center justify-center text-ink-5 hover:text-ink transition-colors flex-shrink-0 cursor-pointer"
                      aria-label="Lewati tour"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body */}
                  <p className="text-xs text-ink-4 leading-relaxed mb-4">{currentStep.desc}</p>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-ink-5 font-medium">
                      {step + 1} / {activeTour.steps.length}
                    </span>

                    <div className="flex items-center gap-2">
                      {!isFirst && (
                        <button
                          onClick={prevStep}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-ink-4 hover:text-ink border border-ink-7 rounded-lg hover:bg-ink-9 transition-colors cursor-pointer"
                        >
                          <ChevronLeft className="w-3 h-3" />
                          Kembali
                        </button>
                      )}
                      <button
                        onClick={nextStep}
                        className="flex items-center gap-1 px-4 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                      >
                        {isLast ? 'Selesai' : 'Lanjut'}
                        {!isLast && <ChevronRight className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Step dots */}
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {activeTour.steps.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === step ? 'w-4 bg-teal-600' : i < step ? 'w-1.5 bg-teal-300' : 'w-1.5 bg-ink-7'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ─── Hook for triggering tours from other components ─── */
export function useTour() {
  return {
    isCompleted: isTourCompleted,
    reset: resetAllTours,
  }
}
