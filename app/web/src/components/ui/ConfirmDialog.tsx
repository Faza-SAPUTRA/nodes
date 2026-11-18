import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                variant === 'danger' ? 'bg-red-50' : 'bg-teal-50'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-500' : 'text-teal-600'}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-ink">{title}</h3>
                <p className="text-sm text-ink-4 mt-1">{description}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-ink-9 flex items-center justify-center text-ink-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-ink-3 border border-ink-7 rounded-xl hover:bg-ink-9 transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => { onConfirm(); onClose() }}
                className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors ${
                  variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
