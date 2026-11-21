import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, SearchX } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* 404 Number */}
        <div className="relative mb-8">
          <span className="text-[8rem] font-extrabold text-ink-8 leading-none tracking-tighter select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-teal-50 border-2 border-teal-200 flex items-center justify-center">
              <SearchX className="w-8 h-8 text-teal-600" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-ink tracking-tight mb-3">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm text-ink-4 leading-relaxed mb-8">
          Maaf, halaman yang kamu cari tidak ada atau telah dipindahkan.
          Pastikan URL yang kamu masukkan sudah benar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-ink text-white text-sm font-semibold rounded-xl hover:bg-teal-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 border border-ink-7 text-sm font-medium text-ink-3 rounded-xl hover:bg-ink-9 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
        </div>
      </motion.div>
    </div>
  )
}
