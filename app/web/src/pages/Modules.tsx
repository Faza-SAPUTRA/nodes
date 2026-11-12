import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, SlidersHorizontal } from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { Empty, LoadError, SkeletonBlock } from '../components/ui';
import type { ModuleSummary } from '../lib/types';

type ModulesResponse = { modules: ModuleSummary[]; tracks: string[] };

/** Katalog modul dengan pencarian dan filter jalur belajar. */
export default function Modules() {
  const [items, setItems] = useState<ModuleSummary[]>([]);
  const [tracks, setTracks] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [track, setTrack] = useState('');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api<ModulesResponse>('/api/modules')
      .then((res) => {
        if (!alive) return;
        setItems(res.modules);
        setTracks(res.tracks);
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

  // Penyaringan dilakukan di klien supaya responsif tanpa request tambahan
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((mod) => {
      if (track && mod.track !== track) return false;
      if (level && mod.level !== level) return false;
      if (!needle) return true;
      return (
        mod.title.toLowerCase().includes(needle) ||
        mod.summary.toLowerCase().includes(needle) ||
        mod.subtitle.toLowerCase().includes(needle)
      );
    });
  }, [items, query, track, level]);

  const levels = useMemo(() => Array.from(new Set(items.map((m) => m.level))), [items]);
  const done = items.filter((m) => m.progress === 100).length;

  if (error) return <LoadError message={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Katalog</span>
          <h1 className="h2" style={{ marginTop: '.5rem' }}>Modul belajar</h1>
          <p className="small muted" style={{ marginTop: '.25rem' }}>
            {loading ? 'Memuat modul…' : `${items.length} modul · ${done} selesai · mengikuti RPS UI/UX`}
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search">
          <Search size={15} />
          <input
            className="input"
            placeholder="Cari modul atau topik…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari modul"
          />
        </div>
        <button
          type="button"
          className="chip"
          aria-pressed={!track}
          onClick={() => setTrack('')}
        >
          Semua jalur
        </button>
        {tracks.map((item) => (
          <button
            key={item}
            type="button"
            className="chip"
            aria-pressed={track === item}
            onClick={() => setTrack(track === item ? '' : item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="filter-bar" style={{ marginTop: '-.6rem' }}>
        <span className="row gap-1 mono muted"><SlidersHorizontal size={12} /> tingkat</span>
        <button type="button" className="chip" aria-pressed={!level} onClick={() => setLevel('')}>Semua</button>
        {levels.map((item) => (
          <button
            key={item}
            type="button"
            className="chip"
            aria-pressed={level === item}
            onClick={() => setLevel(level === item ? '' : item)}
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mod-grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div className="mod-card" key={i}>
              <SkeletonBlock height={14} width="45%" />
              <SkeletonBlock height={10} width="90%" />
              <SkeletonBlock height={10} width="75%" />
              <SkeletonBlock height={6} />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Empty
          icon={<Search size={20} />}
          title="Tidak ada modul yang cocok"
          text="Coba kata kunci lain atau hapus filter jalur dan tingkat."
          action={
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => { setQuery(''); setTrack(''); setLevel(''); }}
            >
              Reset filter
            </button>
          }
        />
      ) : (
        <div className="mod-grid">
          {visible.map((mod) => (
            <Link className="mod-card" key={mod.id} to={`/app/modul/${mod.slug}`}>
              <div className="row between">
                <span className={`badge badge-${mod.accent === 'sky' ? 'sky' : mod.accent === 'amber' ? 'amber' : 'teal'}`}>
                  {mod.track}
                </span>
                <span className="mono muted">{mod.level}</span>
              </div>
              <h3>{mod.title}</h3>
              <p>{mod.summary}</p>
              <div className="progress">
                <i style={{ width: `${mod.progress}%` }} />
              </div>
              <div className="mod-meta">
                <span>{mod.progress === 100 ? 'Selesai' : `${mod.done_count}/${mod.lesson_count} sesi`}</span>
                <span className="row gap-1"><Clock size={11} /> {mod.est_minutes}m</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
