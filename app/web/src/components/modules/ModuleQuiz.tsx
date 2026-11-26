import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Lock, ArrowRight, RotateCcw, ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react'
import clsx from 'clsx'
import { PASSING_SCORE, type QuizQuestion } from '../../data/moduleQuizzes'
import type { QuizResult } from '../../store/progressStore'

interface ModuleQuizProps {
  moduleTitle: string
  questions: QuizQuestion[]
  locked: boolean
  previousResult?: QuizResult
  hasNextModule: boolean
  onComplete: (result: { correct: number; total: number; score: number; passed: boolean }) => void
  onNextModule: () => void
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export default function ModuleQuiz({
  moduleTitle,
  questions,
  locked,
  previousResult,
  hasNextModule,
  onComplete,
  onNextModule,
}: ModuleQuizProps) {
  const [started, setStarted] = useState(!previousResult)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])
  const [finished, setFinished] = useState(false)

  if (locked) {
    return (
      <div className="bg-white border border-ink-7 rounded-2xl p-6 md:p-8">
        <div className="flex items-start gap-3.5 p-5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-amber-900">Evaluasi Modul Terkunci</h2>
            <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
              Selesaikan seluruh sub-bab di modul <strong>{moduleTitle}</strong> terlebih dahulu untuk membuka soal evaluasi ({questions.length} soal pilihan ganda, syarat lulus {PASSING_SCORE}%).
            </p>
          </div>
        </div>
      </div>
    )
  }

  function handleRestart() {
    setStarted(true)
    setCurrentIdx(0)
    setSelectedIdx(null)
    setChecked(false)
    setAnswers([])
    setFinished(false)
  }

  // Saved result overview when revisiting a module whose quiz was already attempted
  if (!started && previousResult) {
    return (
      <div className="bg-white border border-ink-7 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">
          <ClipboardCheck className="w-4 h-4" />
          Evaluasi Modul
        </div>
        <h1 className="text-xl font-bold text-ink tracking-tight mb-5">{moduleTitle}</h1>

        <div className="p-5 rounded-xl border border-ink-7 bg-ink-9/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-3xl font-bold text-ink tracking-tight">{previousResult.bestScore}%</span>
              <span
                className={clsx(
                  'px-2.5 py-0.5 text-[11px] font-semibold rounded-full',
                  previousResult.passed ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-600'
                )}
              >
                {previousResult.passed ? 'Lulus' : 'Belum Lulus'}
              </span>
            </div>
            <p className="text-xs text-ink-4">
              Skor terbaik tercatat · Terakhir: {previousResult.correct} dari {previousResult.total} benar (syarat lulus {PASSING_SCORE}%).
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-ink-7 bg-white text-ink text-xs font-semibold rounded-xl hover:border-teal-600 hover:text-teal-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Kerjakan Ulang
            </button>
            {previousResult.passed && (
              <button
                onClick={onNextModule}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
              >
                {hasNextModule ? 'Modul Selanjutnya' : 'Kembali ke Katalog'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Final result screen right after completing all questions
  if (finished) {
    const correctCount = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    )
    const score = Math.round((correctCount / questions.length) * 100)
    const passed = score >= PASSING_SCORE

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-ink-7 rounded-2xl p-6 md:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-ink-5 uppercase tracking-wider mb-1">
              <ClipboardCheck className="w-3.5 h-3.5 text-teal-600" />
              Hasil Evaluasi · {moduleTitle}
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-bold text-ink tracking-tight">{score}%</span>
              <span
                className={clsx(
                  'px-2.5 py-0.5 text-xs font-semibold rounded-full',
                  passed ? 'bg-teal-100 text-teal-700' : 'bg-red-100 text-red-600'
                )}
              >
                {passed ? 'Lulus Evaluasi' : 'Belum Lulus'}
              </span>
            </div>
            <p className="text-xs text-ink-4 mt-1.5">
              {correctCount} dari {questions.length} soal dijawab benar · Batas kelulusan {PASSING_SCORE}%.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleRestart}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-ink-7 text-ink text-xs font-semibold rounded-xl hover:bg-ink-9 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Ulangi Evaluasi
            </button>
            {passed && (
              <button
                onClick={onNextModule}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
              >
                {hasNextModule ? 'Modul Selanjutnya' : 'Kembali ke Katalog'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Review ringkas per soal */}
        <div className="mt-6">
          <h2 className="text-xs font-bold text-ink-5 uppercase tracking-wider mb-3">Ringkasan Jawaban</h2>
          <div className="space-y-2.5">
            {questions.map((q, i) => {
              const userAns = answers[i]
              const isCorrect = userAns === q.correctIndex
              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-ink-7 bg-ink-9/40 flex items-start gap-3"
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-ink leading-snug">
                      {i + 1}. {q.question}
                    </p>
                    {!isCorrect && (
                      <p className="text-[11px] text-ink-4 mt-1">
                        Jawaban benar: <span className="font-semibold text-teal-700">{q.options[q.correctIndex]}</span>
                      </p>
                    )}
                    <p className="text-[11px] text-ink-5 mt-1 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    )
  }

  // Active question view
  const question = questions[currentIdx]
  const isLast = currentIdx === questions.length - 1
  const progressPct = Math.round(((currentIdx + (checked ? 1 : 0)) / questions.length) * 100)

  function handleCheck() {
    if (selectedIdx === null || checked) return
    setChecked(true)
  }

  function handleNext() {
    if (selectedIdx === null) return
    const nextAnswers = [...answers, selectedIdx]
    setAnswers(nextAnswers)

    if (isLast) {
      const correctCount = questions.reduce(
        (acc, q, i) => acc + (nextAnswers[i] === q.correctIndex ? 1 : 0),
        0
      )
      const score = Math.round((correctCount / questions.length) * 100)
      const passed = score >= PASSING_SCORE
      setFinished(true)
      onComplete({ correct: correctCount, total: questions.length, score, passed })
    } else {
      setCurrentIdx(currentIdx + 1)
      setSelectedIdx(null)
      setChecked(false)
    }
  }

  return (
    <div className="bg-white border border-ink-7 rounded-2xl p-6 md:p-8">
      {/* Header & progress */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600">
          <ClipboardCheck className="w-4 h-4" />
          Evaluasi Modul
        </span>
        <span className="text-xs font-medium text-ink-5">
          Soal {currentIdx + 1} dari {questions.length}
        </span>
      </div>
      <div className="h-1 bg-ink-8 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-teal-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
        >
          <h2 className="text-base md:text-lg font-bold text-ink leading-snug mb-5">
            {question.question}
          </h2>

          {/* Options */}
          <div className="space-y-2.5" role="radiogroup" aria-label={question.question}>
            {question.options.map((option, idx) => {
              const isSelected = selectedIdx === idx
              const isCorrectOption = idx === question.correctIndex
              const showAsCorrect = checked && isCorrectOption
              const showAsWrong = checked && isSelected && !isCorrectOption

              return (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={checked}
                  onClick={() => setSelectedIdx(idx)}
                  className={clsx(
                    'w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all',
                    !checked && 'cursor-pointer',
                    !checked && isSelected && 'border-teal-600 bg-teal-50/50',
                    !checked && !isSelected && 'border-ink-7 bg-white hover:border-ink-5 hover:bg-ink-9/40',
                    showAsCorrect && 'border-teal-600 bg-teal-50',
                    showAsWrong && 'border-red-400 bg-red-50',
                    checked && !showAsCorrect && !showAsWrong && 'border-ink-8 bg-white opacity-55'
                  )}
                >
                  <span
                    className={clsx(
                      'w-6 h-6 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                      showAsCorrect
                        ? 'bg-teal-600 text-white'
                        : showAsWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-teal-600 text-white'
                        : 'bg-ink-9 text-ink-4 border border-ink-7'
                    )}
                  >
                    {showAsCorrect ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : showAsWrong ? (
                      <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    ) : (
                      OPTION_LETTERS[idx]
                    )}
                  </span>
                  <span
                    className={clsx(
                      'text-sm leading-relaxed flex-1',
                      showAsCorrect ? 'text-teal-900 font-medium' : showAsWrong ? 'text-red-800' : 'text-ink-3'
                    )}
                  >
                    {option}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Explanation after check */}
          {checked && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                'mt-5 p-4 rounded-xl border-l-[3px] text-xs leading-relaxed',
                selectedIdx === question.correctIndex
                  ? 'border-l-teal-600 bg-teal-50/50 text-teal-900'
                  : 'border-l-red-500 bg-red-50/50 text-ink-3'
              )}
            >
              <strong className="block mb-1 text-ink">
                {selectedIdx === question.correctIndex ? 'Jawaban tepat.' : 'Belum tepat.'}
              </strong>
              {question.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer actions */}
      <div className="mt-6 pt-5 border-t border-ink-7 flex items-center justify-between gap-4">
        <span className="text-[11px] text-ink-5">
          Syarat kelulusan: minimal {PASSING_SCORE}%
        </span>
        {!checked ? (
          <button
            type="button"
            onClick={handleCheck}
            disabled={selectedIdx === null}
            className="px-5 py-2.5 bg-ink text-white text-xs font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Periksa Jawaban
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
          >
            {isLast ? 'Lihat Hasil Evaluasi' : 'Soal Berikutnya'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
