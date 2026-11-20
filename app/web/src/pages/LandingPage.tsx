import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

/* ── Reusable scroll-reveal wrapper ── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ── Particle Canvas ── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let w = 0, h = 0, animId = 0
    const mouse = { x: -999, y: -999 }
    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number; pulse: number }[] = []
    const COUNT = 50

    function resize() {
      const parent = canvas!.parentElement!
      w = canvas!.width = parent.offsetWidth
      h = canvas!.height = parent.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    canvas.parentElement!.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    })

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w, y: Math.random() * h,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    function loop() {
      ctx.clearRect(0, 0, w, h)
      particles.forEach((p) => {
        p.x += p.speedX; p.y += p.speedY; p.pulse += 0.02
        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) { const f = (120 - dist) / 120 * 0.8; p.x += (dx / dist) * f; p.y += (dy / dist) * f }
        if (p.x < 0 || p.x > w) p.speedX *= -1
        if (p.y < 0 || p.y > h) p.speedY *= -1
        const glow = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse))
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(13,148,136,${glow})`; ctx.fill()
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(13,148,136,${glow * 0.15})`; ctx.fill()
      })
      // connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(13,148,136,${0.08 * (1 - dist / 150)})`; ctx.lineWidth = 0.5; ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(loop)
    }
    loop()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" aria-hidden="true" />
}

/* ── Counter ── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 2000
    const startTime = Date.now()
    const tick = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      start = Math.round(eased * target)
      setCount(start)
      if (progress < 1) requestAnimationFrame(tick)
    }
    tick()
  }, [inView, target])
  return <span ref={ref} className="text-teal-600">{count}{suffix}</span>
}

/* ── Marquee items ── */
const marqueeItems = ['Pengantar UX', 'Analisis Pengguna', 'Information Architecture', 'Wireframing', 'Color Theory', 'Typography', 'Visual Hierarchy', 'Design System', 'Prototyping', 'Usability Testing']

/* ── Challenge cards ── */
const challenges = [
  { num: '01', title: 'Teks statis, nol simulasi', desc: 'Platform belajar yang ada hanya menyediakan materi bacaan. Tidak ada ruang untuk mencoba membuat layout, bermain warna, atau merasakan prinsip desain secara langsung.' },
  { num: '02', title: 'Tools terfragmentasi', desc: 'Baca materi di LMS, praktik di Figma, kirim tugas di email, feedback di WhatsApp. Alur yang terpecah ini menghabiskan waktu dan fokus mahasiswa.' },
  { num: '03', title: 'Feedback yang terlambat', desc: 'Umpan balik desain baru datang berhari-hari kemudian. Pada saat itu, mahasiswa sudah lupa konteks dan harus mengulang dari awal.' },
]

