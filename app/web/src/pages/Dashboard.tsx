import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Flame,
  PenTool,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { api, errorMessage } from '../lib/api';
import { LoadError, SkeletonBlock } from '../components/ui';
import { relativeTime } from '../lib/format';
import type { Activity, ModuleSummary, Totals } from '../lib/types';

type ProgressResponse = {
  modules: ModuleSummary[];
  activity: Activity[];
  totals: Totals;
};

/* ---- Komponen SVG Progress Ring dengan animasi stroke-dasharray ---- */
function ProgressRing({ percent, size = 88, strokeWidth = 7 }: { percent: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  // Animasikan ring dari 0 ke target saat mount / percent berubah
  useEffect(() => {
    // Mulai dari penuh (tidak terisi) lalu transisi ke target
    const targetOffset = circumference - (percent / 100) * circumference;
    // Gunakan rAF supaya transisi CSS bisa jalan
    const raf = requestAnimationFrame(() => {
      setOffset(targetOffset);
    });
    return () => cancelAnimationFrame(raf);
  }, [percent, circumference]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)', display: 'block' }}
      aria-label={`Progres ${percent}%`}
    >
      {/* Track latar belakang */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--bg-2)"
        strokeWidth={strokeWidth}
      />
      {/* Stroke progres dengan animasi */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#0d9488"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)' }}
      />
    </svg>
  );
}

/* ---- Sapaan berdasarkan jam ---- */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Selamat Pagi';
  if (hour >= 11 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
}

/* ---- Ikon feed berdasarkan jenis aktivitas ---- */
function FeedIcon({ kind }: { kind: string }) {
  switch (kind) {
    case 'lesson':
      return <BookOpen size={13} />;
    case 'canvas':
      return <PenTool size={13} />;
    case 'collab':
      return <Users size={13} />;
    default:
      return <BookOpen size={13} />;
  }
}

/** Ringkasan belajar: lanjutkan sesi, statistik, modul, dan aktivitas. */
export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api<ProgressResponse>('/api/progress')
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((err) => {
        if (alive) setError(errorMessage(err));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  // Modul pertama yang belum selesai dijadikan ajakan "lanjutkan"
  const nextModule = useMemo(() => {
    if (!data) return null;
    return data.modules.find((m) => m.progress < 100) ?? data.modules[0] ?? null;
  }, [data]);

  // Hitung sapaan sekali saat render
  const greeting = useMemo(() => getGreeting(), []);

  if (error) {
    return <LoadError message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1 className="h2" style={{ marginTop: '.5rem' }}>
            {greeting}, {user?.name?.split(' ')[0] ?? 'desainer'}.
          </h1>
          <p className="small muted" style={{ marginTop: '.25rem' }}>
            Lanjutkan dari titik terakhir, atau mulai modul baru hari ini.
          </p>
        </div>
        <Link className="btn btn-primary" to="/app/modul">
          Jelajahi modul <ArrowRight size={15} />
        </Link>
      </div>

      <div className="dash-hero">
        <section className="dash-card dash-continue">
          {loading || !nextModule ? (
            <div className="stack gap-2">
              <SkeletonBlock height={12} width="30%" />
              <SkeletonBlock height={26} width="70%" />
              <SkeletonBlock height={14} width="85%" />
            </div>
          ) : (
            <>
              <span className="eyebrow no-rule" style={{ color: 'rgba(255,255,255,.55)' }}>
                <Sparkles size={12} /> Lanjutkan belajar
              </span>
              <h2>{nextModule.title}</h2>
              <p>{nextModule.summary}</p>
              <div className="row gap-2 wrapflex" style={{ marginTop: '1.2rem' }}>
                <Link className="btn btn-primary" to={`/app/modul/${nextModule.slug}`}>
                  Lanjutkan <ArrowRight size={15} />
                </Link>
                <span className="badge" style={{ background: 'rgba(255,255,255,.12)', borderColor: 'transparent', color: 'rgba(255,255,255,.8)' }}>
                  {nextModule.done_count}/{nextModule.lesson_count} sesi
                </span>
              </div>
            </>
          )}
        </section>

        {/* Statistik belajar dengan SVG progress ring */}
        <section className="dash-stats" aria-label="Statistik belajar">
          {/* Sel pertama: progress ring menggantikan angka sederhana */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', gridColumn: 'span 2', justifyContent: 'center', padding: '1.4rem 1.2rem' }}>
            {loading ? (
              <SkeletonBlock height={88} width="88px" />
            ) : (
              <div style={{ position: 'relative', width: 88, height: 88 }}>
                <ProgressRing percent={data?.totals.progress ?? 0} size={88} strokeWidth={7} />
                {/* Label persentase di tengah ring */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1 }}>
                    {data?.totals.progress ?? 0}%
                  </span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.15rem' }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', fontWeight: 400, color: 'var(--ink)', lineHeight: 1 }}>
                {loading ? '—' : data?.totals.done ?? 0}
              </span>
              <span style={{ fontSize: '.76rem', color: 'var(--muted)' }}>sesi selesai</span>
            </div>
          </div>
          <div>
            <strong>{loading ? '—' : data?.totals.lessons ?? 0}</strong>
            <span>sesi tersedia</span>
          </div>
          <div>
            <strong>{loading ? '—' : data?.totals.minutes ?? 0}</strong>
            <span>menit materi</span>
          </div>
        </section>
      </div>

      <section style={{ marginTop: '1.6rem' }}>
        <div className="row between wrapflex gap-2" style={{ marginBottom: '.9rem' }}>
          <h2 className="h3">Modul dalam perjalananmu</h2>
          <Link to="/app/modul" className="small" style={{ color: 'var(--teal)', fontWeight: 600 }}>
            Lihat semua
          </Link>
        </div>
        <div className="mod-grid">
          {loading
            ? [0, 1, 2].map((i) => (
                <div className="mod-card" key={i}>
                  <SkeletonBlock height={14} width="60%" />
                  <SkeletonBlock height={10} width="100%" />
                  <SkeletonBlock height={10} width="80%" />
                </div>
              ))
            : (data?.modules ?? []).slice(0, 6).map((mod) => (
                <Link className="mod-card" key={mod.id} to={`/app/modul/${mod.slug}`}>
                  <div className="row between">
                    <span className="badge badge-teal">{mod.track}</span>
                    <span className="mono muted">{mod.progress}%</span>
                  </div>
                  <h3>{mod.title}</h3>
                  <p>{mod.summary}</p>
                  <div className="progress">
                    <i style={{ width: `${mod.progress}%` }} />
                  </div>
                  <div className="mod-meta">
                    <span>{mod.done_count}/{mod.lesson_count} sesi</span>
                    <span className="row gap-1">
                      <Clock size={11} /> {mod.est_minutes}m
                    </span>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      <div className="dash-hero" style={{ marginTop: '1.6rem' }}>
        <section className="card card-pad">
          <div className="row between" style={{ marginBottom: '.4rem' }}>
            <h2 className="h3">Aktivitas terakhir</h2>
            <Flame size={15} color="var(--teal)" />
          </div>
          {loading ? (
            <div className="stack gap-2" style={{ marginTop: '.8rem' }}>
              <SkeletonBlock height={12} />
              <SkeletonBlock height={12} />
              <SkeletonBlock height={12} width="70%" />
            </div>
          ) : data?.activity.length ? (
            <div className="feed">
              {data.activity.map((item) => (
                <div className="feed-row" key={item.id}>
                  <span className="feed-dot">
                    <FeedIcon kind={item.kind} />
                  </span>
                  <div>
                    <p>{item.message}</p>
                    <time>{relativeTime(item.created_at)}</time>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="small muted" style={{ marginTop: '.7rem' }}>
              Belum ada aktivitas. Selesaikan satu sesi untuk memulai catatan.
            </p>
          )}
        </section>

        <section className="card card-pad">
          <h2 className="h3" style={{ marginBottom: '.7rem' }}>Aksi cepat</h2>
          <div className="stack gap-2">
            <Link className="btn btn-block" to="/app/kanvas">
              <PenTool size={15} /> Buka kanvas praktik
            </Link>
            <Link className="btn btn-block" to="/app/kolaborasi">
              <Users size={15} /> Ruang kolaborasi
            </Link>
            <Link className="btn btn-block" to="/app/profil">
              <BookOpen size={15} /> Lihat progres lengkap
            </Link>
          </div>
          <div className="divider" />
          <p className="small muted">
            Tips: tandai sesi selesai setelah praktik di kanvas — progres dan aktivitas tercatat otomatis.
          </p>
        </section>
      </div>
    </>
  );
}
