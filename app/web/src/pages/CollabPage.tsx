import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, Monitor, Tablet, Smartphone,
  MessageSquare, ThumbsUp, UserPlus,
  Send, X, MapPin, Check, Reply, Trash2,
} from 'lucide-react'
import clsx from 'clsx'
import { useToast } from '../components/ui/Toast'

/* ─── Types ─── */
interface ChatMessage {
  id: string
  author: string
  avatar: string
  avatarBg: string
  text: string
  time: string
  self?: boolean
  system?: boolean
}

interface CommentPin {
  id: number
  x: string
  y: string
  author: string
  avatarBg: string
  letter: string
  time: string
  text: string
  replies: { author: string; avatarBg: string; letter: string; time: string; text: string }[]
  resolved: boolean
}

interface ActivityItem {
  id: number
  author: string
  avatarBg: string
  letter: string
  text: string
  time: string
}

/* ─── Data ─── */
const participants = [
  { name: 'Budi', letter: 'B', bg: '#7C3AED' },
  { name: 'Sari', letter: 'S', bg: '#EC4899' },
  { name: 'Kamu', letter: 'AP', bg: '#0D9488', isYou: true },
]

const initialChat: ChatMessage[] = [
  { id: '0', author: '', avatar: '', avatarBg: '', text: 'Sesi review dimulai — 12 menit lalu', time: '', system: true },
  { id: '1', author: 'Budi', avatar: 'B', avatarBg: '#7C3AED', text: 'Oke gua udah liat landing page nya. Overall bagus, cuma ada beberapa note.', time: '10 min' },
  { id: '2', author: 'Sari', avatar: 'S', avatarBg: '#EC4899', text: 'Setuju sama Budi. Gua tambahin pin di headline buat responsive issue.', time: '8 min' },
  { id: '3', author: 'Kamu', avatar: 'AP', avatarBg: '#0D9488', text: 'Noted! Feature cards spacing udah gua fix. Cek pin #3 ya.', time: '6 min', self: true },
  { id: '4', author: 'Budi', avatar: 'B', avatarBg: '#7C3AED', text: 'Nice fix! Sekarang yang navbar CTA gimana? Mau ganti warna?', time: '3 min' },
  { id: '5', author: 'Kamu', avatar: 'AP', avatarBg: '#0D9488', text: 'Iya gua ganti ke teal gradient. Bentar ya.', time: '1 min', self: true },
]

const initialPins: CommentPin[] = [
  {
    id: 1, x: '75%', y: '18%', author: 'Budi', avatarBg: '#7C3AED', letter: 'B', time: '2 min lalu',
    text: 'CTA button "Get Started" kurang kontras sama background navbar. Coba pake warna yang lebih bold.',
    replies: [{ author: 'Kamu', avatarBg: '#0D9488', letter: 'AP', time: '1 min lalu', text: 'Setuju, ganti ke teal gradient aja ya?' }],
    resolved: false,
  },
  { id: 2, x: '35%', y: '42%', author: 'Sari', avatarBg: '#EC4899', letter: 'S', time: '5 min lalu', text: 'Headline font size terlalu besar di mobile. Kurangin ke 2.5rem buat responsive.', replies: [], resolved: false },
  { id: 3, x: '50%', y: '85%', author: 'Kamu', avatarBg: '#0D9488', letter: 'AP', time: '8 min lalu', text: 'Feature cards spacing udah di-fix. Gap sekarang 24px.', replies: [], resolved: true },
]

const initialActivity: ActivityItem[] = [
  { id: 1, author: 'Kamu', avatarBg: '#0D9488', letter: 'AP', text: 'resolved komentar #3', time: '8 min lalu' },
  { id: 2, author: 'Sari', avatarBg: '#EC4899', letter: 'S', text: 'menambahkan pin #2', time: '5 min lalu' },
  { id: 3, author: 'Budi', avatarBg: '#7C3AED', letter: 'B', text: 'menambahkan pin #1', time: '2 min lalu' },
  { id: 4, author: 'Kamu', avatarBg: '#0D9488', letter: 'AP', text: 'membalas komentar #1', time: '1 min lalu' },
  { id: 5, author: 'Budi', avatarBg: '#7C3AED', letter: 'B', text: 'mengirim pesan di chat', time: '3 min lalu' },
]

