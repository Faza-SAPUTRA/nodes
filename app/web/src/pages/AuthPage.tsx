import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Brand } from '../components/Brand';
import { Field, Spinner, useToast } from '../components/ui';
import { useAuth } from '../lib/auth';
import { ApiFailure, errorMessage } from '../lib/api';

/** Skor kekuatan password sederhana untuk umpan balik langsung. */
function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

const SCORE_LABEL = ['Terlalu lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'];
const SCORE_COLOR = ['var(--danger)', 'var(--danger)', 'var(--amber)', 'var(--teal)', 'var(--teal)'];

/** Halaman masuk dan daftar dalam satu komponen. */
export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/app';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState('');

  const score = useMemo(() => passwordScore(password), [password]);

  // Validasi sisi klien: cermin aturan server, bukan pengganti validasi server
  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (isRegister && name.trim().length < 2) next.name = 'Nama minimal 2 karakter';
    if (!email.trim()) next.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.trim())) next.email = 'Format email tidak valid';
    if (!password) next.password = 'Password wajib diisi';
    else if (isRegister && password.length < 8) next.password = 'Password minimal 8 karakter';
    else if (isRegister && !(/[A-Za-z]/.test(password) && /\d/.test(password)))
      next.password = 'Password harus memuat huruf dan angka';
    return next;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBanner('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    try {
      if (isRegister) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password, remember);
      toast.success(isRegister ? 'Akun dibuat' : 'Berhasil masuk', 'Selamat datang di NODES.');
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiFailure && Object.keys(err.fields).length) {
        setErrors(err.fields);
      }
      setBanner(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = () => {
    setEmail('demo@nodes.id');
    setPassword('Nodes#2026');
    setErrors({});
    setBanner('');
  };

  return (
    <div className="auth page">
      <aside className="auth-art">
        <div className="dots" aria-hidden="true" />
        <Brand to="/" />
        <div>
          <h2>Setiap sesi berakhir dengan sesuatu yang kamu bangun.</h2>
          <p className="quote" style={{ marginTop: '1rem' }}>
            Materi, kanvas, dan review dalam satu alur. Progres tersimpan, komentar menempel di
            desain, dan setiap keputusan punya catatan.
          </p>
        </div>
        <div className="row gap-2 small" style={{ color: 'rgba(255,255,255,.55)', position: 'relative' }}>
          <ShieldCheck size={15} />
          Password di-hash di server. Token sesi ditandatangani.
        </div>
      </aside>

      <main className="auth-panel">
        <div className="auth-card">
          <div className="row gap-1" style={{ marginBottom: '1.4rem' }}>
            <span className="eyebrow no-rule">{isRegister ? 'Akun baru' : 'Selamat datang kembali'}</span>
          </div>
          <h1 className="h2" style={{ marginBottom: '.35rem' }}>
            {isRegister ? 'Buat akun NODES' : 'Masuk ke ekosistem'}
          </h1>
          <p className="small muted" style={{ marginBottom: '1.5rem' }}>
            {isRegister
              ? 'Gunakan email aktif. Kamu bisa langsung mulai dari modul pertama.'
              : 'Lanjutkan modul, kanvas, dan ruang review yang sudah kamu buka.'}
          </p>

          {!isRegister ? (
            <div className="demo-hint" style={{ marginBottom: '1rem' }}>
              <AlertTriangle size={14} style={{ flex: 'none', marginTop: 2 }} />
              <div>
                Akun demo: <b>demo@nodes.id</b> / <b>Nodes#2026</b>.{' '}
                <button type="button" onClick={fillDemo} style={{ textDecoration: 'underline', fontWeight: 600 }}>
                  Isi otomatis
                </button>
              </div>
            </div>
          ) : null}

          {banner ? (
            <div className="banner banner-error" role="alert" style={{ marginBottom: '1rem' }}>
              <AlertTriangle size={15} style={{ flex: 'none', marginTop: 2 }} />
              <span>{banner}</span>
            </div>
          ) : null}

          <form className="stack gap-3" onSubmit={submit} noValidate>
            {isRegister ? (
              <Field label="Nama lengkap" htmlFor="name" error={errors.name}>
                <input
                  id="name"
                  className="input"
                  value={name}
                  autoComplete="name"
                  placeholder="Nama sesuai KTM"
                  aria-invalid={Boolean(errors.name)}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
            ) : null}

            <Field label="Email" htmlFor="email" error={errors.email}>
              <input
                id="email"
                className="input"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@kampus.ac.id"
                value={email}
                aria-invalid={Boolean(errors.email)}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              error={errors.password}
              hint={isRegister ? 'Minimal 8 karakter, memuat huruf dan angka.' : undefined}
            >
              <div className="input-group">
                <input
                  id="password"
                  className="input"
                  type={show ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={password}
                  aria-invalid={Boolean(errors.password)}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span className="trail">
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </span>
              </div>
            </Field>

            {isRegister && password ? (
              <div>
                <div className="pw-meter" aria-hidden="true">
                  {[0, 1, 2, 3].map((index) => (
                    <i key={index} style={{ background: index < score ? SCORE_COLOR[score] : 'var(--line)' }} />
                  ))}
                </div>
                <span className="help" style={{ color: SCORE_COLOR[score] }}>{SCORE_LABEL[score]}</span>
              </div>
            ) : null}

            {!isRegister ? (
              <label className="checkbox">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Ingat sesi di perangkat ini
              </label>
            ) : null}

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? <Spinner size={16} /> : null}
              {isRegister ? 'Buat akun' : 'Masuk'}
              {!busy ? <ArrowRight size={15} /> : null}
            </button>
          </form>

          <p className="small muted" style={{ marginTop: '1.2rem', textAlign: 'center' }}>
            {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
            <Link to={isRegister ? '/masuk' : '/daftar'} style={{ color: 'var(--teal)', fontWeight: 600 }}>
              {isRegister ? 'Masuk di sini' : 'Daftar sekarang'}
            </Link>
          </p>
          <p className="small" style={{ marginTop: '.6rem', textAlign: 'center' }}>
            <Link to="/" className="muted">← Kembali ke beranda</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
