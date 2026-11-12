import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, MessageSquare, Send, ThumbsUp, UserPlus, X } from 'lucide-react';
import { api, errorMessage } from '../lib/api';
import { Empty, LoadError, Modal, SkeletonBlock, Spinner, useToast } from '../components/ui';
import { clockTime, initials } from '../lib/format';
import { useAuth } from '../lib/auth';
import type { Comment, Room, RoomDetail } from '../lib/types';

const OPTIONS = [
  { id: 'hero-a', label: 'Versi A — teks kiri, visual kanan' },
  { id: 'hero-b', label: 'Versi B — visual penuh, teks overlay' },
];

/** Ruang kolaborasi: komentar pin, voting desain, dan obrolan. */
export default function Collab() {
  const toast = useToast();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeId, setActiveId] = useState('');
  const [detail, setDetail] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const [commentDraft, setCommentDraft] = useState('');
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [sendingComment, setSendingComment] = useState(false);
  const [voting, setVoting] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  const [inviteModal, setInviteModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newRoom, setNewRoom] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalBusy, setModalBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    api<{ rooms: Room[] }>('/api/rooms')
      .then((res) => {
        if (!alive) return;
        setRooms(res.rooms);
        if (res.rooms.length) setActiveId(res.rooms[0].id);
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

  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    setDetailLoading(true);
    api<RoomDetail>(`/api/rooms/${activeId}`)
      .then((res) => {
        if (alive) setDetail(res);
      })
      .catch((err) => {
        if (alive) toast.error('Gagal memuat ruang', errorMessage(err));
      })
      .finally(() => {
        if (alive) setDetailLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [activeId, toast]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [detail?.messages.length]);

  const totals = useMemo(() => {
    const values = Object.values(detail?.votes ?? {});
    return values.reduce((sum, n) => sum + n, 0);
  }, [detail]);

  const pinAt = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
    setCommentDraft('');
  };

  const submitComment = async () => {
    if (!pendingPin || !detail) return;
    if (commentDraft.trim().length < 3) {
      toast.warn('Komentar terlalu pendek', 'Minimal 3 karakter.');
      return;
    }
    setSendingComment(true);
    try {
      const res = await api<{ comment: Comment }>(`/api/rooms/${detail.room.id}/comments`, {
        method: 'POST',
        body: { body: commentDraft.trim(), x: pendingPin.x, y: pendingPin.y },
      });
      setDetail((prev) => (prev ? { ...prev, comments: [...prev.comments, res.comment] } : prev));
      setPendingPin(null);
      setCommentDraft('');
      toast.success('Komentar ditambahkan');
    } catch (err) {
      toast.error('Gagal menambah komentar', errorMessage(err));
    } finally {
      setSendingComment(false);
    }
  };

  const resolve = async (comment: Comment) => {
    if (!detail) return;
    try {
      await api(`/api/rooms/${detail.room.id}/comments/${comment.id}`, {
        method: 'PATCH',
        body: { resolved: !comment.resolved },
      });
      setDetail((prev) =>
        prev
          ? { ...prev, comments: prev.comments.map((c) => (c.id === comment.id ? { ...c, resolved: c.resolved ? 0 : 1 } : c)) }
          : prev,
      );
    } catch (err) {
      toast.error('Gagal mengubah komentar', errorMessage(err));
    }
  };

  const vote = async (optionId: string) => {
    if (!detail) return;
    setVoting(true);
    try {
      const res = await api<{ votes: Record<string, number>; my_vote: string }>(`/api/rooms/${detail.room.id}/votes`, {
        method: 'POST',
        body: { option_id: optionId },
      });
      setDetail((prev) => (prev ? { ...prev, votes: res.votes, my_vote: res.my_vote } : prev));
      toast.success('Suara tercatat');
    } catch (err) {
      toast.error('Gagal mengirim suara', errorMessage(err));
    } finally {
      setVoting(false);
    }
  };

  const sendChat = async () => {
    if (!detail) return;
    const body = chatDraft.trim();
    if (!body) return;
    setSendingChat(true);
    try {
      const res = await api<{ message: RoomDetail['messages'][number] }>(`/api/rooms/${detail.room.id}/messages`, {
        method: 'POST',
        body: { body },
      });
      setDetail((prev) => (prev ? { ...prev, messages: [...prev.messages, res.message] } : prev));
      setChatDraft('');
    } catch (err) {
      toast.error('Gagal mengirim pesan', errorMessage(err));
    } finally {
      setSendingChat(false);
    }
  };

  const joinRoom = async () => {
    const code = joinCode.trim();
    if (code.length < 4) {
      setModalError('Kode undangan tidak valid');
      return;
    }
    setModalBusy(true);
    setModalError('');
    try {
      const res = await api<{ room: Room }>('/api/rooms/join', { method: 'POST', body: { code } });
      setRooms((prev) => (prev.some((r) => r.id === res.room.id) ? prev : [res.room, ...prev]));
      setActiveId(res.room.id);
      setInviteModal(false);
      setJoinCode('');
      toast.success('Bergabung ke ruang', res.room.title);
    } catch (err) {
      setModalError(errorMessage(err));
    } finally {
      setModalBusy(false);
    }
  };

  const createRoom = async () => {
    const title = newRoom.trim();
    if (title.length < 3) {
      setModalError('Judul ruang minimal 3 karakter');
      return;
    }
    setModalBusy(true);
    setModalError('');
    try {
      const res = await api<{ room: Room }>('/api/rooms', { method: 'POST', body: { title } });
      setRooms((prev) => [{ ...res.room, members: 1, open_comments: 0, messages: 0 }, ...prev]);
      setActiveId(res.room.id);
      setInviteModal(false);
      setNewRoom('');
      toast.success('Ruang review dibuat', title);
    } catch (err) {
      setModalError(errorMessage(err));
    } finally {
      setModalBusy(false);
    }
  };

  if (error) return <LoadError message={error} onRetry={() => setReloadKey((k) => k + 1)} />;

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">Kolaborasi</span>
          <h1 className="h2" style={{ marginTop: '.5rem' }}>Ruang review</h1>
          <p className="small muted" style={{ marginTop: '.25rem' }}>
            Komentar menempel di titik desain, voting menentukan versi, obrolan menyimpan konteks.
          </p>
        </div>
        <button type="button" className="btn btn-sm" onClick={() => { setInviteModal(true); setModalError(''); }}>
          <UserPlus size={14} /> Undang / ruang baru
        </button>
      </div>

      {loading ? (
        <div className="stack gap-2">
          <SkeletonBlock height={90} />
          <SkeletonBlock height={240} />
        </div>
      ) : rooms.length === 0 ? (
        <Empty
          icon={<MessageSquare size={20} />}
          title="Belum ada ruang review"
          text="Buat ruang baru atau gabung memakai kode undangan."
          action={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setInviteModal(true)}>
              <UserPlus size={14} /> Buat ruang
            </button>
          }
        />
      ) : (
        <>
          <div className="filter-bar">
            {rooms.map((room) => (
              <button
                key={room.id}
                type="button"
                className="chip"
                aria-pressed={room.id === activeId}
                onClick={() => { setActiveId(room.id); setPendingPin(null); }}
              >
                {room.title}
              </button>
            ))}
          </div>

          {detailLoading || !detail ? (
            <SkeletonBlock height={320} />
          ) : (
            <div className="collab-shell">
              <section className="preview">
                <div className="preview-head">
                  <div>
                    <strong style={{ fontSize: '.9rem', color: 'var(--ink)' }}>{detail.room.title}</strong>
                    <div className="mono muted" style={{ fontSize: '.66rem' }}>
                      kode: {detail.room.share_code} · {detail.members.length} anggota
                    </div>
                  </div>
                  <span className="badge badge-teal">{detail.comments.filter((c) => !c.resolved).length} terbuka</span>
                </div>
                <div className="preview-area" onClick={pinAt} role="presentation">
                  <div className="preview-art" aria-hidden="true">
                    <div className="bar w40" />
                    <div className="bar w60" />
                    <div className="bar" />
                    <div className="bar teal" />
                  </div>
                  {detail.comments.map((comment) => (
                    <button
                      key={comment.id}
                      type="button"
                      className={`pin${comment.resolved ? ' resolved' : ''}`}
                      style={{ left: `${comment.x}%`, top: `${comment.y}%` }}
                      title={`${comment.author}: ${comment.body}`}
                      onClick={(event) => { event.stopPropagation(); resolve(comment); }}
                    >
                      {initials(comment.author)}
                    </button>
                  ))}
                  {pendingPin ? (
                    <span className="pin" style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%`, background: 'var(--ink)' }}>
                      +
                    </span>
                  ) : null}
                </div>
                <div style={{ padding: '.8rem' }}>
                  {pendingPin ? (
                    <>
                      <div className="field">
                        <label className="label" htmlFor="cbody">Komentar pada titik {pendingPin.x}% , {pendingPin.y}%</label>
                        <textarea
                          id="cbody"
                          className="textarea"
                          style={{ minHeight: 70 }}
                          maxLength={600}
                          value={commentDraft}
                          placeholder="Tulis catatan desain…"
                          onChange={(e) => setCommentDraft(e.target.value)}
                        />
                      </div>
                      <div className="row gap-2" style={{ marginTop: '.6rem' }}>
                        <button type="button" className="btn btn-teal btn-sm" onClick={submitComment} disabled={sendingComment}>
                          {sendingComment ? <Spinner size={13} /> : <Check size={14} />} Kirim komentar
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPendingPin(null)}>Batal</button>
                      </div>
                    </>
                  ) : (
                    <p className="small muted">Klik di area desain untuk menempelkan komentar. Klik pin untuk menandai selesai.</p>
                  )}
                </div>
              </section>

              <aside className="stack gap-2">
                <section className="card card-pad">
                  <div className="row between" style={{ marginBottom: '.5rem' }}>
                    <h2 className="h3" style={{ fontSize: '.95rem' }}>Pilih versi</h2>
                    <ThumbsUp size={14} color="var(--teal)" />
                  </div>
                  {OPTIONS.map((option) => {
                    const count = detail.votes[option.id] ?? 0;
                    const share = totals ? Math.round((count / totals) * 100) : 0;
                    return (
                      <div className="vote-row" key={option.id}>
                        <button
                          type="button"
                          className={`btn btn-sm${detail.my_vote === option.id ? ' btn-teal' : ''}`}
                          onClick={() => vote(option.id)}
                          disabled={voting}
                          aria-pressed={detail.my_vote === option.id}
                        >
                          {option.id === 'hero-a' ? 'A' : 'B'}
                        </button>
                        <div style={{ flex: 1 }}>
                          <div className="row between small">
                            <span style={{ color: 'var(--ink-2)' }}>{option.label}</span>
                            <span className="mono muted">{share}%</span>
                          </div>
                          <div className="bar"><i style={{ width: `${share}%` }} /></div>
                        </div>
                      </div>
                    );
                  })}
                  <p className="help" style={{ marginTop: '.4rem' }}>{totals} suara masuk · satu suara per akun.</p>
                </section>

                <section className="card card-pad">
                  <h2 className="h3" style={{ fontSize: '.95rem', marginBottom: '.5rem' }}>Komentar ({detail.comments.length})</h2>
                  <div style={{ maxHeight: 220, overflow: 'auto' }}>
                    {detail.comments.length === 0 ? (
                      <p className="small muted">Belum ada komentar.</p>
                    ) : (
                      detail.comments.map((comment) => (
                        <div className="comment-row" key={comment.id}>
                          <div className="row between">
                            <span className="row gap-1 small strong">
                              <span className="avatar" style={{ width: 20, height: 20, fontSize: '.6rem' }}>{initials(comment.author)}</span>
                              {comment.author}
                            </span>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => resolve(comment)} aria-label={comment.resolved ? 'Buka kembali' : 'Tandai selesai'}>
                              {comment.resolved ? <X size={12} /> : <Check size={12} />}
                            </button>
                          </div>
                          <p style={{ opacity: comment.resolved ? 0.55 : 1, textDecoration: comment.resolved ? 'line-through' : 'none' }}>
                            {comment.body}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="card card-pad">
                  <h2 className="h3" style={{ fontSize: '.95rem', marginBottom: '.5rem' }}>Obrolan ruang</h2>
                  <div className="chat-box">
                    <div className="chat-log" ref={chatRef}>
                      {detail.messages.length === 0 ? (
                        <p className="small muted">Belum ada pesan. Mulai diskusi di sini.</p>
                      ) : (
                        detail.messages.map((message) => (
                          <div key={message.id} className={`bubble${message.user_id === user?.id ? ' mine' : ''}`}>
                            <span className="who">{message.author} · {clockTime(message.created_at)}</span>
                            {message.body}
                          </div>
                        ))
                      )}
                    </div>
                    <form
                      className="row gap-1"
                      style={{ marginTop: '.5rem' }}
                      onSubmit={(event) => { event.preventDefault(); sendChat(); }}
                    >
                      <input
                        className="input"
                        placeholder="Tulis pesan…"
                        value={chatDraft}
                        maxLength={400}
                        onChange={(e) => setChatDraft(e.target.value)}
                        aria-label="Pesan obrolan"
                      />
                      <button type="submit" className="btn btn-teal btn-icon" disabled={sendingChat || !chatDraft.trim()} aria-label="Kirim pesan">
                        {sendingChat ? <Spinner size={14} /> : <Send size={15} />}
                      </button>
                    </form>
                  </div>
                </section>
              </aside>
            </div>
          )}
        </>
      )}

      <Modal open={inviteModal} onClose={() => setInviteModal(false)} title="Ruang kolaborasi">
        <div className="stack gap-3">
          <div className="field">
            <label className="label" htmlFor="newroom">Buat ruang baru</label>
            <div className="row gap-1">
              <input id="newroom" className="input" placeholder="Judul review" value={newRoom} maxLength={90} onChange={(e) => { setNewRoom(e.target.value); setModalError(''); }} />
              <button type="button" className="btn btn-teal" onClick={createRoom} disabled={modalBusy}>Buat</button>
            </div>
          </div>
          <div className="divider" style={{ margin: 0 }} />
          <div className="field">
            <label className="label" htmlFor="joincode">Gabung dengan kode</label>
            <div className="row gap-1">
              <input id="joincode" className="input" placeholder="Kode undangan" value={joinCode} maxLength={40} onChange={(e) => { setJoinCode(e.target.value); setModalError(''); }} />
              <button type="button" className="btn" onClick={joinRoom} disabled={modalBusy}>Gabung</button>
            </div>
          </div>
          {modalError ? <div className="banner banner-error">{modalError}</div> : null}
        </div>
      </Modal>
    </>
  );
}
