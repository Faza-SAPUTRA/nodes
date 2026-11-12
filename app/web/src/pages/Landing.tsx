import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Layers,
  MousePointerClick,
  PenTool,
  Users,
} from 'lucide-react';
import { Brand } from '../components/Brand';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Modul terstruktur dari RPS',
    text: 'Dua belas modul mengikuti rencana pembelajaran: fondasi, proses, riset, desain, dan evaluasi. Setiap sesi punya ringkasan, isi, dan poin kunci.',
    wide: true,
  },
  {
    icon: PenTool,
    title: 'Kanvas praktik langsung',
    text: 'Susun layer, ubah properti, dan simpan proyek ke server tanpa pindah tab.',
  },
  {
    icon: Users,
    title: 'Review kolaboratif',
    text: 'Komentar menempel di titik kanvas, voting versi desain, dan obrolan ruang review.',
  },
  {
    icon: BarChart3,
    title: 'Progres terukur',
    text: 'Setiap sesi yang selesai tercatat: progres per modul, heatmap aktivitas, dan riwayat terbaru.',
  },
];

const STEPS = [
  { k: '01', title: 'Daftar', text: 'Buat akun dengan email kampus, langsung masuk ke dashboard.' },
  { k: '02', title: 'Ikuti modul', text: 'Baca sesi, tandai selesai, dan simpan catatan pribadi per sesi.' },
  { k: '03', title: 'Praktik', text: 'Buka kanvas, susun layer, simpan proyek ke server dengan validasi ukuran.' },
  { k: '04', title: 'Review', text: 'Bagikan ruang review, kumpulkan komentar dan voting dari tim.' },
];

const MARQUEE = [
  'UI/UX Design',
  'Interaksi Manusia Komputer',
  'Design System',
  'UX Research',
  'Usability Testing',
  'Prototyping',
  'Arsitektur Informasi',
];

/* Data counter untuk hero-meta */
const COUNTERS = [
  { target: 12, label: 'modul terstruktur' },
  { target: 36, label: 'sesi belajar' },
  { target: 3, label: 'alat praktik' },
];

/* ================================================================
   Partikel — struktur data per partikel
   ================================================================ */
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/** Inisialisasi partikel di area canvas */
function createParticles(w: number, h: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.8,
  }));
}

/* ================================================================
   Hook: useAnimatedCounter
   Menghitung angka dari 0 ke target saat elemen terlihat di viewport
   ================================================================ */
