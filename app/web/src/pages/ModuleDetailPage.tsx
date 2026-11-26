import { useState, useEffect, useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, BookOpen, Clock, Award, ChevronDown, Save, Lock, ArrowRight, ClipboardCheck } from 'lucide-react'
import { modulesData } from '../data/modules'
import { moduleSubBabs, subBabContent } from '../data/moduleSubBabs'
import { moduleQuizzes, PASSING_SCORE } from '../data/moduleQuizzes'
import ModuleQuiz from '../components/modules/ModuleQuiz'
import { useToast } from '../components/ui/Toast'
import { loadProgress, saveProgress, markSubBabComplete, saveQuizResult, addActivity, type QuizResult } from '../store/progressStore'

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

interface SubBabState {
  id: number
  title: string
  done: boolean
}

export default function ModuleDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { success, warning } = useToast()

  // Find module from data
  const moduleData = useMemo(() => {
    return modulesData.find((m) => slugify(m.title) === slug)
  }, [slug])

  const title = moduleData?.title || slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Modul'
  const sessionNum = moduleData?.num || '01'
  const category = moduleData?.tags[0] || 'Inti'
  const duration = moduleData?.duration || '60 menit'
  const weight = moduleData?.weight || 5
  const moduleId = moduleData?.id || 1

  // Get sub-babs for THIS module
  const defaultSubBabs: SubBabState[] = useMemo(() => {
    const subs = moduleSubBabs[moduleId]
    if (subs) {
      return subs.map((s) => ({ id: s.id, title: s.title, done: false }))
    }
    // Fallback: generate generic sub-babs matching subs count
    const count = moduleData?.subs || 4
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      title: `Sub-bab ${i + 1}`,
      done: false,
    }))
  }, [moduleId, moduleData?.subs])

  // Sub-bab state with done toggling — uses module-specific localStorage key
  const storageKey = `nodes-subbabs-${slug}`
  const [subBabs, setSubBabs] = useState<SubBabState[]>(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SubBabState[]
        // If stored sub-bab count doesn't match current module, reset
        if (parsed.length === defaultSubBabs.length) return parsed
      } catch { /* ignore */ }
    }
    return defaultSubBabs
  })

  // Reset sub-babs when slug changes (navigating to different module)
  useEffect(() => {
    const saved = localStorage.getItem(`nodes-subbabs-${slug}`)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SubBabState[]
        if (parsed.length === defaultSubBabs.length) {
          setSubBabs(parsed)
          // Set active to first incomplete
          const firstIncomplete = parsed.find((s) => !s.done)
          setActiveSub(firstIncomplete?.id ?? 1)
          return
        }
      } catch { /* ignore */ }
    }
    setSubBabs(defaultSubBabs)
    setActiveSub(defaultSubBabs[0]?.id ?? 1)
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  const [activeSub, setActiveSub] = useState<number | 'quiz'>(() => {
    const firstIncomplete = subBabs.find((s) => !s.done)
    return firstIncomplete?.id ?? 1
  })

  const [quizResult, setQuizResult] = useState<QuizResult | undefined>(() => loadProgress().quizScores?.[moduleId])

  useEffect(() => {
    setQuizResult(loadProgress().quizScores?.[moduleId])
  }, [moduleId])

  const quizQuestions = moduleQuizzes[moduleId] || []
  const hasQuiz = quizQuestions.length > 0

  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Notes per sub-bab, persisted to localStorage
  const notesKey = `nodes-notes-${slug}-${activeSub}`
  const [notes, setNotes] = useState(() => localStorage.getItem(notesKey) || '')
  const [saved, setSaved] = useState(false)

  // Update notes when switching sub-bab
  useEffect(() => {
    if (activeSub === 'quiz') return
    setNotes(localStorage.getItem(notesKey) || '')
    setSaved(false)
  }, [notesKey, activeSub])

  // Calculate progress
  const doneCount = subBabs.filter((s) => s.done).length
  const progress = Math.round((doneCount / subBabs.length) * 100)
  const isModuleComplete = progress >= 100
  const isQuizLocked = !isModuleComplete
  const isQuizPassed = quizResult?.passed ?? false

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
    if (activeSub === 'quiz') return
    if (isSubLocked(activeSub)) {
      warning('Sub-bab Terkunci', 'Selesaikan sub-bab sebelumnya terlebih dahulu.')
      return
    }
    const updatedSubBabs = subBabs.map((s) => (s.id === activeSub ? { ...s, done: !s.done } : s))
    setSubBabs(updatedSubBabs)

    const currentSub = subBabs.find((s) => s.id === activeSub)
    if (currentSub && !currentSub.done) {
      success('Sub-bab Selesai', `"${currentSub.title}" ditandai sebagai selesai.`)

      // Sync to progressStore for dashboard/modules page
      if (moduleData) {
        let prog = loadProgress()
        prog = markSubBabComplete(prog, moduleData.id, activeSub - 1, subBabs.length)
        prog = addActivity(prog, `Menyelesaikan "${currentSub.title}" di ${title}`)
        saveProgress(prog)
      }

      // Auto advance to next incomplete sub-bab, or to Quiz if all sub-babs are done
      const nextSub = updatedSubBabs.find((s) => s.id > activeSub && !s.done)
      if (nextSub) {
        setTimeout(() => setActiveSub(nextSub.id), 450)
      } else if (hasQuiz && updatedSubBabs.every((s) => s.done) && !isQuizPassed) {
        setTimeout(() => setActiveSub('quiz'), 550)
      }
    }
  }

  const handleQuizComplete = (result: { correct: number; total: number; score: number; passed: boolean }) => {
    let prog = loadProgress()
    prog = saveQuizResult(prog, moduleId, result.correct, result.total, PASSING_SCORE)
    prog = addActivity(
      prog,
      `Evaluasi "${title}" — Skor ${result.score}% (${result.passed ? 'Lulus' : 'Belum Lulus'})`
    )
    saveProgress(prog)
    setQuizResult(prog.quizScores[moduleId])

    if (result.passed) {
      success('Evaluasi Lulus', `Skor kamu ${result.score}% (${result.correct}/${result.total} benar).`)
    } else {
      warning('Belum Mencapai Batas Lulus', `Skor ${result.score}%. Minimal ${PASSING_SCORE}% untuk lulus — coba ulangi evaluasi.`)
    }
  }

  // Navigate to next module
  const handleNextModule = () => {
    if (!moduleData) return
    const nextModule = modulesData.find((m) => m.id === moduleData.id + 1)
    if (nextModule) {
      navigate(`/app/modul/${slugify(nextModule.title)}`)
    } else {
      navigate('/app/modul')
    }
  }

  const activeSubData = activeSub === 'quiz' ? undefined : subBabs.find((s) => s.id === activeSub)
  const activeContent = activeSubData ? subBabContent[activeSubData.title] : null

  // A sub-bab is locked if any previous sub-bab is not done
  function isSubLocked(subId: number): boolean {
    const idx = subBabs.findIndex((s) => s.id === subId)
    if (idx <= 0) return false // first sub-bab is never locked
    return subBabs.slice(0, idx).some((s) => !s.done)
  }

  const activeIsLocked = activeSub === 'quiz' ? isQuizLocked : isSubLocked(activeSub)

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
                  {subBabs.map((sub) => {
                    const locked = isSubLocked(sub.id)
                    return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        if (locked) {
                          warning('Sub-bab Terkunci', 'Selesaikan sub-bab sebelumnya terlebih dahulu.')
                          return
                        }
                        setActiveSub(sub.id)
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all ${
                        locked
                          ? 'text-ink-5 opacity-60 cursor-not-allowed'
                          : activeSub === sub.id
                          ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                          : sub.done
                          ? 'text-ink-4 hover:bg-ink-9 cursor-pointer'
                          : 'text-ink-3 hover:bg-ink-9 cursor-pointer'
                      }`}
                    >
                      {sub.done ? (
                        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                      ) : locked ? (
                        <div className="w-5 h-5 rounded-full bg-ink-8 text-ink-5 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${activeSub === sub.id ? 'border-teal-600 bg-teal-600' : 'border-ink-6'}`}>
                          {activeSub === sub.id && <div className="w-full h-full rounded-full bg-teal-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-white rounded-full" /></div>}
                        </div>
                      )}
                      <span className="truncate">{sub.title}</span>
                    </button>
                    )
                  })}
                </div>

                {/* Quiz Evaluation sidebar entry */}
                {hasQuiz && (
                  <div className="mt-2 pt-2 border-t border-ink-7">
                    <button
                      onClick={() => {
                        if (isQuizLocked) {
                          warning('Evaluasi Terkunci', 'Selesaikan semua sub-bab terlebih dahulu untuk membuka evaluasi.')
                          return
                        }
                        setActiveSub('quiz')
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left text-sm transition-all ${
                        isQuizLocked
                          ? 'text-ink-5 opacity-60 cursor-not-allowed'
                          : activeSub === 'quiz'
                          ? 'bg-teal-50 text-teal-700 font-semibold border border-teal-200'
                          : isQuizPassed
                          ? 'text-ink-4 hover:bg-ink-9 cursor-pointer'
                          : 'text-ink-2 font-medium hover:bg-ink-9 cursor-pointer'
                      }`}
                    >
                      {isQuizPassed ? (
                        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                      ) : isQuizLocked ? (
                        <div className="w-5 h-5 rounded-full bg-ink-8 text-ink-5 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      ) : (
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${activeSub === 'quiz' ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600'}`}>
                          <ClipboardCheck className="w-3 h-3" />
                        </div>
                      )}
                      <span className="truncate flex-1">Evaluasi Modul</span>
                      {quizResult && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${quizResult.passed ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-600'}`}>
                          {quizResult.bestScore}%
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* Next Module Button — show when module is complete */}
                {isModuleComplete && (
                  <div className="mt-4 pt-4 border-t border-ink-7">
                    <button
                      onClick={handleNextModule}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
                    >
                      {moduleData && moduleData.id < modulesData.length ? (
                        <>Modul Selanjutnya <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <>Kembali ke Katalog <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {activeSub === 'quiz' && hasQuiz ? (
            <ModuleQuiz
              key={`quiz-${moduleId}`}
              moduleTitle={title}
              questions={quizQuestions}
              locked={isQuizLocked}
              previousResult={quizResult}
              hasNextModule={Boolean(moduleData && moduleData.id < modulesData.length)}
              onComplete={handleQuizComplete}
              onNextModule={handleNextModule}
            />
          ) : (
          <>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSub}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white border border-ink-7 rounded-2xl p-6 md:p-8 mb-4">
                <h1 className="text-xl font-bold text-ink tracking-tight mb-6">
                  {activeContent?.heading || activeSubData?.title || 'Materi'}
                </h1>

                {activeIsLocked ? (
                  /* ─── Locked content ─── */
                  <div className="relative">
                    {/* Blurred preview */}
                    <div className="select-none pointer-events-none blur-[6px] opacity-40 max-h-[200px] overflow-hidden">
                      <div className="prose max-w-none text-ink-3 text-[0.9375rem] leading-relaxed">
                        {activeContent?.body || (
                          <p className="text-ink-4">Konten untuk sub-bab ini sedang disiapkan.</p>
                        )}
                      </div>
                    </div>
                    {/* Gradient fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
                    {/* Lock message */}
                    <div className="mt-4 p-5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-amber-800">Sub-bab Terkunci</h3>
                        <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                          Selesaikan sub-bab sebelumnya terlebih dahulu untuk membuka materi ini. Pelajari materi secara berurutan agar pemahaman kamu lebih solid.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ─── Unlocked content ─── */
                  <div className="prose max-w-none text-ink-3 text-[0.9375rem] leading-relaxed">
                    {activeContent?.body || (
                      <p className="text-ink-4">Konten untuk sub-bab ini sedang disiapkan. Silakan cek kembali nanti.</p>
                    )}
                  </div>
                )}

                {/* Mark complete */}
                <div className="mt-8 pt-6 border-t border-ink-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Sudah memahami materi ini?</h3>
                    <p className="text-xs text-ink-5">
                      {activeIsLocked
                        ? 'Selesaikan sub-bab sebelumnya untuk membuka materi ini.'
                        : 'Tandai sebagai selesai untuk melanjutkan ke sub-bab berikutnya.'}
                    </p>
                  </div>
                  <button
                    onClick={handleMarkDone}
                    disabled={activeIsLocked}
                    className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 ${
                      activeIsLocked
                        ? 'bg-ink-8 text-ink-5 cursor-not-allowed'
                        : activeSubData?.done
                        ? 'bg-teal-100 text-teal-700 hover:bg-teal-200 cursor-pointer'
                        : 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer'
                    }`}
                  >
                    {activeIsLocked ? (
                      <><Lock className="w-4 h-4" /> Terkunci</>
                    ) : (
                      <><Check className="w-4 h-4" /> {activeSubData?.done ? 'Sudah Selesai' : 'Tandai Selesai'}</>
                    )}
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

          {/* Module complete / Quiz prompt banner */}
          {isModuleComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-6 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-2xl"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-teal-800">
                    {hasQuiz && !isQuizPassed ? 'Materi Selesai — Lanjut ke Evaluasi' : 'Modul Selesai!'}
                  </h3>
                  <p className="text-sm text-teal-700/80 mt-1">
                    {hasQuiz && !isQuizPassed
                      ? `Uji pemahamanmu lewat ${quizQuestions.length} soal Evaluasi Modul "${title}".`
                      : `Kamu telah menyelesaikan materi${quizResult ? ` dan evaluasi (skor ${quizResult.bestScore}%)` : ''} di modul "${title}".`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasQuiz && !isQuizPassed ? (
                    <button
                      onClick={() => setActiveSub('quiz')}
                      className="flex items-center gap-2 px-5 py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Mulai Evaluasi
                    </button>
                  ) : (
                    <button
                      onClick={handleNextModule}
                      className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
                    >
                      {moduleData && moduleData.id < modulesData.length ? 'Modul Selanjutnya' : 'Kembali ke Katalog'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  )
}
