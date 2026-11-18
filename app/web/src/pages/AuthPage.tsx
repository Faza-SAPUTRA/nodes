import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /\d/.test(password) ? 4 : 3
  const pwColors = ['', '#ef4444', '#f59e0b', '#22c55e', '#0d9488']
  const pwLabels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      login(tab === 'register' ? fullName : 'Andi Prasetyo', email || 'andi@iti.ac.id')
      navigate('/app')
    }, 1200)
  }

  const taglines = {
    login: { line1: 'Selamat datang', line2: 'kembali.', desc: 'Lanjutkan belajar UI/UX dari titik terakhirmu.' },
    register: { line1: 'Mulai perjalananmu', line2: 'di sini.', desc: 'Buat akun dan mulai eksplorasi dunia desain interaktif.' },
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

        {/* Floating orbs */}
        <div className="absolute top-[20%] left-[15%] w-24 h-24 rounded-full bg-teal-600/20 blur-sm animate-float" />
        <div className="absolute top-[55%] right-[20%] w-16 h-16 rounded-full bg-teal-500/15 blur-sm animate-float [animation-delay:1s]" />
        <div className="absolute bottom-[25%] left-[40%] w-20 h-20 rounded-full bg-teal-400/10 blur-sm animate-float [animation-delay:2s]" />

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
                  <span className="block text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-white leading-[1.1] tracking-tight">
                    {taglines[tab].line1}
                  </span>
                  <span className="block text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-teal-400 leading-[1.1] tracking-tight">
                    {taglines[tab].line2}
                  </span>
                </div>
                <p className="text-ink-5 leading-relaxed">{taglines[tab].desc}</p>
              </motion.div>
            </AnimatePresence>

            {/* Floating cards */}
            <div className="mt-10 space-y-3">
              {[
                { icon: '📐', title: 'Grid Systems', sub: 'Modul 3 · 12 menit', pct: 70 },
                { icon: '🎨', title: 'Color Theory', sub: 'Modul 5 · 18 menit', badge: 'Baru' },
                { icon: null, title: '3 teman online', sub: 'Sedang mengerjakan proyek', live: true },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.15 }}
                  className="flex items-center gap-3 p-3 bg-white/[.06] backdrop-blur-sm border border-white/[.08] rounded-xl"
                >
                  {card.icon ? (
                    <div className="w-10 h-10 rounded-lg bg-white/[.08] flex items-center justify-center text-lg">{card.icon}</div>
                  ) : (
                    <div className="flex -space-x-2">
                      {['bg-teal-600', 'bg-teal-500', 'bg-teal-700'].map((c, j) => (
                        <div key={j} className={`w-8 h-8 rounded-full ${c} flex items-center justify-center text-white text-xs font-bold border-2 border-ink`}>
                          {['F', 'S', 'R'][j]}
                        </div>
                      ))}
                    </div>
                  )}
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
                  {card.badge && <span className="px-2 py-0.5 text-[0.625rem] font-bold bg-teal-600 text-white rounded-full">{card.badge}</span>}
                  {card.live && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-teal-400">
                      <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse-dot" />Live
                    </span>
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
                onClick={() => setTab(t)}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-[10px] transition-colors ${tab === t ? 'text-ink' : 'text-ink-4'}`}
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
            >
              <div>
                <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                  {tab === 'login' ? 'Masuk ke ' : 'Buat akun '}<span className="text-teal-600">NODES</span>
                </h1>
                <p className="text-sm text-ink-4 mt-1">
                  {tab === 'login' ? 'Lanjutkan perjalanan belajar UI/UX kamu.' : 'Mulai perjalanan belajar UI/UX interaktif kamu.'}
                </p>
              </div>

              {tab === 'register' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-5" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap"
                    className="w-full pl-10 pr-4 py-3 bg-ink-9 border border-ink-7 rounded-xl text-sm text-ink placeholder:text-ink-5 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none transition-all"
                    required
                  />
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email kampus"
                    className="w-full pl-10 pr-4 py-3 bg-ink-9 border border-ink-7 rounded-xl text-sm text-ink placeholder:text-ink-5 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none transition-all"
                    required
                  />
                </div>
                <span className="text-[0.6875rem] text-ink-5 mt-1 block">Gunakan email @iti.ac.id</span>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-5" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === 'login' ? 'Password' : 'Buat password'}
                    className="w-full pl-10 pr-12 py-3 bg-ink-9 border border-ink-7 rounded-xl text-sm text-ink placeholder:text-ink-5 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 outline-none transition-all"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-5 hover:text-ink-4">
                    {showPw ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>

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
                  <label className="flex items-center gap-2 text-sm text-ink-4 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-ink-6 text-teal-600 focus:ring-teal-600/20" />
                    Ingat saya
                  </label>
                  <a href="#" className="text-sm text-teal-600 font-medium hover:underline">Lupa password?</a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-ink text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                  </svg>
                ) : (
                  <>
                    {tab === 'login' ? 'Masuk' : 'Buat Akun'}
                    <ArrowRight className="w-[18px] h-[18px]" />
                  </>
                )}
              </button>

              {tab === 'login' && (
                <>
                  <div className="relative flex items-center my-2">
                    <div className="flex-1 h-px bg-ink-7" />
                    <span className="px-4 text-xs text-ink-5 bg-white">atau masuk dengan</span>
                    <div className="flex-1 h-px bg-ink-7" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Google', icon: <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg> },
                      { label: 'GitHub', icon: <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg> },
                    ].map((s) => (
                      <button key={s.label} type="button" className="flex items-center justify-center gap-2 py-3 border border-ink-7 rounded-xl text-sm font-medium text-ink-3 hover:bg-ink-9 hover:border-ink-6 transition-all">
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {tab === 'register' && (
                <p className="text-xs text-ink-5 text-center leading-relaxed">
                  Dengan mendaftar, kamu menyetujui <a href="#" className="text-teal-600 hover:underline">Syarat Penggunaan</a> dan <a href="#" className="text-teal-600 hover:underline">Kebijakan Privasi</a> NODES.
                </p>
              )}
            </motion.form>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