const processSteps = [
  { num: '01', title: 'Daftar dengan email kampus', desc: 'Buat akun gratis menggunakan email ITI. Akses 16 sesi materi UI/UX sesuai kurikulum RPS.' },
  { num: '02', title: 'Ikuti modul terstruktur', desc: 'Dari Pengantar UX, Analisis Pengguna, Wireframing, hingga Prototyping — semuanya tersusun per sesi.' },
  { num: '03', title: 'Praktik di canvas interaktif', desc: 'Bangun wireframe, color palette, dan design system langsung di canvas — tanpa perlu tool terpisah.' },
  { num: '04', title: 'Review & kolaborasi', desc: 'Dosen dan teman sekelas memberi feedback langsung di desainmu. Iterasi, perbaiki, berkembang.' },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [navHidden, setNavHidden] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const lastScroll = useRef(0)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80])

  const handleScroll = useCallback(() => {
    const y = window.scrollY
    setScrolled(y > 60)
    if (y > 300) setNavHidden(y > lastScroll.current)
    else setNavHidden(false)
    lastScroll.current = y
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className="bg-white text-ink-3 overflow-x-hidden">
      {/* ═══ NAVBAR ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${scrolled ? 'py-3.5 bg-white/85 backdrop-blur-2xl shadow-[0_1px_0_var(--color-ink-7)]' : 'py-6'} ${navHidden ? '-translate-y-full pointer-events-none' : ''}`} aria-label="Navigasi utama">
        <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,80px)] flex items-center justify-between">
          <Link to="/" className="text-2xl font-extrabold tracking-tighter text-ink hover:text-teal-600 transition-colors cursor-pointer" aria-label="NODES - halaman utama">
            nodes<span className="text-teal-600">.</span>
          </Link>
          <div className="hidden md:flex gap-2">
            {['Masalah', 'Fitur', 'Cara Kerja', 'Testimoni'].map((label, i) => (
              <a key={i} href={`#${['challenge', 'bento', 'process', 'proof'][i]}`} className="relative px-3.5 py-2 text-[0.8125rem] font-medium text-ink-4 hover:text-ink transition-colors group cursor-pointer">
                {label}
                <span className="absolute bottom-1 left-3.5 right-3.5 h-[1.5px] bg-teal-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-right group-hover:origin-left duration-350" />
              </a>
            ))}
          </div>
          <Link to="/auth" className="hidden md:inline-flex px-6 py-2.5 text-[0.8125rem] font-semibold text-white bg-ink rounded-full hover:bg-teal-600 hover:scale-[1.04] transition-all cursor-pointer">
            Mulai Belajar
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 cursor-pointer" aria-label="Buka menu navigasi" aria-expanded={mobileMenuOpen}>
            <div className="w-5 flex flex-col gap-[5px]">
              <span className={`block h-[1.5px] bg-ink transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block h-[1.5px] bg-ink transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-0' : ''}`} />
            </div>
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden px-6 pb-4 pt-2 flex flex-col gap-2">
            {['Masalah', 'Fitur', 'Cara Kerja', 'Testimoni'].map((label, i) => (
              <a key={i} href={`#${['challenge', 'bento', 'process', 'proof'][i]}`} onClick={() => setMobileMenuOpen(false)} className="py-2 text-sm text-ink-4 hover:text-ink cursor-pointer">{label}</a>
            ))}
            <Link to="/auth" className="mt-2 py-2.5 text-center text-sm font-semibold text-white bg-ink rounded-xl cursor-pointer">Mulai Belajar</Link>
          </motion.div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-[140px] pb-20 overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(var(--color-ink-7)_1px,transparent_1px),linear-gradient(90deg,var(--color-ink-7)_1px,transparent_1px)] bg-[size:80px_80px] opacity-35 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black_30%,transparent_100%)]" />
        {/* Glow */}
        <div className="absolute -top-[200px] -right-[100px] w-[600px] h-[600px] rounded-full bg-teal-600 blur-[120px] opacity-12 pointer-events-none" />
        <div className="absolute -bottom-[300px] -left-[200px] w-[600px] h-[600px] rounded-full bg-teal-500 blur-[120px] opacity-8 pointer-events-none" />
        <ParticleCanvas />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-[1] max-w-[1280px] mx-auto px-[clamp(20px,4vw,80px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 pl-2 bg-teal-50 border border-teal-100 rounded-full text-xs font-semibold text-teal-700 uppercase tracking-widest mb-8"
          >
            <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse-dot" />
            E-Learning UI/UX · Teknik Informatika ITI
          </motion.div>

          <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-extrabold text-ink leading-[0.95] tracking-tighter mb-7">
            {['Belajar desain', 'bukan cuma ', 'tapi '].map((text, i) => (
              <span key={i} className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                >
                  {text}
                  {i === 1 && <em className="not-italic text-teal-600 relative"><span>membaca</span><span className="absolute bottom-[.06em] left-0 right-0 h-[.08em] bg-teal-100 rounded" /></em>}
                  {i === 1 && ','}
                  {i === 2 && <em className="not-italic text-teal-600 relative"><span>membangun</span><span className="absolute bottom-[.06em] left-0 right-0 h-[.08em] bg-teal-100 rounded" /></em>}
                  {i === 2 && '.'}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-[520px] text-lg leading-relaxed text-ink-4 mb-11"
          >
            NODES menyatukan modul teori, canvas interaktif, dan ruang kolaborasi dalam satu platform — sehingga kamu bisa langsung praktik sambil belajar prinsip UI/UX.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-[72px]"
          >
            <Link to="/auth" className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 text-[0.9375rem] font-semibold text-white bg-ink rounded-[14px] overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(13,148,136,.25)] transition-all cursor-pointer">
              <span className="absolute inset-0 bg-teal-600 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(.16,1,.3,1)]" />
              <span className="relative z-[1]">Coba Sekarang — Gratis</span>
              <ArrowRight className="relative z-[1] w-[18px] h-[18px]" />
            </Link>
            <a href="#bento" className="inline-flex items-center justify-center gap-2 px-7 py-4 text-[0.9375rem] font-medium text-ink-3 border-[1.5px] border-ink-6 rounded-[14px] hover:border-teal-600 hover:text-teal-600 transition-all cursor-pointer">
              Eksplorasi Fitur
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-6 sm:gap-16"
          >
            {[{ target: 500, suffix: '+', label: 'Mahasiswa Aktif' }, { target: 16, label: 'Sesi Perkuliahan' }, { target: 8, label: 'Proyek Praktik' }].map((m, i) => (
              <div key={i}>
                <div className="text-[2.5rem] font-extrabold text-ink leading-none tracking-tight">
                  <Counter target={m.target} suffix={m.suffix} />
                </div>
                <div className="text-xs font-medium text-ink-5 uppercase tracking-widest mt-1.5">{m.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div className="py-12 border-y border-ink-7 overflow-hidden">
        <div className="flex gap-12 animate-marquee w-max hover:[animation-play-state:paused]">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-base font-medium text-ink-5 whitespace-nowrap hover:text-teal-600 transition-colors">
              <span className="w-1.5 h-1.5 bg-teal-600 rounded-full flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ CHALLENGE ═══ */}
      <section id="challenge" className="py-[140px] max-lg:py-20">
        <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,80px)]">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            <Reveal className="lg:sticky lg:top-[140px]">
              <div className="text-[0.6875rem] font-bold text-teal-600 uppercase tracking-[.1em] mb-5">Tantangan Nyata</div>
              <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-ink leading-[1.1] tracking-tight mb-5">
                E-Learning konvensional tidak dirancang untuk desainer.
              </h2>
              <p className="text-[1.0625rem] text-ink-4 leading-relaxed max-w-[440px]">
                Mahasiswa UI/UX butuh lebih dari sekedar slide dan PDF. Mereka butuh ruang untuk bereksperimen, gagal, dan belajar melalui praktik langsung.
              </p>
            </Reveal>
            <div className="flex flex-col gap-6">
              {challenges.map((c, i) => (
                <Reveal key={i} delay={i * 0.15}>
                  <div className="group relative p-9 bg-ink-9 border border-ink-7 rounded-[20px] overflow-hidden hover:bg-white hover:border-teal-100 hover:shadow-[0_12px_40px_rgba(13,148,136,.08)] hover:translate-x-2 transition-all duration-400">
                    <div className="absolute top-0 left-0 w-[3px] h-full bg-ink-6 group-hover:bg-teal-600 group-hover:w-1 transition-all duration-300" />
                    <div className="text-[0.6875rem] font-bold text-ink-5 tracking-widest mb-3 group-hover:text-teal-600 transition-colors">{c.num}</div>
                    <h3 className="text-lg font-bold text-ink mb-2">{c.title}</h3>
                    <p className="text-[0.9375rem] text-ink-4 leading-relaxed">{c.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BENTO FEATURES ═══ */}
      <section id="bento" className="pb-[140px] max-lg:pb-20">
        <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,80px)]">
          <Reveal className="text-center mb-16">
            <div className="text-[0.6875rem] font-bold text-teal-600 uppercase tracking-[.1em] mb-4">Solusi</div>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-ink leading-[1.1] tracking-tight">
              Satu platform.<br /><em className="not-italic text-teal-600">Semua yang kamu butuhkan.</em>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* Card 1: Integrated Learning */}
            <Reveal className="lg:col-span-7 min-h-[340px] p-10 bg-ink-9 border border-ink-7 rounded-3xl hover:border-teal-100 hover:shadow-[0_16px_48px_rgba(13,148,136,.07)] hover:-translate-y-1 transition-all duration-500">
              <div className="text-[0.625rem] font-bold text-teal-600 uppercase tracking-[.12em] mb-4">Integrated Learning</div>
              <h3 className="text-2xl font-extrabold text-ink leading-[1.15] tracking-tight mb-3">Teori dan praktik,<br />berdampingan.</h3>
              <p className="text-[0.9375rem] text-ink-4 leading-relaxed">Modul pembelajaran ditampilkan tepat di sebelah canvas kerja. Baca konsep visual hierarchy, lalu langsung aplikasikan — tanpa berpindah tab.</p>
            </Reveal>

            {/* Card 2: Canvas Interaktif */}
            <Reveal delay={0.1} className="lg:col-span-5 min-h-[340px] p-10 bg-white border border-ink-7 rounded-3xl hover:border-teal-100 hover:shadow-[0_16px_48px_rgba(13,148,136,.07)] hover:-translate-y-1 transition-all duration-500">
              <div className="text-[0.625rem] font-bold text-teal-600 uppercase tracking-[.12em] mb-4">Canvas Interaktif</div>
              <h3 className="text-2xl font-extrabold text-ink leading-[1.15] tracking-tight mb-3">Eksperimen visual secara instan.</h3>
              <p className="text-[0.9375rem] text-ink-4 leading-relaxed mb-6">Coba grid layout, atur warna, geser elemen — rasakan prinsip desain melalui tangan kamu sendiri.</p>
              <div className="bg-ink-9 p-5 rounded-xl grid grid-cols-3 gap-2">
                {[
                  'bg-teal-50 border-[1.5px] border-dashed border-teal-600',
                  'bg-teal-100', 'bg-teal-600 opacity-20',
                  'bg-ink-7', 'bg-teal-600 rounded-full', 'bg-ink-8',
                ].map((cls, i) => (
                  <div key={i} className={`aspect-square rounded-lg ${cls} hover:scale-[1.08] hover:rotate-2 hover:shadow-[0_4px_16px_rgba(13,148,136,.2)] transition-all duration-300`} />
                ))}
              </div>
            </Reveal>

            {/* Card 3: Real-time Feedback */}
            <Reveal delay={0.15} className="lg:col-span-4 min-h-[300px] p-10 bg-white border border-ink-7 rounded-3xl hover:border-teal-100 hover:shadow-[0_16px_48px_rgba(13,148,136,.07)] hover:-translate-y-1 transition-all duration-500">
              <div className="text-[0.625rem] font-bold text-teal-600 uppercase tracking-[.12em] mb-4">Real-time Feedback</div>
              <h3 className="text-2xl font-extrabold text-ink leading-[1.15] tracking-tight mb-3">Feedback instan, langsung di desain.</h3>
              <p className="text-[0.9375rem] text-ink-4 leading-relaxed">Dosen memberi komentar langsung di atas elemen yang kamu buat. Tidak perlu menunggu hari.</p>
            </Reveal>

            {/* Card 4: Kolaborasi */}
            <Reveal delay={0.2} className="lg:col-span-8 min-h-[300px] p-10 bg-ink border border-ink-7 rounded-3xl hover:border-teal-100/20 hover:shadow-[0_16px_48px_rgba(13,148,136,.07)] hover:-translate-y-1 transition-all duration-500">
              <div className="text-[0.625rem] font-bold text-teal-500 uppercase tracking-[.12em] mb-4">Ruang Kolaborasi</div>
              <h3 className="text-2xl font-extrabold text-white leading-[1.15] tracking-tight mb-3">Desain bersama,<br />berkembang bersama.</h3>
              <p className="text-[0.9375rem] text-ink-5 leading-relaxed">Anotasi, komentar, dan review — semua terjadi di satu tempat. Mahasiswa dan dosen bekerja dalam satu ekosistem yang sama.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section id="process" className="py-[140px] max-lg:py-20 bg-ink-9 border-y border-ink-7">
        <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,80px)]">
          <Reveal className="mb-[72px]">
            <div className="text-[0.6875rem] font-bold text-teal-600 uppercase tracking-[.1em] mb-4">Cara Kerja</div>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-extrabold text-ink leading-[1.1] tracking-tight">Empat langkah menuju mahir.</h2>
          </Reveal>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-9 left-9 right-9 h-px bg-gradient-to-r from-teal-100 via-teal-600 to-teal-100" />
            {processSteps.map((step, i) => (
              <Reveal key={i} delay={i * 0.15} className="px-6 text-left relative">
                <div className="group relative z-[1] w-[72px] h-[72px] rounded-full bg-white border-2 border-ink-7 flex items-center justify-center mb-7 hover:bg-teal-600 hover:border-teal-600 hover:scale-110 hover:shadow-[0_8px_24px_rgba(13,148,136,.2)] transition-all duration-400">
                  <span className="text-lg font-extrabold text-ink-5 group-hover:text-white transition-colors">{step.num}</span>
                </div>
                <h3 className="text-lg font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-sm text-ink-4 leading-relaxed">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SOCIAL PROOF ═══ */}
      <section id="proof" className="py-[140px] max-lg:py-20">
        <div className="max-w-[960px] mx-auto px-[clamp(20px,4vw,80px)]">
          <Reveal>
            <blockquote className="relative text-[clamp(1.5rem,2.8vw,2.25rem)] font-medium text-ink leading-[1.45] tracking-tight mb-10 pl-6 sm:pl-10">
              <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-[3px] bg-gradient-to-b from-teal-600 to-teal-100" />
              "Sebelum NODES, saya harus buka <em className="not-italic text-teal-600">lima aplikasi berbeda</em> hanya untuk mengerjakan satu tugas UI. Sekarang, semua proses — dari baca materi sampai submit desain — <em className="not-italic text-teal-600">terjadi di satu tempat</em>. Ini game-changer."
            </blockquote>
          </Reveal>
          <Reveal delay={0.15} className="flex items-center gap-4 pl-6 sm:pl-10">
            <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm">AP</div>
            <div>
              <h4 className="text-[0.9375rem] font-bold text-ink">Andi Pratama</h4>
              <span className="text-[0.8125rem] text-ink-5">Mahasiswa Teknik Informatika ITI — Semester 5</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-[120px] max-lg:py-20 bg-ink overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)]" />
        <div className="absolute -top-[200px] -right-[100px] w-[500px] h-[500px] rounded-full bg-teal-600 blur-[160px] opacity-8 pointer-events-none" />
        <div className="relative z-[1] max-w-[680px] mx-auto px-[clamp(20px,4vw,80px)] text-center">
          <Reveal>
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold text-white leading-[1.05] tracking-tighter mb-5">
              Siap membangun,<br />bukan cuma <em className="not-italic text-teal-500">membaca</em>?
            </h2>
            <p className="text-lg text-ink-5 leading-relaxed mb-10">
              Gabung dengan 500+ mahasiswa ITI yang sudah belajar UI/UX secara interaktif. Gratis, tanpa kartu kredit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link to="/auth" className="inline-flex items-center gap-2.5 px-9 py-4 text-[0.9375rem] font-semibold text-ink bg-white rounded-[14px] hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(255,255,255,.15)] transition-all cursor-pointer">
                Mulai Sekarang <ArrowRight className="w-[18px] h-[18px]" />
              </Link>
              <a href="mailto:nodes@iti.ac.id" className="inline-flex items-center gap-2 px-7 py-4 text-[0.9375rem] font-medium text-ink-5 border-[1.5px] border-ink-3 rounded-[14px] hover:border-teal-600 hover:text-teal-500 transition-all cursor-pointer">
                Hubungi Tim Kami
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="pt-16 bg-ink border-t border-white/[.06]">
        <div className="max-w-[1280px] mx-auto px-[clamp(20px,4vw,80px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-12">
            <div>
              <Link to="/" className="text-[1.375rem] font-extrabold text-white tracking-tighter">nodes<span className="text-teal-600">.</span></Link>
              <p className="text-sm text-ink-4 leading-relaxed mt-4 max-w-[300px]">Platform e-learning UI/UX interaktif untuk mahasiswa Teknik Informatika, Institut Teknologi Indonesia.</p>
            </div>
            {[
              { title: 'Platform', links: [{ label: 'Fitur', href: '#bento' }, { label: 'Cara Kerja', href: '#process' }, { label: 'Modul', href: '/app/modul' }, { label: 'Kurikulum', href: '#process' }] },
              { title: 'Sumber Daya', links: [{ label: 'Dokumentasi', href: '#bento' }, { label: 'Tutorial', href: '#process' }, { label: 'Blog', href: '#proof' }, { label: 'FAQ', href: '#challenge' }] },
              { title: 'Kontak', links: [{ label: 'nodes@iti.ac.id', href: 'mailto:nodes@iti.ac.id' }, { label: 'Instagram', href: 'https://instagram.com/nodes.iti' }, { label: 'LinkedIn', href: 'https://linkedin.com/company/nodes-iti' }, { label: 'GitHub', href: 'https://github.com/Faza-SAPUTRA/nodes' }] },
            ].map((col, i) => (
              <div key={i}>
                <h5 className="text-[0.6875rem] font-bold text-ink-5 uppercase tracking-widest mb-5">{col.title}</h5>
                {col.links.map((link, j) => (
                  <a key={j} href={link.href} className="block text-sm text-ink-4 py-1.5 hover:text-teal-500 transition-colors cursor-pointer">{link.label}</a>
                ))}
              </div>
            ))}
          </div>
          <div className="border-t border-white/[.06] py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-ink-4">© 2026 NODES — Institut Teknologi Indonesia</p>
            <div className="flex gap-2">
              {[
                { label: 'Instagram', href: 'https://instagram.com/nodes.iti' },
                { label: 'LinkedIn', href: 'https://linkedin.com/company/nodes-iti' },
                { label: 'GitHub', href: 'https://github.com/Faza-SAPUTRA/nodes' },
              ].map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-4 hover:bg-white/[.06] hover:text-teal-500 transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {item.label === 'Instagram' && <><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></>}
                    {item.label === 'LinkedIn' && <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></>}
                    {item.label === 'GitHub' && <><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></>}
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
