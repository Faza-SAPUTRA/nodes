import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Camera, Check, KeyRound, LogOut, Save, Trash2 } from 'lucide-react';
import { api, errorMessage, getToken, setToken } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Field, LoadError, Modal, SkeletonBlock, Spinner, useToast } from '../components/ui';
import { fullDate, initials, relativeTime } from '../lib/format';
import type { Prefs, ProjectMeta, User } from '../lib/types';

type Stats = {
  heatmap: { date: string; count: number }[];
  totals: { lessons: number; projects: number; comments: number };
  streak: number;
};

/** Ukuran maksimal file avatar: 4 MB */
const MAX_AVATAR_SIZE = 4 * 1024 * 1024;

/** Tipe file yang diperbolehkan untuk avatar */
const ACCEPTED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/** Halaman profil: data akun, avatar, preferensi, proyek, statistik, keamanan, dan hapus akun. */
export default function Profile() {
  const { user, setUser, savePrefs, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState('');
  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // State untuk upload avatar
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // State untuk daftar proyek
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState(false);

  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [savingPw, setSavingPw] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePw, setDeletePw] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    api<Stats>('/api/profile/stats')
      .then((res) => { if (alive) setStats(res); })
      .catch((err) => { if (alive) setStatsError(errorMessage(err)); });
    return () => { alive = false; };
  }, []);

  // Muat daftar proyek kanvas pengguna
  useEffect(() => {
    let alive = true;
    setLoadingProjects(true);
    api<{ projects: ProjectMeta[] }>('/api/projects')
      .then((res) => { if (alive) { setProjects(res.projects); setProjectsError(''); } })
      .catch((err) => { if (alive) setProjectsError(errorMessage(err)); })
      .finally(() => { if (alive) setLoadingProjects(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setName(user?.name ?? '');
    setBio(user?.bio ?? '');
  }, [user?.name, user?.bio]);

  const prefs: Prefs = user?.prefs ?? {};

  const updatePref = async (patchData: Prefs) => {
    savePrefs(patchData);
    try {
      const res = await api<{ user: User }>('/api/profile', { method: 'PATCH', body: { prefs: patchData } });
      setUser({ ...(user as User), ...res.user });
    } catch (err) {
      toast.error('Preferensi gagal disimpan di server', errorMessage(err));
    }
  };

  const saveProfile = async () => {
    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = 'Nama minimal 2 karakter';
    if (bio.length > 280) errors.bio = 'Bio maksimal 280 karakter';
    setProfileErrors(errors);
    if (Object.keys(errors).length) return;
    setSavingProfile(true);
    try {
      const res = await api<{ user: User }>('/api/profile', {
        method: 'PATCH',
        body: { name: name.trim(), bio: bio.trim() },
      });
      setUser({ ...(user as User), ...res.user, prefs: res.user.prefs });
      toast.success('Profil diperbarui');
    } catch (err) {
      toast.error('Gagal menyimpan profil', errorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  /** Upload avatar: kirim file ke server, lalu simpan URL ke profil. */
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input supaya bisa pilih file yang sama lagi
    e.target.value = '';
    if (!file) return;

    // Validasi tipe file
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast.error('Format tidak didukung', 'Gunakan file PNG, JPG, atau WebP.');
      return;
    }

    // Validasi ukuran file
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error('File terlalu besar', 'Ukuran maksimal avatar adalah 4 MB.');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Kirim file sebagai raw binary body (bukan multipart)
      const buffer = await file.arrayBuffer();

      const uploadRes = await api<{ url: string }>(
        `/api/uploads?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          raw: new Uint8Array(buffer),
          headers: { 'Content-Type': file.type },
        },
      );

      // Simpan URL avatar ke profil pengguna
      const profileRes = await api<{ user: User }>('/api/profile', {
        method: 'PATCH',
        body: { avatar: uploadRes.url },
      });

      setUser({ ...(user as User), ...profileRes.user, prefs: profileRes.user.prefs });
      toast.success('Avatar diperbarui');
    } catch (err) {
      toast.error('Gagal mengunggah avatar', errorMessage(err));
    } finally {
      setUploadingAvatar(false);
    }
  };

  /** Hapus proyek kanvas dengan konfirmasi. */
  const deleteProject = async () => {
    if (!deleteProjectId) return;
    setDeletingProject(true);
    try {
      await api(`/api/projects/${deleteProjectId}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((p) => p.id !== deleteProjectId));
      toast.success('Proyek dihapus');
      setDeleteProjectId(null);
    } catch (err) {
      toast.error('Gagal menghapus proyek', errorMessage(err));
    } finally {
      setDeletingProject(false);
    }
  };

  const changePassword = async () => {
    const errors: Record<string, string> = {};
    if (!pwCurrent) errors.current = 'Password saat ini wajib diisi';
    if (pwNew.length < 8) errors.new = 'Password baru minimal 8 karakter';
    else if (!(/[A-Za-z]/.test(pwNew) && /\d/.test(pwNew))) errors.new = 'Harus memuat huruf dan angka';
    if (pwNew !== pwConfirm) errors.confirm = 'Konfirmasi tidak cocok';
    setPwErrors(errors);
    if (Object.keys(errors).length) return;
    setSavingPw(true);
    try {
      const res = await api<{ token: string }>('/api/profile/password', {
        method: 'POST',
        body: { current: pwCurrent, new: pwNew },
      });
      setToken(res.token);
      setPwCurrent('');
      setPwNew('');
      setPwConfirm('');
      toast.success('Password diganti', 'Sesi lain otomatis keluar.');
    } catch (err) {
      toast.error('Gagal mengganti password', errorMessage(err));
    } finally {
      setSavingPw(false);
    }
  };

  const deleteAccount = async () => {
    if (!deletePw) {
      setDeleteError('Password wajib diisi');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      await api('/api/profile', { method: 'DELETE', body: { password: deletePw } });
      logout();
      toast.success('Akun dihapus', 'Semua data terkait sudah dibersihkan.');
      navigate('/masuk', { replace: true });
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const heat = useMemo(() => {
    const max = Math.max(1, ...(stats?.heatmap.map((d) => d.count) ?? [1]));
    return (stats?.heatmap ?? []).map((day) => ({
      ...day,
      level: day.count === 0 ? 0 : Math.min(4, Math.ceil((day.count / max) * 4)),
    }));
  }, [stats]);

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Akun</span>
          <h1 className="h2" style={{ marginTop: '.5rem' }}>Profil &amp; pengaturan</h1>
          <p className="small muted" style={{ marginTop: '.25rem' }}>
            Bergabung sejak {user ? fullDate(user.created_at) : '—'}.
          </p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/masuk'); }}>
          <LogOut size={14} /> Keluar
        </button>
      </div>

      <div className="profile-grid">
        <aside className="stack gap-2">
          <section className="card card-pad">
            <div className="row gap-2">
              {/* Area avatar yang bisa diklik untuk mengunggah foto */}
              <button
                type="button"
                className="avatar avatar-lg avatar-upload"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                aria-label="Ganti foto profil"
                title="Klik untuk ganti foto profil"
              >
                {uploadingAvatar ? (
                  <Spinner size={22} />
                ) : user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  initials(user?.name ?? 'N')
                )}
                {/* Overlay ikon kamera */}
                <span className="avatar-upload-overlay" aria-hidden="true">
                  <Camera size={16} />
                </span>
              </button>
              {/* Input file tersembunyi untuk memilih avatar */}
              <input
                ref={avatarInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.webp"
                className="sr-only"
                onChange={handleAvatarChange}
                tabIndex={-1}
              />
              <div style={{ minWidth: 0 }}>
                <div className="strong" style={{ fontSize: '1rem' }}>{user?.name}</div>
                <div className="small muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>
            </div>
            <p className="small muted" style={{ marginTop: '.7rem' }}>{user?.bio || 'Belum ada bio.'}</p>
          </section>

          <section className="card card-pad">
            <h2 className="h3" style={{ fontSize: '.95rem', marginBottom: '.6rem' }}>Capaian</h2>
            {statsError ? (
              <p className="small" style={{ color: 'var(--danger)' }}>{statsError}</p>
            ) : !stats ? (
              <SkeletonBlock height={60} />
            ) : (
              <>
                <div className="kv"><span>Streak</span><b>{stats.streak} hari</b></div>
                <div className="kv"><span>Sesi selesai</span><b>{stats.totals.lessons}</b></div>
                <div className="kv"><span>Proyek kanvas</span><b>{stats.totals.projects}</b></div>
                <div className="kv"><span>Komentar review</span><b>{stats.totals.comments}</b></div>
              </>
            )}
          </section>

          <section className="card card-pad">
            <h2 className="h3" style={{ fontSize: '.95rem', marginBottom: '.6rem' }}>Aktivitas 12 minggu</h2>
            {!stats ? (
              <SkeletonBlock height={100} />
            ) : (
              <div className="heatmap" aria-label="Heatmap aktivitas">
                {heat.map((day) => (
                  <i key={day.date} data-l={day.level || undefined} title={`${day.date}: ${day.count} aktivitas`} />
                ))}
              </div>
            )}
          </section>
        </aside>

        <div className="stack gap-2">
          <section className="card card-pad">
            <h2 className="h3" style={{ fontSize: '.95rem', marginBottom: '.8rem' }}>Data profil</h2>
            <div className="stack gap-3">
              <Field label="Nama" htmlFor="pname" error={profileErrors.name}>
                <input id="pname" className="input" value={name} maxLength={80} aria-invalid={Boolean(profileErrors.name)} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="Bio" htmlFor="pbio" error={profileErrors.bio} hint={`${bio.length}/280 karakter`}>
                <textarea id="pbio" className="textarea" value={bio} maxLength={280} onChange={(e) => setBio(e.target.value)} />
              </Field>
              <Field label="Email" htmlFor="pemail" hint="Email tidak bisa diubah.">
                <input id="pemail" className="input" value={user?.email ?? ''} disabled />
              </Field>
              <button type="button" className="btn btn-teal" style={{ alignSelf: 'flex-start' }} onClick={saveProfile} disabled={savingProfile}>
                {savingProfile ? <Spinner size={14} /> : <Save size={14} />} Simpan profil
              </button>
            </div>
          </section>

          {/* Bagian proyek kanvas pengguna */}
          <section className="card card-pad">
            <h2 className="h3" style={{ fontSize: '.95rem', marginBottom: '.8rem' }}>Proyek kanvas</h2>
            {projectsError ? (
              <p className="small" style={{ color: 'var(--danger)' }}>{projectsError}</p>
            ) : loadingProjects ? (
              <div className="stack gap-2">
                <SkeletonBlock height={52} />
                <SkeletonBlock height={52} />
              </div>
            ) : projects.length === 0 ? (
              <p className="small muted">Belum ada proyek kanvas.</p>
            ) : (
              <div className="stack gap-2">
                {projects.map((project) => (
                  <div key={project.id} className="row between" style={{ padding: '.6rem .7rem', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div className="strong" style={{ fontSize: '.88rem' }}>{project.name}</div>
                      <div className="small muted">{relativeTime(project.updated_at)}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)', flexShrink: 0 }}
                      onClick={() => setDeleteProjectId(project.id)}
                      aria-label={`Hapus proyek ${project.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card card-pad">
            <h2 className="h3" style={{ fontSize: '.95rem', marginBottom: '.8rem' }}>Preferensi</h2>
            <div className="kv">
              <span>Tema gelap</span>
              <label className="checkbox">
                <input type="checkbox" checked={prefs.theme === 'dark'} onChange={(e) => updatePref({ theme: e.target.checked ? 'dark' : 'light' })} />
              </label>
            </div>
            <div className="kv">
              <span>Kurangi animasi</span>
              <label className="checkbox">
                <input type="checkbox" checked={Boolean(prefs.reduce_motion)} onChange={(e) => updatePref({ reduce_motion: e.target.checked })} />
              </label>
            </div>
            <div className="kv">
              <span>Ringkasan email</span>
              <label className="checkbox">
                <input type="checkbox" checked={Boolean(prefs.email_digest)} onChange={(e) => updatePref({ email_digest: e.target.checked })} />
              </label>
            </div>
            <div className="kv">
              <span>Bahasa</span>
              <select className="select" style={{ width: 'auto' }} value={prefs.language ?? 'id'} onChange={(e) => updatePref({ language: e.target.value as 'id' | 'en' })} aria-label="Bahasa antarmuka">
                <option value="id">Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </section>

          <section className="card card-pad">
            <h2 className="h3" style={{ fontSize: '.95rem', marginBottom: '.8rem' }}>
              <span className="row gap-1"><KeyRound size={14} /> Ganti password</span>
            </h2>
            <div className="stack gap-3">
              <Field label="Password saat ini" htmlFor="pwcur" error={pwErrors.current}>
                <input id="pwcur" className="input" type="password" value={pwCurrent} aria-invalid={Boolean(pwErrors.current)} onChange={(e) => setPwCurrent(e.target.value)} />
              </Field>
              <Field label="Password baru" htmlFor="pwnew" error={pwErrors.new} hint="Minimal 8 karakter, huruf dan angka.">
                <input id="pwnew" className="input" type="password" value={pwNew} aria-invalid={Boolean(pwErrors.new)} onChange={(e) => setPwNew(e.target.value)} />
              </Field>
              <Field label="Ulangi password baru" htmlFor="pwconf" error={pwErrors.confirm}>
                <input id="pwconf" className="input" type="password" value={pwConfirm} aria-invalid={Boolean(pwErrors.confirm)} onChange={(e) => setPwConfirm(e.target.value)} />
              </Field>
              <button type="button" className="btn" style={{ alignSelf: 'flex-start' }} onClick={changePassword} disabled={savingPw}>
                {savingPw ? <Spinner size={14} /> : <Check size={14} />} Perbarui password
              </button>
            </div>
          </section>

          <section className="danger-zone">
            <h3 className="row gap-1"><AlertTriangle size={15} /> Zona bahaya</h3>
            <p style={{ margin: '.4rem 0 .8rem' }}>
              Menghapus akun akan menghapus seluruh progres, proyek kanvas, komentar, dan data ruang review. Tindakan ini tidak bisa dibatalkan.
            </p>
            <button type="button" className="btn btn-danger" onClick={() => { setDeleteOpen(true); setDeleteError(''); setDeletePw(''); }}>
              <Trash2 size={14} /> Hapus akun permanen
            </button>
          </section>
        </div>
      </div>

      {/* Modal konfirmasi hapus akun */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="Hapus akun permanen">
        <p className="small" style={{ marginBottom: '.8rem' }}>
          Konfirmasi dengan password. Setelah dihapus, akun ini tidak bisa dipulihkan.
        </p>
        <Field label="Password" htmlFor="delpw" error={deleteError}>
          <input id="delpw" className="input" type="password" value={deletePw} aria-invalid={Boolean(deleteError)} onChange={(e) => { setDeletePw(e.target.value); setDeleteError(''); }} />
        </Field>
        <div className="row gap-2" style={{ marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setDeleteOpen(false)}>Batal</button>
          <button type="button" className="btn btn-danger" onClick={deleteAccount} disabled={deleting}>
            {deleting ? <Spinner size={14} /> : <Trash2 size={14} />} Hapus akun
          </button>
        </div>
      </Modal>

      {/* Modal konfirmasi hapus proyek */}
      <Modal open={deleteProjectId !== null} onClose={() => setDeleteProjectId(null)} title="Hapus proyek">
        <p className="small" style={{ marginBottom: '.8rem' }}>
          Proyek <strong>{projects.find((p) => p.id === deleteProjectId)?.name}</strong> akan dihapus permanen beserta semua data kanvasnya. Tindakan ini tidak bisa dibatalkan.
        </p>
        <div className="row gap-2" style={{ marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => setDeleteProjectId(null)}>Batal</button>
          <button type="button" className="btn btn-danger" onClick={deleteProject} disabled={deletingProject}>
            {deletingProject ? <Spinner size={14} /> : <Trash2 size={14} />} Hapus proyek
          </button>
        </div>
      </Modal>
    </>
  );
}
