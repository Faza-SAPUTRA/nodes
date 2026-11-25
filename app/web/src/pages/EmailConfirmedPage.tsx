import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight, Mail } from 'lucide-react'

export default function EmailConfirmedPage() {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  // Auto-redirect after 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          navigate('/app')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-[#F0FDFA] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Co-brand header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Link to="/" className="text-xl font-extrabold tracking-tighter text-ink hover:text-teal-600 transition-colors">
            nodes<span className="text-teal-600">.</span>
          </Link>
          <span className="w-px h-5 bg-ink-7" aria-hidden="true" />
          <img
            src="/logo-iti.png"
            alt="Institut Teknologi Indonesia"
            title="Institut Teknologi Indonesia"
            className="w-7 h-7 object-contain select-none shrink-0"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,.06)] border border-ink-7 p-8 text-center">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mx-auto relative">
              <CheckCircle2 className="w-10 h-10 text-teal-600" strokeWidth={2} />
              {/* Animated ring */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 80">
                <motion.circle
                  cx="40" cy="40" r="38"
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                />
              </svg>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full mb-4">
              <Mail className="w-3.5 h-3.5" />
              Email Terverifikasi
            </div>

            <h1 className="text-2xl font-bold text-ink tracking-tight mb-3">
              Email Berhasil Dikonfirmasi!
            </h1>

            <p className="text-sm text-ink-4 leading-relaxed mb-6">
              Akun kamu sudah aktif dan siap digunakan. Selamat datang di NODES — mari mulai perjalanan belajar UI/UX Design kamu!
            </p>

            {/* CTA Buttons */}
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors w-full justify-center cursor-pointer"
            >
              Mulai Belajar <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-xs text-ink-5 mt-4">
              Otomatis masuk dalam <span className="font-bold text-teal-600">{countdown}</span> detik...
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-ink-5 mt-6"
        >
          Butuh bantuan? Hubungi{' '}
          <a href="mailto:support@nodes.app" className="text-teal-600 hover:underline">
            support@nodes.app
          </a>
        </motion.p>
      </motion.div>
    </div>
  )
}
