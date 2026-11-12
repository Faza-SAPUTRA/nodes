import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock, Save } from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { Empty, LoadError, SkeletonBlock, Spinner, useToast } from '../components/ui';
import type { Lesson, ModuleDetail as ModuleDetailType } from '../lib/types';

type ModuleResponse = { module: ModuleDetailType };

/** Ubah markdown sederhana (heading, list, bold, italic, code) jadi elemen React. */
function renderMarkdown(body: string) {
  const lines = body.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let ordered = false;

  const inline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) parts.push(text.slice(last, match.index));
      const token = match[0];
      if (token.startsWith('**')) parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
      else if (token.startsWith('`')) parts.push(<code key={key++}>{token.slice(1, -1)}</code>);
      else parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
      last = match.index + token.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  const flush = () => {
    if (!list.length) return;
    const items = list.map((item, index) => <li key={index}>{inline(item)}</li>);
    blocks.push(ordered ? <ol key={`ol-${blocks.length}`}>{items}</ol> : <ul key={`ul-${blocks.length}`}>{items}</ul>);
    list = [];
  };

  lines.forEach((raw, index) => {
    const line = raw.trimEnd();
    if (/^##\s+/.test(line)) {
      flush();
      blocks.push(<h3 key={index}>{inline(line.replace(/^##\s+/, ''))}</h3>);
    } else if (/^\d+\.\s+/.test(line)) {
      if (!ordered) { flush(); ordered = true; }
      list.push(line.replace(/^\d+\.\s+/, ''));
    } else if (/^[-*]\s+/.test(line)) {
      if (ordered) { flush(); ordered = false; }
      list.push(line.replace(/^[-*]\s+/, ''));
    } else if (!line.trim()) {
      flush();
      ordered = false;
    } else {
      flush();
      ordered = false;
      blocks.push(<p key={index}>{inline(line)}</p>);
    }
  });
  flush();
  return blocks;
}

/** Halaman baca modul: daftar sesi, isi sesi, catatan, dan tandai selesai. */
export default function ModuleDetail() {
  const { slug = '' } = useParams();
  const toast = useToast();
  const [data, setData] = useState<ModuleDetailType | null>(null);
  const [activeId, setActiveId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api<ModuleResponse>(`/api/modules/${slug}`)
      .then((res) => {
        if (!alive) return;
        setData(res.module);
        const firstTodo = res.module.lessons.find((l) => l.status !== 'done') ?? res.module.lessons[0];
        setActiveId(firstTodo?.id ?? '');
        setNote(firstTodo?.note ?? '');
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
  }, [slug]);

  const active: Lesson | undefined = useMemo(
    () => data?.lessons.find((l) => l.id === activeId),
    [data, activeId],
  );

  const pick = (lesson: Lesson) => {
    setActiveId(lesson.id);
    setNote(lesson.note ?? '');
  };

  const toggleDone = async () => {
    if (!active || !data) return;
    const nextDone = active.status !== 'done';
    setSaving(true);
    try {
      await api('/api/progress', {
        method: 'POST',
        body: { lesson_id: active.id, done: nextDone, note },
      });
      const refreshed = await api<ModuleResponse>(`/api/modules/${slug}`);
      setData(refreshed.module);
      const updated = refreshed.module.lessons.find((l) => l.id === active.id);
      setNote(updated?.note ?? '');
      toast.success(nextDone ? 'Sesi ditandai selesai' : 'Sesi dibuka kembali', active.title);
    } catch (err) {
      toast.error('Gagal menyimpan progres', errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    if (!active) return;
    setSavingNote(true);
    try {
      await api('/api/progress', {
        method: 'POST',
        body: { lesson_id: active.id, done: active.status === 'done', note },
      });
      const refreshed = await api<ModuleResponse>(`/api/modules/${slug}`);
      setData(refreshed.module);
      toast.success('Catatan tersimpan');
    } catch (err) {
      toast.error('Gagal menyimpan catatan', errorMessage(err));
    } finally {
      setSavingNote(false);
    }
  };

  const index = data?.lessons.findIndex((l) => l.id === activeId) ?? -1;
  const nextLesson = index >= 0 ? data?.lessons[index + 1] : undefined;

  if (error) {
    return (
      <>
        <Link to="/app/modul" className="btn btn-ghost btn-sm" style={{ marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Kembali ke katalog
        </Link>
        <LoadError message={error} />
      </>
    );
  }

  return (
    <>
      <div className="row between wrapflex gap-2" style={{ marginBottom: '1rem' }}>
        <Link to="/app/modul" className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} /> Katalog modul
        </Link>
        {data ? (
          <div className="row gap-2">
            <span className="badge">{data.track}</span>
            <span className="badge">{data.level}</span>
            <span className="badge badge-teal">{data.progress}% selesai</span>
          </div>
        ) : null}
      </div>

      {loading || !data ? (
        <div className="reader">
          <div className="stack gap-2">
            <SkeletonBlock height={26} width="60%" />
            <SkeletonBlock height={12} />
            <SkeletonBlock height={12} />
            <SkeletonBlock height={12} width="80%" />
          </div>
        </div>
      ) : data.lessons.length === 0 ? (
        <Empty title="Modul ini belum punya sesi" text="Konten sedang disusun. Coba modul lain dulu." />
      ) : (
        <div className="reader">
          <section>
            <h1 className="h2">{data.title}</h1>
            <p className="lede" style={{ marginTop: '.4rem' }}>{data.subtitle}</p>
            <div className="progress" style={{ marginTop: '1rem' }}>
              <i style={{ width: `${data.progress}%` }} />
            </div>
            <p className="small muted" style={{ marginTop: '.4rem' }}>
              {data.done_count} dari {data.lesson_count} sesi selesai · estimasi {data.est_minutes} menit
            </p>

            {active ? (
              <article className="card card-pad" style={{ marginTop: '1.3rem' }}>
                <div className="row between wrapflex gap-2">
                  <div>
                    <span className="eyebrow no-rule">Sesi {active.order_index} dari {data.lesson_count}</span>
                    <h2 className="h3" style={{ marginTop: '.35rem' }}>{active.title}</h2>
                  </div>
                  <span className="row gap-1 mono muted"><Clock size={12} /> {active.minutes} menit</span>
                </div>

                <div className="prose" style={{ marginTop: '1rem' }}>{renderMarkdown(active.body)}</div>

                {active.takeaways.length ? (
                  <>
                    <div className="divider" />
                    <span className="eyebrow no-rule">Poin kunci</span>
                    <div className="takeaways" style={{ marginTop: '.5rem' }}>
                      {active.takeaways.map((point) => (
                        <span className="takeaway" key={point}>
                          <CheckCircle2 size={14} /> {point}
                        </span>
                      ))}
                    </div>
                  </>
                ) : null}

                <div className="divider" />
                <div className="field">
                  <label className="label" htmlFor="note">Catatan pribadi (opsional)</label>
                  <textarea
                    id="note"
                    className="textarea"
                    maxLength={500}
                    value={note}
                    placeholder="Tulis hal yang ingin kamu ingat dari sesi ini…"
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <span className="help">{note.length}/500 karakter</span>
                </div>

                <div className="row gap-2 wrapflex" style={{ marginTop: '1rem' }}>
                  <button type="button" className={`btn ${active.status === 'done' ? '' : 'btn-teal'}`} onClick={toggleDone} disabled={saving}>
                    {saving ? <Spinner size={14} /> : <Check size={15} />}
                    {active.status === 'done' ? 'Tandai belum selesai' : 'Tandai selesai'}
                  </button>
                  <button type="button" className="btn" onClick={saveNote} disabled={savingNote}>
                    {savingNote ? <Spinner size={14} /> : <Save size={14} />} Simpan catatan
                  </button>
                  {nextLesson ? (
                    <button type="button" className="btn btn-ghost" onClick={() => pick(nextLesson)}>
                      Sesi berikutnya <ArrowRight size={14} />
                    </button>
                  ) : null}
                </div>
              </article>
            ) : null}
          </section>

          <aside className="card card-pad">
            <span className="eyebrow no-rule">Daftar sesi</span>
            <div className="lesson-nav" style={{ marginTop: '.6rem' }}>
              {data.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  type="button"
                  aria-current={lesson.id === activeId}
                  onClick={() => pick(lesson)}
                >
                  <span className="idx">{String(lesson.order_index).padStart(2, '0')}</span>
                  <span style={{ flex: 1 }}>{lesson.title}</span>
                  {lesson.status === 'done' ? <CheckCircle2 size={14} color="var(--teal)" /> : null}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
