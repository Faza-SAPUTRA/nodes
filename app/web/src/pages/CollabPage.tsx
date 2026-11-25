import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Monitor, Tablet, Smartphone,
  MessageSquare, ThumbsUp, UserPlus,
  Send, X, MapPin, Check, Reply, Trash2,
  Users, Plus, Rocket, Palette, Layers, CheckCircle2, AlertCircle,
} from 'lucide-react'
import clsx from 'clsx'
import { useToast } from '../components/ui/Toast'
import { useAuthStore } from '../store/authStore'
import ArtboardPreview from '../components/canvas/ArtboardPreview'
import {
  getDefaultSessionData,
  loadCanvasProjects,
  loadCollabSessions,
  loadSessionData,
  removeSessionData,
  saveCollabSessions,
  saveSessionData,
  type ActivityItem,
  type CanvasProject,
  type ChatMessage,
  type CollabSession,
  type CommentPin,
  type SessionCollabData,
} from '../store/canvasStore'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'
type PanelTab = 'chat' | 'activity' | 'votes'

const deviceIcons = { desktop: Monitor, tablet: Tablet, mobile: Smartphone }

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/* ─── Component ─── */
export default function CollabPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { success, info, warning } = useToast()
  const displayName = useAuthStore((s) => s.displayName)
  const initials = useAuthStore((s) => s.initials)

  const selfFullName = displayName() || 'Kamu'
  const selfName = selfFullName.split(' ')[0] || 'Kamu'
  const selfLetter = initials() || 'ND'

  // Canvas projects (shared source of truth with CanvasPage)
  const [canvasProjects, setCanvasProjects] = useState<CanvasProject[]>(loadCanvasProjects)

  useEffect(() => {
    const refreshProjects = () => setCanvasProjects(loadCanvasProjects())
    window.addEventListener('focus', refreshProjects)
    return () => window.removeEventListener('focus', refreshProjects)
  }, [])

  // Session management
  const [sessions, setSessions] = useState<CollabSession[]>(loadCollabSessions)
  const [activeSession, setActiveSession] = useState<CollabSession | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(() => loadCanvasProjects()[0]?.id ?? null)
  const [newSessionTitle, setNewSessionTitle] = useState('')
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false)

  // Active session collab data (persisted per session)
  const [sessionData, setSessionData] = useState<SessionCollabData>(getDefaultSessionData)
  const loadedSessionIdRef = useRef<string | null>(null)

  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [panelTab, setPanelTab] = useState<PanelTab>('chat')
  const [showComments, setShowComments] = useState(true)
  const [activePin, setActivePin] = useState<number | null>(null)
  const [input, setInput] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPanel, setShowPanel] = useState(true)

  // Interactive pins
  const [isAddingPin, setIsAddingPin] = useState(false)
  const [newPinText, setNewPinText] = useState('')
  const [pendingPinPos, setPendingPinPos] = useState<{ x: string; y: string } | null>(null)

  // Reply to pin
  const [replyingToPinId, setReplyingToPinId] = useState<number | null>(null)
  const [pinReplyText, setPinReplyText] = useState('')

  const chatEndRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const { chat, pins: commentPins, activity, votes, invitedEmails } = sessionData

  function openSession(session: CollabSession) {
    const data = loadSessionData(session.id)
    loadedSessionIdRef.current = session.id
    setSessionData(data)
    setActiveSession(session)
    setActivePin(null)
    setIsAddingPin(false)
    setPendingPinPos(null)
    setReplyingToPinId(null)
  }

  // Persist changes for the currently loaded session
  useEffect(() => {
    if (activeSession && loadedSessionIdRef.current === activeSession.id) {
      saveSessionData(activeSession.id, sessionData)
    }
  }, [activeSession, sessionData])

  // Auto-open or create session when arriving from CanvasPage (?project=<id>)
  useEffect(() => {
    const paramId = Number(searchParams.get('project'))
    if (!paramId) return

    const latestProjects = loadCanvasProjects()
    setCanvasProjects(latestProjects)
    const targetProj = latestProjects.find(p => p.id === paramId)
    if (!targetProj) {
      setSearchParams({}, { replace: true })
      return
    }

    const latestSessions = loadCollabSessions()
    const existing = latestSessions.find(s => s.projectId === targetProj.id)
    if (existing) {
      setSessions(latestSessions)
      openSession(existing)
    } else {
      const created: CollabSession = {
        id: Date.now().toString(),
        title: `Review: ${targetProj.name}`,
        projectId: targetProj.id,
        createdAt: new Date().toLocaleString('id-ID'),
      }
      const updated = [created, ...latestSessions]
      saveCollabSessions(updated)
      const initialData = getDefaultSessionData()
      saveSessionData(created.id, initialData)
      setSessions(updated)
      loadedSessionIdRef.current = created.id
      setSessionData(initialData)
      setActiveSession(created)
      success('Sesi Review Siap', `Menghubungkan proyek "${targetProj.name}" ke ruang kolaborasi.`)
    }
    setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Sync default modal selection when opening modal
  function openCreateModal() {
    const latest = loadCanvasProjects()
    setCanvasProjects(latest)
    const firstProj = latest[0] ?? null
    setSelectedProjectId(firstProj?.id ?? null)
    setNewSessionTitle(firstProj ? `Review: ${firstProj.name}` : '')
    setTitleManuallyEdited(false)
    setShowCreateModal(true)
  }

  function createSession() {
    if (!selectedProjectId) {
      warning('Pilih Proyek', 'Pilih proyek dari Canvas Praktik terlebih dahulu.')
      return
    }
    const proj = canvasProjects.find(p => p.id === selectedProjectId)
    const title = newSessionTitle.trim() || (proj ? `Review: ${proj.name}` : '')
    if (!title) {
      warning('Judul Kosong', 'Masukkan judul sesi kolaborasi.')
      return
    }
    const session: CollabSession = {
      id: Date.now().toString(),
      title,
      projectId: selectedProjectId,
      createdAt: new Date().toLocaleString('id-ID'),
    }
    const updated = [session, ...sessions]
    setSessions(updated)
    saveCollabSessions(updated)
    const initialData = getDefaultSessionData()
    saveSessionData(session.id, initialData)
    loadedSessionIdRef.current = session.id
    setSessionData(initialData)
    setActiveSession(session)
    setNewSessionTitle('')
    setShowCreateModal(false)
    success('Sesi Dibuat', `Sesi "${title}" berhasil dibuat.`)
  }

  function deleteSession(id: string) {
    const updated = sessions.filter(s => s.id !== id)
    setSessions(updated)
    saveCollabSessions(updated)
    removeSessionData(id)
    if (activeSession?.id === id) {
      loadedSessionIdRef.current = null
      setActiveSession(null)
    }
    info('Sesi Dihapus', 'Sesi kolaborasi berhasil dihapus.')
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.length])

  const linkedProject = useMemo(() => {
    if (!activeSession) return null
    return canvasProjects.find(p => p.id === activeSession.projectId) ?? null
  }, [activeSession, canvasProjects])

  const participants = useMemo(() => {
    const list = [{ name: selfFullName, letter: selfLetter, bg: '#0D9488' }]
    const extraColors = ['#7C3AED', '#2563EB', '#D97706', '#DB2777']
    invitedEmails.forEach((email, idx) => {
      const handle = email.split('@')[0] || email
      list.push({
        name: email,
        letter: handle.slice(0, 2).toUpperCase(),
        bg: extraColors[idx % extraColors.length],
      })
    })
    return list
  }, [selfFullName, selfLetter, invitedEmails])

  function makeActivity(text: string): ActivityItem {
    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      author: selfName,
      avatarBg: '#0D9488',
      letter: selfLetter,
      text,
      time: 'baru saja',
    }
  }

  /* ─── Chat ─── */
  function sendMessage() {
    const text = input.trim()
    if (!text) return
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      author: selfName,
      avatar: selfLetter,
      avatarBg: '#0D9488',
      text: escapeHtml(text),
      time: 'baru saja',
      self: true,
    }
    setSessionData(prev => ({
      ...prev,
      chat: [...prev.chat, newMsg],
      activity: [makeActivity('mengirim pesan di chat'), ...prev.activity],
    }))
    setInput('')
  }

  /* ─── Pin: click on preview to add ─── */
  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isAddingPin || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%'
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%'
    setPendingPinPos({ x, y })
  }

  function confirmAddPin() {
    if (!pendingPinPos || !newPinText.trim()) {
      warning('Komentar Kosong', 'Tulis komentar sebelum menambahkan pin.')
      return
    }
    const nextId = commentPins.reduce((max, p) => Math.max(max, p.id), 0) + 1
    const newPin: CommentPin = {
      id: nextId,
      x: pendingPinPos.x,
      y: pendingPinPos.y,
      author: selfName,
      avatarBg: '#0D9488',
      letter: selfLetter,
      time: 'baru saja',
      text: newPinText.trim(),
      replies: [],
      resolved: false,
    }
    setSessionData(prev => ({
      ...prev,
      pins: [...prev.pins, newPin],
      activity: [makeActivity(`menambahkan pin #${newPin.id}`), ...prev.activity],
    }))
    success('Pin Ditambahkan', 'Komentar berhasil ditambahkan di desain.')
    setPendingPinPos(null)
    setNewPinText('')
    setIsAddingPin(false)
    setActivePin(newPin.id)
  }

  function cancelAddPin() {
    setPendingPinPos(null)
    setNewPinText('')
    setIsAddingPin(false)
  }

  /* ─── Pin: resolve/unresolve ─── */
  function toggleResolvePin(pinId: number) {
    setSessionData(prev => {
      const target = prev.pins.find(p => p.id === pinId)
      if (!target) return prev
      const newResolved = !target.resolved
      return {
        ...prev,
        pins: prev.pins.map(p => (p.id === pinId ? { ...p, resolved: newResolved } : p)),
        activity: [
          makeActivity(newResolved ? `resolved komentar #${pinId}` : `membuka kembali komentar #${pinId}`),
          ...prev.activity,
        ],
      }
    })
  }

  /* ─── Pin: delete ─── */
  function deletePin(pinId: number) {
    setSessionData(prev => ({
      ...prev,
      pins: prev.pins.filter(p => p.id !== pinId),
      activity: [makeActivity(`menghapus pin #${pinId}`), ...prev.activity],
    }))
    setActivePin(null)
    info('Pin Dihapus', `Pin #${pinId} berhasil dihapus.`)
  }

  /* ─── Pin: reply ─── */
  function submitPinReply(pinId: number) {
    if (!pinReplyText.trim()) return
    const replyText = pinReplyText.trim()
    setSessionData(prev => ({
      ...prev,
      pins: prev.pins.map(p =>
        p.id === pinId
          ? {
              ...p,
              replies: [
                ...p.replies,
                {
                  author: selfName,
                  avatarBg: '#0D9488',
                  letter: selfLetter,
                  time: 'baru saja',
                  text: replyText,
                },
              ],
            }
          : p
      ),
      activity: [makeActivity(`membalas komentar #${pinId}`), ...prev.activity],
    }))
    setPinReplyText('')
    setReplyingToPinId(null)
  }

  function toggleReviewVote(choice: 'approve' | 'revision') {
    setSessionData(prev => {
      const isSame = prev.votes[choice]
      const nextVotes = {
        approve: choice === 'approve' ? !isSame : false,
        revision: choice === 'revision' ? !isSame : false,
      }
      const actText = isSame
        ? `membatalkan vote ${choice === 'approve' ? 'Siap Lanjut' : 'Perlu Revisi'}`
        : `memberi vote ${choice === 'approve' ? 'Siap Lanjut' : 'Perlu Revisi'}`
      return {
        ...prev,
        votes: nextVotes,
        activity: [makeActivity(actText), ...prev.activity],
      }
    })
  }

  function handleCopy() {
    const shareUrl = linkedProject
      ? `${window.location.origin}/app/kolaborasi?project=${linkedProject.id}`
      : `${window.location.origin}/app/kolaborasi`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    success('Link Tersalin!', 'Link kolaborasi berhasil disalin ke clipboard.')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleBack() {
    if (activeSession) {
      loadedSessionIdRef.current = null
      setActiveSession(null)
    } else {
      navigate('/app')
    }
  }

  function handleEndSession() {
    info('Sesi Ditutup', 'Progres review & komentar tetap tersimpan di daftar sesi.')
    loadedSessionIdRef.current = null
    setActiveSession(null)
  }

  function handleSendInvite() {
    const trimmed = inviteEmail.trim()
    if (!trimmed) {
      warning('Email Kosong', 'Masukkan alamat email terlebih dahulu.')
      return
    }
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      warning('Email Tidak Valid', 'Masukkan alamat email yang valid.')
      return
    }
    if (!invitedEmails.includes(trimmed)) {
      setSessionData(prev => ({
        ...prev,
        invitedEmails: [...prev.invitedEmails, trimmed],
        activity: [makeActivity(`mengundang ${trimmed}`), ...prev.activity],
      }))
    }
    success('Undangan Terkirim', `Undangan berhasil dikirim ke ${trimmed}`)
    setInviteEmail('')
  }

  const unresolvedCount = commentPins.filter(p => !p.resolved).length
  const deviceWidth = device === 'desktop' ? 'max-w-[760px]' : device === 'tablet' ? 'max-w-[540px]' : 'max-w-[360px]'

  /* ════════════════════════════════════════════
   *  EMPTY STATE / SESSION LIST — No active session
   * ════════════════════════════════════════════ */
  if (!activeSession) {
    return (
      <div className="flex flex-col h-screen w-screen fixed inset-0 bg-white z-50">
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-ink-7 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors shrink-0 cursor-pointer"
              aria-label="Kembali ke Dashboard"
            >
              <ChevronLeft size={16} />
            </button>
            <h1 className="text-[15px] font-bold">Kolaborasi</h1>
            <span className="w-px h-4 bg-ink-7" aria-hidden="true" />
            <div className="flex items-center gap-1.5 shrink-0" title="Institut Teknologi Indonesia">
              <img
                src="/logo-iti.png"
                alt="Institut Teknologi Indonesia"
                className="w-6 h-6 object-contain select-none shrink-0"
              />
              <span className="hidden sm:inline text-[11px] font-semibold text-ink-4 tracking-tight">ITI</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/kanvas"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 border border-ink-7 text-ink-3 text-xs font-semibold rounded-lg hover:border-teal-600 hover:text-teal-600 transition-colors"
            >
              <Palette size={14} />
              Canvas Praktik
            </Link>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Buat Sesi Baru
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-ink-9 flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-ink-5" />
              </div>
              <h2 className="text-lg font-bold text-ink mb-2">Belum Ada Sesi Kolaborasi</h2>
              <p className="text-sm text-ink-4 leading-relaxed mb-6">
                {canvasProjects.length === 0
                  ? 'Buat desain di Canvas Praktik terlebih dahulu, lalu review dan diskusikan bersama teman atau dosen di sini.'
                  : 'Pilih proyek dari Canvas Praktik untuk memulai sesi review — tambahkan pin komentar, chat, dan approval desain.'}
              </p>
              {canvasProjects.length === 0 ? (
                <button
                  onClick={() => navigate('/app/kanvas')}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  <Palette className="w-4 h-4" />
                  Buka Canvas Praktik
                </button>
              ) : (
                <button
                  onClick={openCreateModal}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  <Rocket className="w-4 h-4" />
                  Mulai Sesi Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="w-full max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-ink">Sesi Kolaborasi</h2>
                <span className="text-xs text-ink-5">{sessions.length} sesi tersimpan</span>
              </div>
              <div className="space-y-2.5">
                {sessions.map(session => {
                  const proj = canvasProjects.find(p => p.id === session.projectId)
                  const sData = loadSessionData(session.id)
                  const openPins = sData.pins.filter(p => !p.resolved).length
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-white border border-ink-7 rounded-xl hover:border-teal-200 transition-colors group"
                    >
                      <button
                        onClick={() => openSession(session)}
                        className="flex items-center gap-3 flex-1 text-left min-w-0 cursor-pointer"
                      >
                        <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0', proj?.color || 'bg-ink-5')}>
                          {proj ? proj.name[0]?.toUpperCase() : '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-ink group-hover:text-teal-600 transition-colors truncate">{session.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-ink-5 mt-0.5 flex-wrap">
                            <span>{proj ? `${proj.name} · ${proj.layers.length} layers` : 'Proyek Canvas dihapus'}</span>
                            <span>·</span>
                            <span>{sData.pins.length} pin{openPins > 0 ? ` (${openPins} aktif)` : ''}</span>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-5 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0 ml-2 cursor-pointer"
                        title="Hapus sesi"
                        aria-label="Hapus sesi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Create Session Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/50 flex items-center justify-center z-[100]"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-[420px] max-w-[90vw] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,.15)] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-ink-7">
                  <h3 className="text-sm font-bold">Buat Sesi Kolaborasi</h3>
                  <button onClick={() => setShowCreateModal(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors cursor-pointer">
                    <X size={16} />
                  </button>
                </div>
                <div className="p-5">
                  {canvasProjects.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
                        <Layers size={20} />
                      </div>
                      <p className="text-sm font-semibold text-ink mb-1">Belum Ada Proyek Canvas</p>
                      <p className="text-xs text-ink-4 leading-relaxed mb-4">
                        Kolaborasi terhubung langsung dengan desain dari Canvas Praktik. Buat proyek pertamamu dulu di Canvas.
                      </p>
                      <button
                        onClick={() => navigate('/app/kanvas')}
                        className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
                      >
                        Buka Canvas Praktik
                      </button>
                    </div>
                  ) : (
                    <>
                      <label className="block text-xs font-semibold text-ink-4 mb-1.5">Pilih Proyek dari Canvas Praktik</label>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto mb-4">
                        {canvasProjects.map(proj => {
                          const selected = selectedProjectId === proj.id
                          return (
                            <button
                              key={proj.id}
                              type="button"
                              onClick={() => {
                                setSelectedProjectId(proj.id)
                                if (!titleManuallyEdited) {
                                  setNewSessionTitle(`Review: ${proj.name}`)
                                }
                              }}
                              className={clsx(
                                'w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer',
                                selected ? 'border-teal-600 bg-teal-50/70' : 'border-ink-7 hover:border-ink-5'
                              )}
                            >
                              <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0', proj.color)}>
                                {proj.name[0]?.toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-ink truncate">{proj.name}</div>
                                <div className="text-[10px] text-ink-5">{proj.layers.length} layers · {proj.date}</div>
                              </div>
                              {selected && <Check size={14} className="text-teal-600 shrink-0" />}
                            </button>
                          )
                        })}
                      </div>

                      <label className="block text-xs font-semibold text-ink-4 mb-1.5">Judul Sesi</label>
                      <input
                        autoFocus
                        value={newSessionTitle}
                        onChange={e => {
                          setNewSessionTitle(e.target.value)
                          setTitleManuallyEdited(true)
                        }}
                        onKeyDown={e => e.key === 'Enter' && createSession()}
                        className="w-full px-3 py-2.5 rounded-xl border border-ink-7 text-sm outline-none focus:border-teal-600 transition-colors mb-4"
                        placeholder="Contoh: Review Wireframe Homepage"
                      />
                      <button
                        onClick={createSession}
                        className="w-full py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
                      >
                        Mulai Sesi
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  /* ════════════════════════════════════════════
   *  ACTIVE SESSION
   * ════════════════════════════════════════════ */
  return (
    <div className="flex flex-col h-screen w-screen fixed inset-0 bg-white z-50">
      {/* ─── Room Header ─── */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-white border-b border-ink-7 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors shrink-0 cursor-pointer"
            aria-label="Kembali ke daftar sesi"
          >
            <ChevronLeft size={16} />
          </button>
          <img
            src="/logo-iti.png"
            alt="Institut Teknologi Indonesia"
            title="Institut Teknologi Indonesia"
            className="w-6 h-6 object-contain select-none shrink-0"
          />
          <span className="w-px h-5 bg-ink-7 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold truncate">{activeSession.title}</h1>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-4 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,.5)] animate-pulse-dot" />
                Live Session
              </span>
              {linkedProject && (
                <>
                  <span className="text-ink-5 hidden sm:inline">·</span>
                  <span className="hidden sm:inline font-medium text-ink-3 truncate max-w-[180px]">
                    Canvas: {linkedProject.name} ({linkedProject.layers.length} layers)
                  </span>
                </>
              )}
              <span className="text-ink-5 hidden sm:inline">·</span>
              <span className="hidden sm:inline">{participants.length} peserta</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {linkedProject && (
            <button
              onClick={() => navigate(`/app/kanvas?project=${linkedProject.id}`)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-ink-7 text-[11px] font-semibold text-ink-3 hover:border-teal-600 hover:text-teal-600 transition-colors cursor-pointer"
              title="Buka dan edit desain ini di Canvas Praktik"
            >
              <Palette size={13} />
              <span className="hidden sm:inline">Edit di Canvas</span>
            </button>
          )}
          <div className="hidden sm:flex items-center">
            {participants.map((p, i) => (
              <div
                key={p.name}
                className={clsx(
                  'w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold relative border-2 border-white',
                  i > 0 && '-ml-1'
                )}
                style={{ background: p.bg }}
                title={p.name}
              >
                {p.letter}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border-[1.5px] border-white" />
              </div>
            ))}
            <button
              onClick={() => setShowInvite(true)}
              className="w-7 h-7 rounded-lg border-[1.5px] border-dashed border-ink-5 flex items-center justify-center text-ink-5 ml-1 hover:border-teal-600 hover:text-teal-600 transition-colors cursor-pointer"
              title="Undang peserta"
              aria-label="Undang peserta"
            >
              <UserPlus size={14} />
            </button>
          </div>
          <button
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-ink-4 hover:bg-ink-8 cursor-pointer"
            onClick={() => setShowPanel(!showPanel)}
            title="Toggle panel"
          >
            <MessageSquare size={14} />
          </button>
          <button
            onClick={handleEndSession}
            className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-red-500/[.08] text-red-500 hover:bg-red-500/15 transition-colors cursor-pointer"
          >
            Akhiri Sesi
          </button>
        </div>
      </header>

      {/* ─── Content ─── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* ─── Preview Area ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-white border-b border-ink-7 shrink-0">
            <div className="flex gap-0.5">
              {(['desktop', 'tablet', 'mobile'] as DeviceMode[]).map(d => {
                const Icon = deviceIcons[d]
                return (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    className={clsx(
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer',
                      device === d ? 'bg-teal-600/[.08] text-teal-600' : 'text-ink-4 hover:bg-ink-8 hover:text-ink'
                    )}
                  >
                    <Icon size={14} />
                    <span className="hidden sm:inline capitalize">{d}</span>
                  </button>
                )
              })}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (isAddingPin) {
                    cancelAddPin()
                  } else {
                    setIsAddingPin(true)
                    info('Mode Pin Aktif', 'Klik di atas desain canvas untuk menambahkan pin komentar.')
                  }
                }}
                className={clsx(
                  'flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer',
                  isAddingPin ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300' : 'text-ink-4 hover:bg-ink-8 hover:text-ink'
                )}
                title="Tambah pin komentar"
              >
                <MapPin size={14} />
                <span className="hidden sm:inline">{isAddingPin ? 'Batal Pin' : 'Tambah Pin'}</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className={clsx(
                  'relative w-[30px] h-[30px] rounded-md flex items-center justify-center transition-colors cursor-pointer',
                  showComments ? 'text-teal-600 bg-teal-600/[.08]' : 'text-ink-4 hover:bg-ink-8 hover:text-ink'
                )}
                title="Toggle komentar"
              >
                <MessageSquare size={14} />
                {unresolvedCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-teal-600 text-white text-[8px] font-bold flex items-center justify-center">{unresolvedCount}</span>
                )}
              </button>
              <button
                className="w-[30px] h-[30px] rounded-md flex items-center justify-center text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors cursor-pointer"
                title="Review & Voting"
                onClick={() => { setPanelTab('votes'); setShowPanel(true) }}
              >
                <ThumbsUp size={14} />
              </button>
            </div>
          </div>

          {/* Design Viewport */}
          <div className="flex-1 overflow-auto bg-ink-8 flex items-center justify-center p-4 sm:p-8 relative">
            {isAddingPin && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg shadow-lg animate-pulse">
                Klik di atas artboard untuk menaruh pin
              </div>
            )}

            {!linkedProject ? (
              <div className="bg-white rounded-xl border border-ink-7 p-8 text-center max-w-sm shadow-sm">
                <Layers className="w-8 h-8 text-ink-5 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-ink mb-1">Proyek Canvas Tidak Ditemukan</h3>
                <p className="text-xs text-ink-4 leading-relaxed mb-4">
                  Proyek terkait sesi ini sudah dihapus atau belum tersimpan di Canvas Praktik.
                </p>
                <button
                  onClick={() => navigate('/app/kanvas')}
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
                >
                  Buka Canvas Praktik
                </button>
              </div>
            ) : (
              <motion.div
                className={clsx(
                  'w-full bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.04)] transition-all duration-300',
                  deviceWidth,
                  isAddingPin && 'ring-2 ring-purple-400 ring-offset-2'
                )}
                layout
              >
                {/* Artboard Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-7 bg-ink-9/50 rounded-t-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={clsx('w-2.5 h-2.5 rounded-sm shrink-0', linkedProject.color)} />
                    <span className="text-xs font-semibold text-ink truncate">{linkedProject.name}</span>
                    <span className="text-[10px] text-ink-5 shrink-0">· {linkedProject.layers.length} layers</span>
                  </div>
                  <button
                    onClick={() => navigate(`/app/kanvas?project=${linkedProject.id}`)}
                    className="text-[11px] font-semibold text-teal-600 hover:underline shrink-0 cursor-pointer"
                  >
                    Edit di Canvas
                  </button>
                </div>

                {/* Artboard Preview + Overlay Pins */}
                <div
                  ref={previewRef}
                  onClick={handlePreviewClick}
                  className={clsx('relative rounded-b-xl', isAddingPin && 'cursor-crosshair')}
                >
                  <ArtboardPreview
                    layers={linkedProject.layers}
                    emptyMessage='Artboard masih kosong. Klik "Edit di Canvas" untuk menambahkan Frame, Text, atau Path.'
                  />

                  {/* Pending pin marker */}
                  {pendingPinPos && (
                    <div className="absolute z-20" style={{ top: pendingPinPos.y, left: pendingPinPos.x }}>
                      <div className="w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                        ?
                      </div>
                    </div>
                  )}

                  {/* Comment Pins */}
                  <AnimatePresence>
                    {showComments && commentPins.map(pin => (
                      <motion.div
                        key={pin.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute z-10 cursor-pointer group -translate-x-1/2 -translate-y-1/2"
                        style={{ top: pin.y, left: pin.x }}
                        onClick={e => { e.stopPropagation(); setActivePin(activePin === pin.id ? null : pin.id) }}
                      >
                        <div className={clsx(
                          'w-[22px] h-[22px] rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-md transition-transform group-hover:scale-110',
                          pin.resolved ? 'bg-green-500 shadow-green-500/30' : 'bg-purple-600 shadow-purple-600/30'
                        )}>
                          {pin.resolved ? '\u2713' : pin.id}
                        </div>

                        {/* Pin Popup */}
                        <AnimatePresence>
                          {activePin === pin.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 4 }}
                              className="absolute z-20"
                              style={{
                                bottom: 'calc(100% + 8px)',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 280,
                                maxWidth: 'calc(100vw - 32px)',
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <div className="bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,.12)] border border-ink-7/50">
                                <div className="p-3">
                                  <div className="flex items-center gap-1.5 mb-1.5">
                                    <span className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background: pin.avatarBg }}>{pin.letter}</span>
                                    <strong className="text-[11px]">{pin.author}</strong>
                                    <time className="text-[9px] text-ink-4 ml-auto">{pin.time}</time>
                                  </div>
                                  <p className="text-[11px] leading-relaxed text-ink-4">{pin.text}</p>

                                  {pin.replies.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-ink-7 space-y-2">
                                      {pin.replies.map((r, i) => (
                                        <div key={i}>
                                          <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="w-[16px] h-[16px] rounded-[4px] flex items-center justify-center text-white text-[7px] font-bold shrink-0" style={{ background: r.avatarBg }}>{r.letter}</span>
                                            <strong className="text-[10px]">{r.author}</strong>
                                            <time className="text-[8px] text-ink-4 ml-auto">{r.time}</time>
                                          </div>
                                          <p className="text-[10px] leading-relaxed text-ink-4 ml-5">{r.text}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {replyingToPinId === pin.id && (
                                    <div className="mt-2 pt-2 border-t border-ink-7">
                                      <div className="flex gap-1">
                                        <input
                                          autoFocus
                                          value={pinReplyText}
                                          onChange={e => setPinReplyText(e.target.value)}
                                          onKeyDown={e => { if (e.key === 'Enter') submitPinReply(pin.id); if (e.key === 'Escape') { setReplyingToPinId(null); setPinReplyText('') } }}
                                          placeholder="Tulis balasan..."
                                          className="flex-1 px-2 py-1 border border-ink-7 rounded-md text-[10px] outline-none focus:border-teal-600"
                                        />
                                        <button
                                          onClick={() => submitPinReply(pin.id)}
                                          className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 cursor-pointer"
                                        >
                                          <Send size={10} />
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1 mt-2 pt-2 border-t border-ink-7">
                                    <button
                                      onClick={() => toggleResolvePin(pin.id)}
                                      className={clsx(
                                        'flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold transition-colors cursor-pointer',
                                        pin.resolved
                                          ? 'bg-green-500/[.08] text-green-600 hover:bg-green-500/15'
                                          : 'bg-ink-9 text-ink-4 hover:bg-ink-8 hover:text-ink'
                                      )}
                                    >
                                      <Check size={10} /> {pin.resolved ? 'Resolved' : 'Resolve'}
                                    </button>
                                    <button
                                      onClick={() => { setReplyingToPinId(replyingToPinId === pin.id ? null : pin.id); setPinReplyText('') }}
                                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold bg-ink-9 text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors cursor-pointer"
                                    >
                                      <Reply size={10} /> Balas
                                    </button>
                                    <button
                                      onClick={() => deletePin(pin.id)}
                                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold text-red-500 hover:bg-red-50 transition-colors ml-auto cursor-pointer"
                                      aria-label="Hapus pin"
                                    >
                                      <Trash2 size={10} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-white" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>

          {/* Pending pin input bar */}
          <AnimatePresence>
            {pendingPinPos && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="shrink-0 px-4 py-2.5 bg-white border-t border-purple-200 flex gap-2 items-center"
              >
                <MapPin size={14} className="text-purple-600 shrink-0" />
                <input
                  autoFocus
                  value={newPinText}
                  onChange={e => setNewPinText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmAddPin(); if (e.key === 'Escape') cancelAddPin() }}
                  placeholder="Tulis komentar untuk pin ini..."
                  className="flex-1 px-3 py-1.5 border border-ink-7 rounded-lg text-xs outline-none focus:border-purple-500 transition-colors"
                />
                <button onClick={confirmAddPin} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
                  Pin
                </button>
                <button onClick={cancelAddPin} className="px-2 py-1.5 text-xs text-ink-4 hover:text-ink transition-colors cursor-pointer">
                  Batal
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Collab Panel ─── */}
        <AnimatePresence>
          {showPanel && (
            <motion.aside
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full lg:w-80 border-l border-ink-7 bg-white flex flex-col shrink-0 absolute lg:relative right-0 top-0 bottom-0 z-30 lg:z-auto"
            >
              {/* Tabs */}
              <div className="flex p-1 gap-0.5 border-b border-ink-7">
                {([
                  { key: 'chat' as PanelTab, label: 'Chat' },
                  { key: 'activity' as PanelTab, label: 'Activity' },
                  { key: 'votes' as PanelTab, label: 'Voting' },
                ]).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setPanelTab(t.key)}
                    className={clsx(
                      'flex-1 py-2 rounded-md text-[11px] font-semibold text-center transition-colors cursor-pointer',
                      panelTab === t.key ? 'bg-teal-600/[.08] text-teal-600' : 'text-ink-4 hover:bg-ink-8 hover:text-ink'
                    )}
                  >
                    {t.label}
                    {t.key === 'activity' && activity.length > 0 && (
                      <span className="ml-1 text-[8px] bg-ink-8 px-1 py-0.5 rounded-full">{activity.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Chat Panel */}
              {panelTab === 'chat' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                    {chat.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx('flex gap-2', msg.system && 'justify-center')}
                      >
                        {msg.system ? (
                          <span className="text-[9px] text-ink-4 px-2.5 py-0.5 bg-ink-8 rounded-full">{msg.text}</span>
                        ) : (
                          <>
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background: msg.avatarBg }}>{msg.avatar}</div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <strong className="text-[11px]">{msg.author}</strong>
                                <time className="text-[9px] text-ink-4">{msg.time}</time>
                              </div>
                              <p className={clsx('text-[11px] leading-relaxed break-words', msg.self ? 'text-teal-600' : 'text-ink-4')}>{msg.text}</p>
                            </div>
                          </>
                        )}
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input */}
                  <div className="p-2.5 border-t border-ink-7">
                    <div className="flex gap-1.5">
                      <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        className="flex-1 px-3 py-2 rounded-lg border border-ink-7 text-xs focus:border-teal-600 outline-none transition-colors"
                        placeholder="Tulis pesan..."
                      />
                      <button
                        onClick={sendMessage}
                        className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors cursor-pointer"
                        aria-label="Kirim pesan"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <button
                        onClick={() => {
                          if (isAddingPin) {
                            cancelAddPin()
                          } else {
                            setIsAddingPin(true)
                            info('Mode Pin Aktif', 'Klik di atas desain canvas untuk menambahkan pin.')
                          }
                        }}
                        className={clsx(
                          'flex items-center gap-1 text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer',
                          isAddingPin ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-ink-4 hover:bg-ink-8 hover:text-ink'
                        )}
                      >
                        <MapPin size={10} /> {isAddingPin ? 'Batal Pin' : 'Tambah Pin di Desain'}
                      </button>
                      <span className="text-[9px] text-ink-5">{commentPins.length} pin</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Panel */}
              {panelTab === 'activity' && (
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
                  {activity.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center text-xs text-ink-4 p-4">
                      Belum ada aktivitas.
                    </div>
                  ) : (
                    activity.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex gap-2 items-start"
                      >
                        <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background: item.avatarBg }}>{item.letter}</span>
                        <div className="min-w-0">
                          <p className="text-[11px]"><strong>{item.author}</strong> {item.text}</p>
                          <time className="text-[9px] text-ink-4 mt-0.5 block">{item.time}</time>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Voting / Design Approval Panel */}
              {panelTab === 'votes' && (
                <div className="p-4 flex-1 overflow-y-auto">
                  <h3 className="text-[13px] font-bold mb-1">Review Status Desain</h3>
                  <p className="text-[11px] text-ink-4 mb-3">
                    Beri penilaian untuk proyek <strong className="text-ink">{linkedProject?.name || 'Canvas'}</strong>.
                  </p>
                  <div className="flex flex-col gap-2.5">
                    <ReviewVoteOption
                      title="Siap Lanjut (Approved)"
                      desc="Layout, hirarki, dan kontras sudah sesuai untuk tahap berikutnya."
                      voted={votes.approve}
                      voterLetter={selfLetter}
                      accent="teal"
                      icon={CheckCircle2}
                      onClick={() => toggleReviewVote('approve')}
                    />
                    <ReviewVoteOption
                      title="Perlu Revisi"
                      desc="Masih ada elemen yang perlu diperbaiki sesuai catatan pin."
                      voted={votes.revision}
                      voterLetter={selfLetter}
                      accent="amber"
                      icon={AlertCircle}
                      onClick={() => toggleReviewVote('revision')}
                    />
                  </div>
                </div>
              )}
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Invite Modal ─── */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 flex items-center justify-center z-[100]"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-[400px] max-w-[90vw] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,.15)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-7">
                <h3 className="text-sm font-bold">Undang Peserta</h3>
                <button onClick={() => setShowInvite(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <label className="block text-[11px] font-semibold text-ink-4 mb-1.5">Link kolaborasi proyek</label>
                <div className="flex gap-1.5">
                  <input
                    readOnly
                    value={linkedProject ? `${window.location.origin}/app/kolaborasi?project=${linkedProject.id}` : `${window.location.origin}/app/kolaborasi`}
                    className="flex-1 px-3 py-2 rounded-md border border-ink-7 text-[11px] text-ink-4 outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className={clsx(
                      'px-3.5 py-2 rounded-md text-[11px] font-semibold text-white transition-colors cursor-pointer',
                      copied ? 'bg-green-500' : 'bg-teal-600 hover:bg-teal-700'
                    )}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <label className="block text-[11px] font-semibold text-ink-4 mb-1.5 mt-4">Atau undang via email</label>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()}
                  className="w-full px-3 py-2 rounded-md border border-ink-7 text-[11px] mb-2.5 outline-none focus:border-teal-600 transition-colors"
                  placeholder="email@example.com"
                />
                <button
                  onClick={handleSendInvite}
                  className="w-full py-2.5 rounded-md bg-ink text-white text-xs font-semibold hover:bg-ink-2 transition-colors cursor-pointer"
                >
                  Kirim Undangan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Review Vote Card ─── */
function ReviewVoteOption({
  title,
  desc,
  voted,
  voterLetter,
  accent,
  icon: Icon,
  onClick,
}: {
  title: string
  desc: string
  voted: boolean
  voterLetter: string
  accent: 'teal' | 'amber'
  icon: typeof CheckCircle2
  onClick: () => void
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={clsx(
        'border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md',
        voted
          ? accent === 'teal'
            ? 'border-teal-600 bg-teal-50/50'
            : 'border-amber-500 bg-amber-50/50'
          : 'border-ink-7 hover:border-ink-5'
      )}
    >
      <div className="flex items-start gap-2.5 mb-2">
        <div
          className={clsx(
            'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
            accent === 'teal' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
          )}
        >
          <Icon size={15} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-ink">{title}</div>
          <p className="text-[10px] text-ink-4 leading-relaxed mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-ink-8">
        <div className="flex-1 h-1 rounded-full bg-ink-7 overflow-hidden">
          <motion.div
            className={clsx('h-full rounded-full', accent === 'teal' ? 'bg-teal-600' : 'bg-amber-500')}
            initial={{ width: 0 }}
            animate={{ width: voted ? '100%' : '0%' }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] font-bold w-8 text-right">{voted ? '1' : '0'}</span>
        {voted && (
          <span className="w-4 h-4 rounded bg-teal-600 text-white text-[7px] font-bold flex items-center justify-center">
            {voterLetter}
          </span>
        )}
      </div>
    </motion.div>
  )
}
