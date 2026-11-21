import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Ruler, Palette } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../components/ui/Toast'

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPw, setShowPw] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('nodes-remember') === 'true')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()
  const { signIn, signUp, loading, user } = useAuthStore()
  const { info, error: showError } = useToast()

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/app', { replace: true })
  }, [user, navigate])

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /\d/.test(password) ? 4 : 3
  const pwColors = ['', '#ef4444', '#f59e0b', '#22c55e', '#0d9488']
  const pwLabels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat']

  function validate(): boolean {
    const errs: Record<string, string> = {}

    if (!email.trim()) {
      errs.email = 'Email wajib diisi'
    } else if (!email.includes('@') || !email.includes('.')) {
      errs.email = 'Format email tidak valid'
    }

    if (!password.trim()) {
      errs.password = 'Password wajib diisi'
    } else if (tab === 'register' && pwStrength < 2) {
      errs.password = 'Password terlalu lemah, minimal 6 karakter'
    }

    if (tab === 'register' && !fullName.trim()) {
      errs.fullName = 'Nama lengkap wajib diisi'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Persist remember me preference
    localStorage.setItem('nodes-remember', rememberMe ? 'true' : 'false')

    if (tab === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setErrors({ form: error })
        showError('Login Gagal', error)
      } else {
        navigate('/app')
      }
    } else {
      const { error } = await signUp(email, password, fullName)
      if (error) {
        setErrors({ form: error })
        showError('Registrasi Gagal', error)
      } else {
        navigate('/app')
      }
    }
  }

  function handleForgotPassword(e: React.MouseEvent) {
    e.preventDefault()
    info('Lupa Password?', 'Silakan hubungi admin untuk reset password.')
  }

  const taglines = {
    login: { line1: 'Selamat datang', line2: 'kembali.', desc: 'Masuk ke akunmu dan lanjutkan dari sesi terakhir.' },
    register: { line1: 'Gabung ke', line2: 'NODES.', desc: 'Buat akun untuk mengakses 16 sesi materi UI/UX Design.' },
  }

  return (
    <div className="flex min-h-screen">
      {/* ═══ LEFT: Visual Panel ═══ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-ink overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Glows */}
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full bg-teal-600 blur-[120px] opacity-15" />
        <div className="absolute -bottom-32 -right-32 w-[300px] h-[300px] rounded-full bg-teal-500 blur-[100px] opacity-10" />
        {/* Noise */}
        <div className="absolute inset-0 opacity-[.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjgiIG51bU9jdGF2ZXM9IjQiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiLz48L3N2Zz4=')]" />

        {/* Floating orbs — removed for cleaner look */}

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/">
            <img src="/logo.png" alt="NODES" className="h-8 brightness-0 invert" />
          </Link>

          <div className="max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mb-6">
                  <span className="block text-[clamp(2rem,3.5vw,3rem)] font-bold text-white leading-[1.1] tracking-tight">
                    {taglines[tab].line1}
                  </span>
                  <span className="block text-[clamp(2rem,3.5vw,3rem)] font-bold text-teal-400 leading-[1.1] tracking-tight">
                    {taglines[tab].line2}
                  </span>
                </div>
                <p className="text-ink-5 leading-relaxed">{taglines[tab].desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Feature cards */}
            <div className="mt-10 space-y-3">
              {[
                { icon: 'ruler' as const, title: '16 Sesi Terstruktur', sub: 'Dari fondasi hingga proyek akhir', pct: 100 },
                { icon: 'palette' as const, title: 'Canvas Interaktif', sub: 'Praktik langsung di browser' },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3 p-3 bg-white/[.06] backdrop-blur-sm border border-white/[.08] rounded-xl"
                >
                  {card.icon ? (
                    <div className="w-10 h-10 rounded-lg bg-white/[.08] flex items-center justify-center text-teal-300">{card.icon === 'ruler' ? <Ruler className="w-5 h-5" /> : <Palette className="w-5 h-5" />}</div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{card.title}</div>
                    <div className="text-xs text-ink-5">{card.sub}</div>
                  </div>
                  {card.pct && (
                    <svg width="32" height="32" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#5EEAD4" strokeWidth="3" strokeDasharray={`${card.pct * 0.9425} ${94.25 - card.pct * 0.9425}`} strokeLinecap="round" transform="rotate(-90 18 18)" />
                    </svg>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <span className="text-xs text-ink-5">© 2026 NODES — Institut Teknologi Indonesia</span>
        </div>
      </div>

      {/* ═══ RIGHT: Form Panel ═══ */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden block mb-8">
            <img src="/logo.png" alt="NODES" className="h-7" />
          </Link>

          {/* Tab switcher */}
          <div className="relative flex bg-ink-9 rounded-xl p-1 mb-8">
            <motion.div
              className="absolute top-1 bottom-1 rounded-[10px] bg-white shadow-sm"
              animate={{ left: tab === 'login' ? '4px' : '50%', width: 'calc(50% - 4px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setErrors({}) }}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-[10px] transition-colors cursor-pointer ${tab === t ? 'text-ink' : 'text-ink-4'}`}
              >
                {t === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={tab}
              initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === 'login' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
            >
              <div>
                <h1 className="text-2xl font-bold text-ink tracking-tight">
                  {tab === 'login' ? 'Masuk ke ' : 'Daftar di '}<span className="text-teal-600">NODES</span>
                </h1>
                <p className="text-sm text-ink-4 mt-1">
                  {tab === 'login' ? 'Masuk dengan email dan password akunmu.' : 'Isi data di bawah untuk membuat akun baru.'}
                </p>
              </div>

              {/* General form error */}
              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                  {errors.form}
                </div>
              )}

              {tab === 'register' && (
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setErrors((prev) => { const { fullName, ...rest } = prev; return rest }) }}
                      placeholder="Nama lengkap"
                      className={`w-full pl-10 pr-4 py-3 bg-ink-9 border rounded-xl text-sm text-ink placeholder:text-ink-5 focus:ring-2 outline-none transition-all ${
                        errors.fullName ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-ink-7 focus:border-teal-600 focus:ring-teal-600/20'
                      }`}
                      required
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((prev) => { const { email, ...rest } = prev; return rest }) }}
                    placeholder="Email kampus"
                    className={`w-full pl-10 pr-4 py-3 bg-ink-9 border rounded-xl text-sm text-ink placeholder:text-ink-5 focus:ring-2 outline-none transition-all ${
                      errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-ink-7 focus:border-teal-600 focus:ring-teal-600/20'
                    }`}
                    required
                  />
                </div>
                {errors.email ? (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                ) : (
                  <span className="text-[0.6875rem] text-ink-5 mt-1 block">Gunakan email aktif kamu</span>
                )}
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-5" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors((prev) => { const { password, ...rest } = prev; return rest }) }}
                    placeholder={tab === 'login' ? 'Password' : 'Buat password'}
                    className={`w-full pl-10 pr-12 py-3 bg-ink-9 border rounded-xl text-sm text-ink placeholder:text-ink-5 focus:ring-2 outline-none transition-all ${
                      errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-ink-7 focus:border-teal-600 focus:ring-teal-600/20'
                    }`}
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-5 hover:text-ink-4 cursor-pointer" aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}>
                    {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}

                {tab === 'register' && password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-ink-7 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${pwStrength * 25}%`, background: pwColors[pwStrength] }}
                      />
                    </div>
                    <span className="text-[0.625rem] font-semibold" style={{ color: pwColors[pwStrength] }}>
                      {pwLabels[pwStrength]}
                    </span>
                  </div>
                )}
              </div>

              {tab === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 text-sm text-ink-4 cursor-pointer select-none group">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={rememberMe}
                      onClick={() => setRememberMe(!rememberMe)}
                      className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center transition-all ${
                        rememberMe
                          ? 'bg-teal-600 border-teal-600'
                          : 'border-ink-6 group-hover:border-ink-4'
                      }`}
                    >
                      {rememberMe && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    Ingat saya
                  </label>
                  <button type="button" onClick={handleForgotPassword} className="text-sm text-teal-600 font-medium hover:underline">Lupa password?</button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-ink text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-70 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {tab === 'login' ? 'Masuk' : 'Buat Akun'}
                    <ArrowRight className="w-[18px] h-[18px]" />
                  </>
                )}
              </button>

              {tab === 'register' && (
                <p className="text-xs text-ink-5 text-center leading-relaxed">
                  Dengan mendaftar, kamu menyetujui Syarat Penggunaan dan Kebijakan Privasi NODES.
                </p>
              )}
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