type DeviceMode = 'desktop' | 'tablet' | 'mobile'
type PanelTab = 'chat' | 'activity' | 'votes'

const deviceIcons = { desktop: Monitor, tablet: Tablet, mobile: Smartphone }

const replyPool = [
  { name: 'Budi', av: '#7C3AED', letter: 'B', texts: ['Mantap, lanjutin terus! 🔥', 'Oke noted, gua cek dulu ya.', 'Setuju banget sama perubahan ini.', 'Nice, lebih clean sekarang!'] },
  { name: 'Sari', av: '#EC4899', letter: 'S', texts: ['Keren! Tinggal responsive aja nih.', 'Warnanya udah bagus menurut gua.', 'Coba tambahin hover state juga.', 'Sip, udah gua mark di pin.'] },
]

function escapeHtml(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

let nextPinId = 10
let nextActivityId = 100

/* ─── Component ─── */
export default function CollabPage() {
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [panelTab, setPanelTab] = useState<PanelTab>('chat')
  const [showComments, setShowComments] = useState(true)
  const [activePin, setActivePin] = useState<number | null>(null)
  const [chat, setChat] = useState<ChatMessage[]>(initialChat)
  const [input, setInput] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [copied, setCopied] = useState(false)
  const [showPanel, setShowPanel] = useState(true)

  // Interactive pins
  const [commentPins, setCommentPins] = useState<CommentPin[]>(initialPins)
  const [isAddingPin, setIsAddingPin] = useState(false)
  const [newPinText, setNewPinText] = useState('')
  const [pendingPinPos, setPendingPinPos] = useState<{ x: string; y: string } | null>(null)

  // Reply to pin
  const [replyingToPinId, setReplyingToPinId] = useState<number | null>(null)
  const [pinReplyText, setPinReplyText] = useState('')

  // Activity feed
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { success, info, warning } = useToast()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat])

  /* ─── Add activity ─── */
  function addActivity(text: string) {
    const item: ActivityItem = {
      id: nextActivityId++,
      author: 'Kamu',
      avatarBg: '#0D9488',
      letter: 'AP',
      text,
      time: 'baru saja',
    }
    setActivity(prev => [item, ...prev])
  }

  /* ─── Chat ─── */
  function sendMessage() {
    const text = input.trim()
    if (!text) return
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      author: 'Kamu', avatar: 'AP', avatarBg: '#0D9488',
      text: escapeHtml(text), time: 'baru saja', self: true,
    }
    setChat(prev => [...prev, newMsg])
    setInput('')
    addActivity('mengirim pesan di chat')

    // Simulate reply
    setTimeout(() => {
      const replier = replyPool[Math.floor(Math.random() * replyPool.length)]
      const replyText = replier.texts[Math.floor(Math.random() * replier.texts.length)]
      setChat(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        author: replier.name, avatar: replier.letter, avatarBg: replier.av,
        text: replyText, time: 'baru saja',
      }])
    }, 1500 + Math.random() * 2000)
  }

  /* ─── Pin: click on preview to add ─── */
  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!isAddingPin) return
    if (!previewRef.current) return
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
    const newPin: CommentPin = {
      id: nextPinId++,
      x: pendingPinPos.x,
      y: pendingPinPos.y,
      author: 'Kamu',
      avatarBg: '#0D9488',
      letter: 'AP',
      time: 'baru saja',
      text: newPinText.trim(),
      replies: [],
      resolved: false,
    }
    setCommentPins(prev => [...prev, newPin])
    addActivity(`menambahkan pin #${newPin.id}`)
    success('Pin Ditambahkan! 📌', `Komentar berhasil ditambahkan di preview.`)
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
    setCommentPins(prev => prev.map(p => {
      if (p.id !== pinId) return p
      const newResolved = !p.resolved
      addActivity(newResolved ? `resolved komentar #${p.id}` : `unresolve komentar #${p.id}`)
      return { ...p, resolved: newResolved }
    }))
  }

  /* ─── Pin: delete ─── */
  function deletePin(pinId: number) {
    setCommentPins(prev => prev.filter(p => p.id !== pinId))
    setActivePin(null)
    addActivity(`menghapus pin #${pinId}`)
    info('Pin Dihapus', `Pin #${pinId} berhasil dihapus.`)
  }

  /* ─── Pin: reply ─── */
  function submitPinReply(pinId: number) {
    if (!pinReplyText.trim()) return
    setCommentPins(prev => prev.map(p => {
      if (p.id !== pinId) return p
      return {
        ...p,
        replies: [...p.replies, {
          author: 'Kamu',
          avatarBg: '#0D9488',
          letter: 'AP',
          time: 'baru saja',
          text: pinReplyText.trim(),
        }],
      }
    }))
    addActivity(`membalas komentar #${pinId}`)
    setPinReplyText('')
    setReplyingToPinId(null)

    // Simulate bot reply to pin
    setTimeout(() => {
      const replier = replyPool[Math.floor(Math.random() * replyPool.length)]
      const replyText = replier.texts[Math.floor(Math.random() * replier.texts.length)]
      setCommentPins(prev => prev.map(p => {
        if (p.id !== pinId) return p
        return {
          ...p,
          replies: [...p.replies, {
            author: replier.name,
            avatarBg: replier.av,
            letter: replier.letter,
            time: 'baru saja',
            text: replyText,
          }],
        }
      }))
    }, 2000 + Math.random() * 1500)
  }

  function handleCopy() {
    navigator.clipboard.writeText('https://nodes.app/collab/r3v13w-x7k')
    setCopied(true)
    success('Link Tersalin!', 'Link undangan berhasil disalin ke clipboard.')
    setTimeout(() => setCopied(false), 2000)
  }

  function handleBack() {
    navigate(-1)
  }

  function handleEndSession() {
    info('Sesi Berakhir', 'Sesi kolaborasi telah diakhiri.')
    navigate('/app')
  }

  function handleSendInvite() {
    if (!inviteEmail.trim()) {
      warning('Email Kosong', 'Masukkan alamat email terlebih dahulu.')
      return
    }
    if (!inviteEmail.includes('@')) {
      warning('Email Tidak Valid', 'Masukkan alamat email yang valid.')
      return
    }
    success('Undangan Terkirim! 📩', `Undangan berhasil dikirim ke ${inviteEmail}`)
    addActivity(`mengundang ${inviteEmail}`)
    setInviteEmail('')
  }

  const unresolvedCount = commentPins.filter(p => !p.resolved).length
  const deviceWidth = device === 'desktop' ? 'max-w-[900px]' : device === 'tablet' ? 'max-w-[600px]' : 'max-w-[375px]'

  return (
    <div className="flex flex-col h-screen w-screen fixed inset-0 bg-white z-50">
      {/* ─── Room Header ─── */}
      <header className="flex items-center justify-between px-3 sm:px-5 py-2.5 bg-white border-b border-ink-7 shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleBack}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors shrink-0"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-[15px] font-bold truncate">Review: Design System Components</h1>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-4 mt-0.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold text-teal-600 bg-teal-600/[.06] border border-teal-600/15 whitespace-nowrap">
                📖 Sesi 9 · Design System
              </span>
              <span className="text-ink-5">·</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,.5)] animate-pulse-dot" />
                Live Session
              </span>
              <span className="text-ink-5 hidden sm:inline">·</span>
              <span className="hidden sm:inline">Dimulai 12 menit lalu</span>
              <span className="text-ink-5 hidden sm:inline">·</span>
              <span className="hidden sm:inline">{participants.length} peserta</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
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
              className="w-7 h-7 rounded-lg border-[1.5px] border-dashed border-ink-5 flex items-center justify-center text-ink-5 ml-1 hover:border-teal-600 hover:text-teal-600 transition-colors"
              title="Undang peserta"
            >
              <UserPlus size={14} />
            </button>
          </div>
          <button
            className="lg:hidden w-7 h-7 rounded-lg flex items-center justify-center text-ink-4 hover:bg-ink-8"
            onClick={() => setShowPanel(!showPanel)}
            title="Toggle panel"
          >
            <MessageSquare size={14} />
          </button>
          <button
            onClick={handleEndSession}
            className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-red-500/[.08] text-red-500 hover:bg-red-500/15 transition-colors"
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
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-colors',
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
              {/* Add pin mode toggle */}
              <button
                onClick={() => {
                  if (isAddingPin) {
                    cancelAddPin()
                  } else {
                    setIsAddingPin(true)
                    info('Mode Pin Aktif', 'Klik di preview untuk menambahkan pin komentar.')
                  }
                }}
                className={clsx(
                  'flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-colors',
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
                  'relative w-[30px] h-[30px] rounded-md flex items-center justify-center transition-colors',
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
                className="w-[30px] h-[30px] rounded-md flex items-center justify-center text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors"
                title="Voting"
                onClick={() => { setPanelTab('votes'); setShowPanel(true) }}
              >
                <ThumbsUp size={14} />
              </button>
            </div>
          </div>

          {/* Design Viewport */}
          <div className="flex-1 overflow-auto bg-ink-8 flex items-start justify-center p-4 sm:p-8 relative">
            {/* Adding pin indicator */}
            {isAddingPin && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg shadow-lg animate-pulse">
                📌 Klik di design preview untuk menaruh pin
              </div>
            )}

            <motion.div
              ref={previewRef}
              className={clsx(
                'w-full bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,.06),0_0_0_1px_rgba(0,0,0,.04)] overflow-hidden relative transition-all duration-400',
                deviceWidth,
                isAddingPin && 'ring-2 ring-purple-400 ring-offset-2 cursor-crosshair'
              )}
              layout
              onClick={handlePreviewClick}
            >
              {/* Simulated Landing Page */}
              <div className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-ink-7">
                <span className="text-[15px] font-extrabold">acme.</span>
                <div className="hidden sm:flex gap-4 text-[11px] text-ink-4">
                  <span>Products</span><span>Pricing</span><span>About</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-[5px] text-[10px] font-semibold bg-ink text-white">Get Started</div>
              </div>
              <div className="px-4 sm:px-8 py-10 sm:py-12 bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white text-center">
                <div className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-semibold bg-teal-600/15 text-teal-300 mb-3.5">✨ New Release</div>
                <h2 className="text-xl sm:text-[2rem] font-extrabold leading-tight tracking-tight mb-2.5">Design systems<br />made simple</h2>
                <p className="text-xs text-ink-4 max-w-[360px] mx-auto mb-5 leading-relaxed">Build consistent, beautiful interfaces faster with our comprehensive toolkit.</p>
                <div className="flex justify-center gap-2">
                  <button className="px-5 py-2 rounded-md text-[11px] font-semibold bg-teal-600 text-white">Start Free Trial</button>
                  <button className="px-5 py-2 rounded-md text-[11px] font-medium text-ink-4 border border-ink-3">Watch Demo →</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-8">
                {[
                  { emoji: '⚡', title: 'Lightning Fast', desc: 'Optimized for performance', color: '#7C3AED' },
                  { emoji: '🎨', title: 'Beautiful Design', desc: 'Pixel-perfect components', color: '#0D9488' },
                  { emoji: '🔒', title: 'Secure', desc: 'Enterprise-grade security', color: '#EC4899' },
                ].map(f => (
                  <div key={f.title} className="p-4 rounded-lg border border-ink-7">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm mb-2" style={{ background: `${f.color}15`, color: f.color }}>{f.emoji}</div>
                    <strong className="block text-[11px] mb-0.5">{f.title}</strong>
                    <p className="text-[9px] text-ink-4 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>

              {/* Pending pin position marker */}
              {pendingPinPos && (
                <div
                  className="absolute z-20"
                  style={{ top: pendingPinPos.y, left: pendingPinPos.x }}
                >
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
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
                    className="absolute z-10 cursor-pointer group"
                    style={{ top: pin.y, left: pin.x }}
                    onClick={e => { e.stopPropagation(); setActivePin(activePin === pin.id ? null : pin.id) }}
                  >
                    <div className={clsx(
                      'w-[22px] h-[22px] rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white shadow-md transition-transform group-hover:scale-110',
                      pin.resolved ? 'bg-green-500 shadow-green-500/30' : 'bg-purple-600 shadow-purple-600/30'
                    )}>
                      {pin.resolved ? '✓' : pin.id}
                    </div>

                    {/* Pin Popup */}
                    <AnimatePresence>
                      {activePin === pin.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[280px] bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,.12)] z-20"
                          onClick={e => e.stopPropagation()}
                        >
                          <div className="p-3">
                            {/* Pin header */}
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-white text-[8px] font-bold shrink-0" style={{ background: pin.avatarBg }}>{pin.letter}</span>
                              <strong className="text-[11px]">{pin.author}</strong>
                              <time className="text-[9px] text-ink-4 ml-auto">{pin.time}</time>
                            </div>
                            <p className="text-[11px] leading-relaxed text-ink-4">{pin.text}</p>

                            {/* Replies */}
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

                            {/* Reply input */}
                            {replyingToPinId === pin.id ? (
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
                                    className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700"
                                  >
                                    <Send size={10} />
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            {/* Pin actions */}
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-ink-7">
                              <button
                                onClick={() => toggleResolvePin(pin.id)}
                                className={clsx(
                                  'flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold transition-colors',
                                  pin.resolved
                                    ? 'bg-green-500/[.08] text-green-600 hover:bg-green-500/15'
                                    : 'bg-ink-9 text-ink-4 hover:bg-ink-8 hover:text-ink'
                                )}
                              >
                                <Check size={10} /> {pin.resolved ? 'Resolved' : 'Resolve'}
                              </button>
                              <button
                                onClick={() => { setReplyingToPinId(replyingToPinId === pin.id ? null : pin.id); setPinReplyText('') }}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold bg-ink-9 text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors"
                              >
                                <Reply size={10} /> Balas
                              </button>
                              <button
                                onClick={() => deletePin(pin.id)}
                                className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-semibold text-red-500 hover:bg-red-50 transition-colors ml-auto"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
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
                <button onClick={confirmAddPin} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors">
                  Pin
                </button>
                <button onClick={cancelAddPin} className="px-2 py-1.5 text-xs text-ink-4 hover:text-ink transition-colors">
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
                      'flex-1 py-2 rounded-md text-[11px] font-semibold text-center transition-colors',
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
                        className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center hover:bg-teal-700 transition-colors"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                    <div className="flex gap-1 mt-1.5">
                      <button
                        onClick={() => {
                          if (isAddingPin) {
                            cancelAddPin()
                          } else {
                            setIsAddingPin(true)
                            info('Mode Pin Aktif', 'Klik di preview untuk menambahkan pin.')
                          }
                        }}
                        className={clsx(
                          'text-[9px] px-2 py-0.5 rounded transition-colors',
                          isAddingPin ? 'bg-purple-100 text-purple-700' : 'text-ink-4 hover:bg-ink-8 hover:text-ink'
                        )}
                      >
                        📌 Pin
                      </button>
                      <button className="text-[9px] px-2 py-0.5 rounded text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors">📎 File</button>
                      <button className="text-[9px] px-2 py-0.5 rounded text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors">😊</button>
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

              {/* Voting Panel */}
              {panelTab === 'votes' && (
                <div className="p-4 flex-1 overflow-y-auto">
                  <h3 className="text-[13px] font-bold mb-3">Pilih versi hero yang terbaik</h3>
                  <div className="flex flex-col gap-2.5">
                    <VoteCard
                      label="Versi A — Dark"
                      gradient="linear-gradient(135deg,#0F172A,#1E293B)"
                      initialVotes={2}
                      total={3}
                      voters={[{ letter: 'B', bg: '#7C3AED' }, { letter: 'AP', bg: '#0D9488' }]}
                      onVote={(voted) => addActivity(voted ? 'vote untuk Versi A — Dark' : 'membatalkan vote Versi A')}
                    />
                    <VoteCard
                      label="Versi B — Light"
                      labelColor="#064E3B"
                      gradient="linear-gradient(135deg,#ECFDF5,#D1FAE5)"
                      initialVotes={1}
                      total={3}
                      voters={[{ letter: 'S', bg: '#EC4899' }]}
                      onVote={(voted) => addActivity(voted ? 'vote untuk Versi B — Light' : 'membatalkan vote Versi B')}
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
                <button onClick={() => setShowInvite(false)} className="w-7 h-7 rounded-md flex items-center justify-center text-ink-4 hover:bg-ink-8 hover:text-ink transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <label className="block text-[11px] font-semibold text-ink-4 mb-1.5">Link undangan</label>
                <div className="flex gap-1.5">
                  <input
                    readOnly
                    value="https://nodes.app/collab/r3v13w-x7k"
                    className="flex-1 px-3 py-2 rounded-md border border-ink-7 text-[11px] text-ink-4 outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className={clsx(
                      'px-3.5 py-2 rounded-md text-[11px] font-semibold text-white transition-colors',
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
                  className="w-full py-2.5 rounded-md bg-ink text-white text-xs font-semibold hover:bg-ink-2 transition-colors"
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

/* ─── Vote Card ─── */
function VoteCard({ label, labelColor, gradient, initialVotes, total, voters, onVote }: {
  label: string
  labelColor?: string
  gradient: string
  initialVotes: number
  total: number
  voters: { letter: string; bg: string }[]
  onVote?: (voted: boolean) => void
}) {
  const [voted, setVoted] = useState(false)
  const [votes, setVotes] = useState(initialVotes)
  const pct = Math.round((votes / total) * 100)

  function handleVote() {
    if (voted) {
      setVoted(false)
      setVotes(initialVotes)
      onVote?.(false)
    } else {
      setVoted(true)
      setVotes(initialVotes + 1)
      onVote?.(true)
    }
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={handleVote}
      className={clsx(
        'border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md',
        voted ? 'border-teal-600' : 'border-ink-7 hover:border-teal-600'
      )}
    >
      <div className="h-20 flex items-end p-2" style={{ background: gradient }}>
        <span className="text-[11px] font-bold text-white drop-shadow-md" style={labelColor ? { color: labelColor } : undefined}>{label}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="flex-1 h-1 rounded-full bg-ink-7">
          <motion.div
            className="h-full rounded-full bg-teal-600"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <span className="text-[9px] font-semibold text-ink-4 whitespace-nowrap">{votes} votes</span>
      </div>
      <div className="flex gap-1 px-3 pb-2.5">
        {voters.map((v, i) => (
          <span key={i} className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-white text-[7px] font-bold" style={{ background: v.bg }}>{v.letter}</span>
        ))}
        {voted && (
          <span className="w-[18px] h-[18px] rounded-[5px] flex items-center justify-center text-white text-[7px] font-bold bg-teal-600 ring-1 ring-teal-400">✓</span>
        )}
      </div>
    </motion.div>
  )
}