function useAnimatedCounter(target: number, duration = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Jika pengguna memilih reduced motion, langsung set nilai akhir
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Easing: ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

/** Komponen counter individual */
function AnimatedCounter({ target, label }: { target: number; label: string }) {
  const { value, ref } = useAnimatedCounter(target);
  return (
    <div>
      <strong ref={ref as React.RefObject<HTMLElement>}>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

/** Halaman publik: menjelaskan produk dan mengarahkan ke pendaftaran. */
export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafIdRef = useRef(0);

  /* --- Cursor state --- */
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: -100, y: -100 });
  const cursorTarget = useRef({ x: -100, y: -100 });
  const cursorVisible = useRef(false);
  const cursorHover = useRef(false);
  const cursorRafRef = useRef(0);
  const isTouchDevice = useRef(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Animasi muncul saat elemen masuk viewport (IntersectionObserver, tanpa library)
  useEffect(() => {
    const nodes = rootRef.current?.querySelectorAll<HTMLElement>('.reveal');
    if (!nodes?.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '-60px 0px -80px 0px', threshold: 0.1 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  /* ================================================================
     Partikel canvas di hero section
     ~50 titik yang terhubung garis saat berdekatan, tolak dari mouse
     ================================================================ */
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.offsetWidth;
      const h = parent.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Buat ulang partikel saat resize
      particlesRef.current = createParticles(w, h, 50);
    };

    resize();
    window.addEventListener('resize', resize);

    // Deteksi tema (dark/light) untuk warna partikel
    const getTealColor = (alpha: number) => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      return isDark ? `rgba(45, 212, 191, ${alpha})` : `rgba(13, 148, 136, ${alpha})`;
    };

    const CONNECT_DIST = 140;
    const REPEL_DIST = 120;
    const REPEL_FORCE = 0.06;

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Tolak dari kursor mouse
        const dxm = p.x - mx;
        const dym = p.y - my;
        const distMouse = Math.sqrt(dxm * dxm + dym * dym);
        if (distMouse < REPEL_DIST && distMouse > 0) {
          const force = (REPEL_DIST - distMouse) / REPEL_DIST * REPEL_FORCE;
          p.vx += (dxm / distMouse) * force;
          p.vy += (dym / distMouse) * force;
        }

        // Update posisi
        p.x += p.vx;
        p.y += p.vy;

        // Redaman kecepatan agar tidak terlalu cepat
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Batas tepi — pantulkan
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > h) { p.y = h; p.vy *= -1; }

        // Gambar titik partikel
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = getTealColor(0.4);
        ctx.fill();

        // Gambar garis koneksi ke partikel berdekatan
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const opacity = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = getTealColor(opacity);
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(draw);
    };

    rafIdRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    const cleanup = initCanvas();
    return () => cleanup?.();
  }, [initCanvas]);

  /* Handler mouse untuk partikel — relatif terhadap hero section */
  const handleHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleHeroMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  /* ================================================================
     Custom cursor — dot 12px + ring 36px, lag pada ring
     Hanya di desktop (sembunyikan di perangkat sentuh)
     ================================================================ */
  useEffect(() => {
    // Deteksi perangkat sentuh
    const checkTouch = () => {
      isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };
    checkTouch();

    if (isTouchDevice.current) return;

    // Pastikan cursor tidak terlihat sebelum mouse bergerak
    if (cursorDotRef.current) cursorDotRef.current.style.opacity = '0';
    if (cursorRingRef.current) cursorRingRef.current.style.opacity = '0';

    const onMouseMove = (e: MouseEvent) => {
      cursorTarget.current = { x: e.clientX, y: e.clientY };
      if (!cursorVisible.current) {
        cursorVisible.current = true;
        cursorPos.current = { x: e.clientX, y: e.clientY };
        if (cursorDotRef.current) cursorDotRef.current.style.opacity = '1';
        if (cursorRingRef.current) cursorRingRef.current.style.opacity = '1';
      }
    };

    const onMouseLeave = () => {
      cursorVisible.current = false;
      if (cursorDotRef.current) cursorDotRef.current.style.opacity = '0';
      if (cursorRingRef.current) cursorRingRef.current.style.opacity = '0';
    };

    // Deteksi hover pada elemen interaktif (tombol, link)
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], .btn')) {
        cursorHover.current = true;
      }
    };
    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], .btn')) {
        cursorHover.current = false;
      }
    };

    // Animasi cursor dengan requestAnimationFrame — ring mengejar dot dengan lag
    const animateCursor = () => {
      const lerp = 0.15;
      cursorPos.current.x += (cursorTarget.current.x - cursorPos.current.x) * lerp;
      cursorPos.current.y += (cursorTarget.current.y - cursorPos.current.y) * lerp;

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${cursorTarget.current.x - 6}px, ${cursorTarget.current.y - 6}px)`;
      }
      if (cursorRingRef.current) {
        const size = cursorHover.current ? 52 : 36;
        const offset = size / 2;
        cursorRingRef.current.style.transform = `translate(${cursorPos.current.x - offset}px, ${cursorPos.current.y - offset}px)`;
        cursorRingRef.current.style.width = `${size}px`;
        cursorRingRef.current.style.height = `${size}px`;
      }

      cursorRafRef.current = requestAnimationFrame(animateCursor);
    };
    cursorRafRef.current = requestAnimationFrame(animateCursor);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      cancelAnimationFrame(cursorRafRef.current);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <div className="landing page" ref={rootRef}>
      {/* Custom cursor — hanya muncul di desktop */}
      <div
        ref={cursorDotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#0D9488',
          pointerEvents: 'none',
          zIndex: 9999,
          mixBlendMode: 'difference',
          opacity: 0,
          transition: 'opacity .3s',
          willChange: 'transform',
        }}
      />
      <div
        ref={cursorRingRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '1.5px solid #0D9488',
          pointerEvents: 'none',
          zIndex: 9998,
          mixBlendMode: 'difference',
          opacity: 0,
          transition: 'width .25s cubic-bezier(.22,1,.36,1), height .25s cubic-bezier(.22,1,.36,1), opacity .3s',
          willChange: 'transform, width, height',
        }}
      />

      <header className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap inner">
          <Brand to="/" />
          <nav className="nav-links" aria-label="Navigasi halaman">
            <a href="#masalah">Masalah</a>
            <a href="#fitur">Fitur</a>
            <a href="#cara">Cara kerja</a>
          </nav>
          <div className="row gap-2">
            <Link className="btn btn-ghost btn-sm" to="/masuk">Masuk</Link>
            <Link className="btn btn-primary btn-sm" to="/daftar">
              Mulai belajar <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <section
        className="hero"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Canvas partikel di belakang hero */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div className="hero-grid" aria-hidden="true" />
        <div className="wrap hero-inner" style={{ position: 'relative', zIndex: 1 }}>
          <div>
            <span className="eyebrow reveal">Proyek akhir Interaksi Manusia Komputer</span>
            <h1 className="reveal reveal-d1" style={{ marginTop: '.9rem' }}>
              Belajar desain dengan <em>membangun</em>, bukan menghafal slide.
            </h1>
            <p className="lede reveal reveal-d2">
              NODES menyatukan materi terstruktur, kanvas praktik, dan review kolaboratif dalam satu
              platform. Setiap sesi berakhir dengan sesuatu yang benar-benar kamu buat.
            </p>
            <div className="hero-cta reveal reveal-d3">
              <Link className="btn btn-primary" to="/daftar">
                Mulai belajar <ArrowRight size={15} />
              </Link>
              <Link className="btn" to="/masuk">
                Masuk ke akun
              </Link>
            </div>
            {/* Counter animasi — angka naik dari 0 saat terlihat */}
            <div className="hero-meta reveal reveal-d3">
              {COUNTERS.map((c) => (
                <AnimatedCounter key={c.label} target={c.target} label={c.label} />
              ))}
            </div>
          </div>

          <div className="hero-stage reveal reveal-d2">
            {/* Glassmorphism pada stage card */}
            <div
              className="stage"
              style={{
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            >
              <div className="stage-bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>nodes — hero / desktop</span>
              </div>
              <div className="stage-body">
                <div className="stage-el stage-hero">
                  <b>Belajar desain dengan membangun.</b>
                  <u />
                  <u style={{ width: '42%' }} />
                </div>
                <div className="stage-el stage-btn" />
                <div className="stage-el stage-card" />
                <div className="stage-grid">
                  <div />
                  <div />
                  <div />
                </div>
                <div className="stage-cursor" style={{ left: '46%', top: '38%' }}>
                  <MousePointerClick size={18} />
                  <span>reviewer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="section" id="masalah">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Masalah</span>
              <h2 className="h2" style={{ marginTop: '.7rem' }}>
                E-learning konvensional tidak dirancang untuk calon desainer.
              </h2>
            </div>
            <p className="small muted" style={{ maxWidth: '30ch' }}>
              Tiga keluhan yang muncul paling sering saat mata kuliah desain dipindahkan ke platform
              belajar biasa.
            </p>
          </div>
          <div className="feature-grid">
            <article className="feature reveal">
              <div className="feature-ico"><BookOpen size={17} /></div>
              <span className="num">01</span>
              <h3>Teks statis, nol simulasi</h3>
              <p>Materi dibaca, lalu dilupakan. Tidak ada tempat untuk mencoba keputusan desain secara langsung.</p>
            </article>
            <article className="feature reveal reveal-d1">
              <div className="feature-ico"><Layers size={17} /></div>
              <span className="num">02</span>
              <h3>Tools terfragmentasi</h3>
              <p>Slide di satu tempat, tugas di tempat lain, komentar dosen di grup chat. Konteks hilang di tengah jalan.</p>
            </article>
            <article className="feature reveal reveal-d2">
              <div className="feature-ico"><Users size={17} /></div>
              <span className="num">03</span>
              <h3>Feedback yang terlambat</h3>
              <p>Revisi baru datang setelah nilai keluar, saat kesempatan belajar dari kesalahan sudah lewat.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="fitur" style={{ background: 'var(--surface)', borderBlock: '1px solid var(--line)' }}>
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Fitur</span>
              <h2 className="h2" style={{ marginTop: '.7rem' }}>
                Satu platform, dari teori sampai review.
              </h2>
            </div>
            <p className="small muted" style={{ maxWidth: '30ch' }}>
              Semua fitur bekerja dengan data nyata di server, bukan animasi mockup.
            </p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((item, index) => (
              <article
                key={item.title}
                className={`feature reveal${item.wide ? ' feature-wide' : ''}${index ? ` reveal-d${Math.min(index, 3)}` : ''}`}
              >
                <div className="feature-ico"><item.icon size={17} /></div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="cara">
        <div className="wrap">
          <div className="section-head reveal">
            <div>
              <span className="eyebrow">Cara kerja</span>
              <h2 className="h2" style={{ marginTop: '.7rem' }}>
                Empat langkah menuju mahir.
              </h2>
            </div>
          </div>
          <div className="steps reveal">
            {STEPS.map((step) => (
              <div className="step" key={step.k}>
                <span className="k">{step.k}</span>
                <h4>{step.title}</h4>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 'clamp(3.5rem, 7vw, 6rem)' }}>
        <div className="cta-band reveal">
          <div className="cta-orb" aria-hidden="true" />
          <div style={{ position: 'relative' }}>
            <span className="eyebrow no-rule" style={{ color: 'rgba(255,255,255,.6)' }}>
              Siap mulai
            </span>
            <h2 style={{ marginTop: '.8rem' }}>Siap membangun portofolio, bukan sekadar catatan?</h2>
            <p>Daftar sekali, lanjutkan dari mana saja. Semua progres tersimpan di akunmu.</p>
            <div className="row gap-2 wrapflex" style={{ marginTop: '1.4rem' }}>
              <Link className="btn btn-primary" to="/daftar">
                Buat akun gratis <ArrowRight size={15} />
              </Link>
              <Link className="btn btn-ghost" to="/masuk">
                Sudah punya akun
              </Link>
            </div>
            <div className="row gap-3 wrapflex" style={{ marginTop: '1.6rem', fontSize: '.78rem', color: 'rgba(255,255,255,.55)' }}>
              <span className="row gap-1"><CheckCircle2 size={13} /> Tanpa biaya</span>
              <span className="row gap-1"><CheckCircle2 size={13} /> Data tersimpan lokal</span>
              <span className="row gap-1"><CheckCircle2 size={13} /> Bisa dipakai offline-setelah-dibuka</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-grid">
          <div>
            <Brand to="/" />
            <p style={{ marginTop: '.7rem', maxWidth: '38ch' }}>
              Platform e-learning UI/UX untuk mata kuliah Interaksi Manusia Komputer — Teknik
              Informatika.
            </p>
          </div>
          <div className="row gap-4 wrapflex" style={{ alignItems: 'flex-start' }}>
            <div className="stack gap-1">
              <span className="mono muted">Produk</span>
              <a href="#fitur" className="small">Fitur</a>
              <a href="#cara" className="small">Cara kerja</a>
            </div>
            <div className="stack gap-1">
              <span className="mono muted">Akun</span>
              <Link to="/masuk" className="small">Masuk</Link>
              <Link to="/daftar" className="small">Daftar</Link>
            </div>
          </div>
        </div>
        <div className="wrap" style={{ marginTop: '2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--line)' }}>
          <p>© {new Date().getFullYear()} NODES — "Belajar desain bukan cuma membaca, tapi membangun."</p>
        </div>
      </footer>
    </div>
  );
}
