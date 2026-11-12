import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Copy,
  Layers as LayersIcon,
  MousePointer2,
  Plus,
  Redo2,
  Save,
  Trash2,
  Type as TypeIcon,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { Empty, LoadError, Modal, SkeletonBlock, Spinner, useToast } from '../components/ui';
import type { CanvasDoc, Layer, Project, ProjectMeta } from '../lib/types';
import { clamp } from '../lib/format';

const DEFAULT_DOC: CanvasDoc = {
  version: 1,
  frame: { width: 1280, height: 800, label: 'Frame baru' },
  layers: [],
};

const PALETTE = ['#0d9488', '#0c1116', '#b45309', '#0369a1', '#b42318', '#ffffff'];

/** Kanvas praktik: tambah layer, geser, ubah properti, simpan ke server. */
export default function CanvasPage() {
  const toast = useToast();
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [doc, setDoc] = useState<CanvasDoc>(DEFAULT_DOC);
  const [selected, setSelected] = useState<string>('');
  const [zoom, setZoom] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [nameModal, setNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');

  const history = useRef<CanvasDoc[]>([]);
  const future = useRef<CanvasDoc[]>([]);
  const [histLen, setHistLen] = useState(0);
  const [futLen, setFutLen] = useState(0);
  const dragRef = useRef<{ id: string; startX: number; startY: number; ox: number; oy: number; snapshotTaken: boolean } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api<{ projects: ProjectMeta[] }>('/api/projects')
      .then(async (res) => {
        if (!alive) return;
        setProjects(res.projects);
        if (res.projects.length) {
          const first = await api<{ project: Project }>(`/api/projects/${res.projects[0].id}`);
          if (!alive) return;
          setActiveId(first.project.id);
          setDoc(first.project.data ?? DEFAULT_DOC);
        }
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

  const openProject = async (id: string) => {
    if (dirty && !window.confirm('Perubahan belum disimpan. Tetap pindah proyek?')) return;
    try {
      const res = await api<{ project: Project }>(`/api/projects/${id}`);
      setActiveId(id);
      setDoc(res.project.data ?? DEFAULT_DOC);
      setSelected('');
      setDirty(false);
      history.current = [];
      future.current = [];
    } catch (err) {
      toast.error('Gagal membuka proyek', errorMessage(err));
    }
  };

  /** Terapkan perubahan dengan menyimpan snapshot untuk undo. */
  const commit = useCallback((updater: (prev: CanvasDoc) => CanvasDoc) => {
    setDoc((prev) => {
      history.current = [...history.current.slice(-24), prev];
      future.current = [];
      setHistLen(history.current.length);
      setFutLen(0);
      return updater(prev);
    });
    setDirty(true);
  }, []);

  const undo = () => {
    const previous = history.current.pop();
    if (!previous) return;
    setDoc((current) => {
      future.current = [...future.current, current];
      setHistLen(history.current.length);
      setFutLen(future.current.length);
      return previous;
    });
    setDirty(true);
  };

  const redo = () => {
    const next = future.current.pop();
    if (!next) return;
    setDoc((current) => {
      history.current = [...history.current, current];
      setHistLen(history.current.length);
      setFutLen(future.current.length);
      return next;
    });
    setDirty(true);
  };

  // Pintasan keyboard: Ctrl+Z (undo), Ctrl+Y / Ctrl+Shift+Z (redo), Del (hapus layer)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { if (selected) { e.preventDefault(); removeLayer(); } }
      else if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); duplicateLayer(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  };

  const activeLayer = useMemo(() => doc.layers.find((l) => l.id === selected), [doc, selected]);

  const addLayer = (type: Layer['type']) => {
    const id = `L${Date.now().toString(36)}`;
    const base: Layer =
      type === 'text'
        ? { id, type, name: 'Teks baru', x: 64, y: 64, w: 320, h: 72, text: 'Judul baru', size: 32, weight: 600, color: '#0c1116' }
        : type === 'button'
          ? { id, type, name: 'Tombol baru', x: 64, y: 180, w: 180, h: 48, text: 'Klik', fill: '#0d9488', radius: 8 }
          : { id, type, name: 'Bentuk baru', x: 64, y: 64, w: 240, h: 160, fill: '#e6f6f3', radius: 8 };
    commit((prev) => ({ ...prev, layers: [...prev.layers, base] }));
    setSelected(id);
  };

  const updateLayer = (patchData: Partial<Layer>) => {
    if (!activeLayer) return;
    commit((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => (l.id === activeLayer.id ? { ...l, ...patchData } : l)),
    }));
  };

  const removeLayer = () => {
    if (!activeLayer) return;
    commit((prev) => ({ ...prev, layers: prev.layers.filter((l) => l.id !== activeLayer.id) }));
    setSelected('');
  };

  const duplicateLayer = () => {
    if (!activeLayer) return;
    const copy: Layer = { ...activeLayer, id: `L${Date.now().toString(36)}`, x: activeLayer.x + 24, y: activeLayer.y + 24, name: `${activeLayer.name} (salinan)` };
    commit((prev) => ({ ...prev, layers: [...prev.layers, copy] }));
    setSelected(copy.id);
  };

  // Drag layer di dalam frame; koordinat dihitung ulang sesuai skala zoom
  const onPointerDown = (event: React.PointerEvent, layer: Layer) => {
    event.stopPropagation();
    setSelected(layer.id);
    // Simpan snapshot sebelum drag dimulai agar bisa di-undo
    dragRef.current = { id: layer.id, startX: event.clientX, startY: event.clientY, ox: layer.x, oy: layer.y, snapshotTaken: false };
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    // Ambil snapshot undo hanya sekali per operasi drag
    if (!drag.snapshotTaken) {
      setDoc((prev) => {
        history.current = [...history.current.slice(-24), prev];
        future.current = [];
        setHistLen(history.current.length);
        setFutLen(0);
        return prev;
      });
      drag.snapshotTaken = true;
    }
    const dx = (event.clientX - drag.startX) / zoom;
    const dy = (event.clientY - drag.startY) / zoom;
    setDoc((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === drag.id
          ? { ...l, x: Math.round(clamp(drag.ox + dx, -l.w, prev.frame.width)), y: Math.round(clamp(drag.oy + dy, -l.h, prev.frame.height)) }
          : l,
      ),
    }));
    setDirty(true);
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const save = async () => {
    if (!activeId) return;
    setSaving(true);
    try {
      await api(`/api/projects/${activeId}`, { method: 'PATCH', body: { data: doc } });
      setDirty(false);
      toast.success('Kanvas tersimpan', 'Isi frame tersimpan di server.');
    } catch (err) {
      toast.error('Gagal menyimpan kanvas', errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const createProject = async () => {
    const name = newName.trim();
    if (name.length < 2) {
      setNameError('Nama proyek minimal 2 karakter');
      return;
    }
    try {
      const res = await api<{ project: Project }>('/api/projects', {
        method: 'POST',
        body: { name, kind: 'canvas', data: { ...DEFAULT_DOC, frame: { ...DEFAULT_DOC.frame, label: name } } },
      });
      setProjects((prev) => [{ ...res.project, data: undefined } as unknown as ProjectMeta, ...prev]);
      setActiveId(res.project.id);
      setDoc(res.project.data);
      setDirty(false);
      setNameModal(false);
      setNewName('');
      setNameError('');
      toast.success('Proyek dibuat', name);
    } catch (err) {
      setNameError(errorMessage(err));
    }
  };

  if (error) return <LoadError message={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Praktik</span>
          <h1 className="h2" style={{ marginTop: '.5rem' }}>Kanvas</h1>
          <p className="small muted" style={{ marginTop: '.25rem' }}>
            Susun layer, ubah properti, lalu simpan. Batas payload 512 KB per proyek.
          </p>
        </div>
        <div className="row gap-2 wrapflex">
          <button type="button" className="btn btn-sm" onClick={() => setNameModal(true)}>
            <Plus size={14} /> Proyek baru
          </button>
          <button type="button" className="btn btn-teal btn-sm" onClick={save} disabled={saving || !activeId || !dirty}>
            {saving ? <Spinner size={14} /> : <Save size={14} />} Simpan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="canvas-shell" style={{ display: 'grid', placeItems: 'center' }}>
          <SkeletonBlock height={20} width="40%" />
        </div>
      ) : projects.length === 0 ? (
        <Empty
          icon={<LayersIcon size={20} />}
          title="Belum ada proyek kanvas"
          text="Buat proyek pertama untuk mulai menyusun layer."
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setNameModal(true)}>
              <Plus size={14} /> Buat proyek
            </button>
          }
        />
      ) : (
        <div className="canvas-shell">
          <aside className="canvas-panel">
            <div className="canvas-panel-head">
              <span className="mono">Proyek</span>
              <span className="mono">{projects.length}</span>
            </div>
            <div className="canvas-panel-body">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className="layer-row"
                  aria-current={project.id === activeId}
                  onClick={() => openProject(project.id)}
                >
                  <LayersIcon size={13} />
                  <span>{project.name}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="canvas-panel" style={{ minWidth: 0 }}>
            <div className="canvas-panel-head">
              <div className="tool-bar">
                <button type="button" className="tool-btn" onClick={() => addLayer('rect')} aria-label="Tambah bentuk" title="Tambah bentuk">
                  <Plus size={15} />
                </button>
                <button type="button" className="tool-btn" onClick={() => addLayer('text')} aria-label="Tambah teks" title="Tambah teks">
                  <TypeIcon size={15} />
                </button>
                <button type="button" className="tool-btn" onClick={() => addLayer('button')} aria-label="Tambah tombol" title="Tambah tombol">
                  <MousePointer2 size={15} />
                </button>
                <span style={{ width: 1, height: 18, background: 'var(--line)' }} />
                <button type="button" className="tool-btn" onClick={undo} disabled={!histLen} aria-label="Undo (Ctrl+Z)">
                  <Undo2 size={15} />
                </button>
                <button type="button" className="tool-btn" onClick={redo} disabled={!futLen} aria-label="Redo (Ctrl+Y)">
                  <Redo2 size={15} />
                </button>
              </div>
              <div className="row gap-1">
                <button type="button" className="tool-btn" onClick={() => setZoom((z) => clamp(+(z - 0.1).toFixed(2), 0.3, 1.5))} aria-label="Perkecil">
                  <ZoomOut size={15} />
                </button>
                <span className="mono" style={{ minWidth: 40, textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
                <button type="button" className="tool-btn" onClick={() => setZoom((z) => clamp(+(z + 0.1).toFixed(2), 0.3, 1.5))} aria-label="Perbesar">
                  <ZoomIn size={15} />
                </button>
              </div>
            </div>
            <div className="canvas-stage" ref={stageRef} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
              <div
                className="canvas-frame"
                style={{
                  width: doc.frame.width,
                  height: doc.frame.height,
                  transform: `scale(${zoom})`,
                }}
                onClick={() => setSelected('')}
              >
                {doc.layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`canvas-el${layer.id === selected ? ' selected' : ''}`}
                    style={{
                      left: layer.x,
                      top: layer.y,
                      width: layer.w,
                      height: layer.h,
                      background: layer.type === 'text' ? 'transparent' : layer.fill,
                      borderRadius: layer.radius ?? 0,
                      color: layer.color,
                      fontSize: layer.size,
                      fontWeight: layer.weight,
                      display: layer.type === 'text' || layer.type === 'button' ? 'flex' : 'block',
                      alignItems: layer.type === 'button' ? 'center' : 'flex-start',
                      justifyContent: layer.type === 'button' ? 'center' : 'flex-start',
                      padding: layer.type === 'text' ? 4 : 0,
                      lineHeight: 1.1,
                      overflow: 'hidden',
                    }}
                    onPointerDown={(event) => onPointerDown(event, layer)}
                    role="presentation"
                  >
                    {layer.type === 'text' || layer.type === 'button' ? layer.text : null}
                    {layer.id === selected ? <span className="handle" /> : null}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="canvas-panel">
            <div className="canvas-panel-head">
              <span className="mono">Layer</span>
              <div className="row gap-1">
                <button type="button" className="tool-btn" onClick={duplicateLayer} disabled={!activeLayer} aria-label="Duplikat layer">
                  <Copy size={14} />
                </button>
                <button type="button" className="tool-btn" onClick={removeLayer} disabled={!activeLayer} aria-label="Hapus layer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="canvas-panel-body">
              {doc.layers.length === 0 ? (
                <p className="small muted" style={{ padding: '.5rem' }}>Belum ada layer. Tambahkan bentuk atau teks.</p>
              ) : (
                [...doc.layers].reverse().map((layer) => (
                  <button
                    key={layer.id}
                    type="button"
                    className="layer-row"
                    aria-current={layer.id === selected}
                    onClick={() => setSelected(layer.id)}
                  >
                    {layer.type === 'text' ? <TypeIcon size={13} /> : <LayersIcon size={13} />}
                    <span>{layer.name}</span>
                  </button>
                ))
              )}

              {activeLayer ? (
                <>
                  <div className="divider" />
                  <span className="mono muted" style={{ fontSize: '.62rem', letterSpacing: '.1em' }}>Properti</span>
                  <div className="field" style={{ marginTop: '.4rem' }}>
                    <label className="label" htmlFor="layer-name">Nama</label>
                    <input id="layer-name" className="input" value={activeLayer.name} onChange={(e) => updateLayer({ name: e.target.value })} />
                  </div>
                  <div className="prop-grid" style={{ marginTop: '.5rem' }}>
                    <div className="field">
                      <label className="label" htmlFor="lx">X</label>
                      <input id="lx" className="input" type="number" value={activeLayer.x} onChange={(e) => updateLayer({ x: Number(e.target.value) })} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="ly">Y</label>
                      <input id="ly" className="input" type="number" value={activeLayer.y} onChange={(e) => updateLayer({ y: Number(e.target.value) })} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="lw">Lebar</label>
                      <input id="lw" className="input" type="number" min={8} value={activeLayer.w} onChange={(e) => updateLayer({ w: Math.max(8, Number(e.target.value)) })} />
                    </div>
                    <div className="field">
                      <label className="label" htmlFor="lh">Tinggi</label>
                      <input id="lh" className="input" type="number" min={8} value={activeLayer.h} onChange={(e) => updateLayer({ h: Math.max(8, Number(e.target.value)) })} />
                    </div>
                  </div>

                  {activeLayer.type !== 'text' ? (
                    <div className="field" style={{ marginTop: '.5rem' }}>
                      <label className="label" htmlFor="lfill">Warna isi</label>
                      <div className="color-row">
                        <input id="lfill" type="color" value={activeLayer.fill ?? '#0d9488'} onChange={(e) => updateLayer({ fill: e.target.value })} />
                        <input className="input" value={activeLayer.fill ?? ''} onChange={(e) => updateLayer({ fill: e.target.value })} aria-label="Kode warna isi" />
                      </div>
                    </div>
                  ) : null}

                  {activeLayer.type === 'text' || activeLayer.type === 'button' ? (
                    <>
                      <div className="field" style={{ marginTop: '.5rem' }}>
                        <label className="label" htmlFor="ltext">Teks</label>
                        <textarea id="ltext" className="textarea" style={{ minHeight: 60 }} value={activeLayer.text ?? ''} onChange={(e) => updateLayer({ text: e.target.value })} />
                      </div>
                      <div className="prop-grid" style={{ marginTop: '.5rem' }}>
                        <div className="field">
                          <label className="label" htmlFor="lsize">Ukuran</label>
                          <input id="lsize" className="input" type="number" value={activeLayer.size ?? 16} onChange={(e) => updateLayer({ size: Number(e.target.value) })} />
                        </div>
                        <div className="field">
                          <label className="label" htmlFor="lweight">Bobot</label>
                          <select id="lweight" className="select" value={activeLayer.weight ?? 400} onChange={(e) => updateLayer({ weight: Number(e.target.value) })}>
                            <option value={400}>Regular</option>
                            <option value={500}>Medium</option>
                            <option value={600}>Semibold</option>
                            <option value={700}>Bold</option>
                          </select>
                        </div>
                      </div>
                      <div className="field" style={{ marginTop: '.5rem' }}>
                        <label className="label" htmlFor="lcolor">Warna teks</label>
                        <div className="color-row">
                          <input id="lcolor" type="color" value={activeLayer.color ?? '#0c1116'} onChange={(e) => updateLayer({ color: e.target.value })} />
                          <input className="input" value={activeLayer.color ?? ''} onChange={(e) => updateLayer({ color: e.target.value })} aria-label="Kode warna teks" />
                        </div>
                      </div>
                    </>
                  ) : null}

                  <div className="field" style={{ marginTop: '.5rem' }}>
                    <label className="label" htmlFor="lradius">Radius</label>
                    <input id="lradius" className="input" type="number" min={0} value={activeLayer.radius ?? 0} onChange={(e) => updateLayer({ radius: Math.max(0, Number(e.target.value)) })} />
                  </div>

                  <span className="mono muted" style={{ fontSize: '.62rem', letterSpacing: '.1em', display: 'block', marginTop: '.8rem' }}>Palet</span>
                  <div className="row gap-1 wrapflex" style={{ marginTop: '.35rem' }}>
                    {PALETTE.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Pakai warna ${color}`}
                        onClick={() => updateLayer(activeLayer.type === 'text' ? { color } : { fill: color })}
                        style={{ width: 22, height: 22, borderRadius: 5, background: color, border: '1px solid var(--line-strong)' }}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="small muted" style={{ padding: '.6rem .5rem' }}>
                  Pilih layer untuk mengubah propertinya.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}

      <Modal open={nameModal} onClose={() => setNameModal(false)} title="Proyek kanvas baru">
        <div className="field">
          <label className="label" htmlFor="pname">Nama proyek</label>
          <input
            id="pname"
            className="input"
            value={newName}
            maxLength={80}
            placeholder="Mis. Hero landing v2"
            aria-invalid={Boolean(nameError)}
            onChange={(e) => { setNewName(e.target.value); setNameError(''); }}
          />
          {nameError ? <span className="field-error">{nameError}</span> : <span className="help">2–80 karakter.</span>}
        </div>
        <div className="row gap-2" style={{ marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setNameModal(false)}>Batal</button>
          <button type="button" className="btn btn-teal" onClick={createProject}>
            <Check size={15} /> Buat
          </button>
        </div>
      </Modal>
    </>
  );
}
