import { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react'

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
      },
      {
        target: 'aside[role="navigation"]',
        title: 'Sidebar Navigasi',
        desc: 'Ini menu utama kamu. Akses Dashboard, Modul Belajar, Canvas Praktik, dan Kolaborasi dari sini. Klik chevron di bawah untuk expand/collapse.',
        placement: 'right',
      },
      {
        target: '[data-tour="search"]',
        title: 'Pencarian Cepat',
        desc: 'Cari modul atau materi dengan cepat. Tekan Ctrl+K untuk membuka pencarian langsung dari keyboard.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="streak"]',
        title: 'Streak Harian',
        desc: 'Pantau konsistensi belajar kamu di sini. Login setiap hari untuk menjaga streak dan mendapatkan badge.',
        placement: 'left',
      },
      {
        target: '[data-tour="continue-card"]',
        title: 'Lanjutkan Belajar',
        desc: 'Card ini menunjukkan modul terakhir yang sedang kamu pelajari. Klik "Lanjutkan" untuk langsung melanjutkan dari titik terakhir.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="modules-recent"]',
        title: 'Modul Terbaru',
        desc: 'Lihat modul-modul yang baru diakses. Klik "Lihat Semua" untuk membuka katalog lengkap.',
        placement: 'top',
      },
      {
        target: '[data-tour="sidebar-canvas"]',
        title: 'Canvas Praktik',
        desc: 'Fitur andalan NODES — canvas interaktif mirip Figma. Langsung praktik bikin desain di sini.',
        placement: 'right',
      },
      {
        target: '[data-tour="sidebar-collab"]',
        title: 'Ruang Kolaborasi',
        desc: 'Review dan beri feedback desain bersama teman dan dosen. Pin komentar langsung di atas preview.',
        placement: 'right',
      },
      {
        target: '[data-tour="sidebar-profile"]',
        title: 'Profil Kamu',
        desc: 'Lihat progress, badge yang didapat, dan atur preferensi akun di halaman profil.',
        placement: 'right',
      },
      {
        target: '[data-tour="welcome"]',
        title: 'Kamu siap!',
        desc: 'Selamat belajar di NODES. Kamu bisa mengulang tour ini kapan saja dari menu profil. Sekarang, mulai eksplorasi!',
        placement: 'center',
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
      },
      {
        target: '[data-tour="modules-filter"]',
        title: 'Filter Kategori',
        desc: 'Filter modul berdasarkan kategori: Fondasi, Inti, Lanjutan, Proyek, atau Evaluasi.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="modules-grid"]',
        title: 'Kartu Modul',
        desc: 'Setiap kartu menampilkan progress, jumlah sub-bab, bobot nilai, dan status. Klik untuk membuka modul.',
        placement: 'top',
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
      },
      {
        target: '[data-tour="canvas-projects"]',
        title: 'Panel Proyek',
        desc: 'Daftar proyek kamu ada di sini. Klik proyek untuk beralih, atau buat proyek baru dengan tombol +.',
        placement: 'right',
      },
      {
        target: '[data-tour="canvas-area"]',
        title: 'Area Canvas',
        desc: 'Ini area kerja utama. Klik dan drag untuk membuat elemen, scroll untuk pan, Ctrl+scroll untuk zoom.',
        placement: 'top',
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

    const el = document.querySelector(currentStep.target)
    if (el) {
      const rect = el.getBoundingClientRect()
      setTargetRect(rect)
      // Scroll element into view if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-ink mb-1">Baru di NODES?</h3>
                  <p className="text-xs text-ink-4 leading-relaxed mb-3">
                    Ikuti tour singkat untuk mengenal fitur-fitur utama platform ini. Hanya butuh 1 menit.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startTour('welcome')}
                      className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                    >
                      Mulai Tour
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
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-ink leading-snug pr-6">{currentStep.title}</h3>
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
