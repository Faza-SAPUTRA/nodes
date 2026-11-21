import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Menu, BookOpen } from 'lucide-react'
import { useSidebarStore } from '../../store/sidebarStore'
import { modulesData } from '../../data/modules'
import { AnimatePresence, motion } from 'framer-motion'

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

interface NotifItem {
  id: number
  title: string
  desc: string
  time: string
  unread: boolean
}

function getInitialNotifications(): NotifItem[] {
  try {
    const saved = localStorage.getItem('nodes-notifications')
    if (saved) return JSON.parse(saved)
  } catch { /* ignore */ }
  return []
}

export default function Topbar() {
  const toggle = useSidebarStore((s) => s.toggle)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [notifItems, setNotifItems] = useState<NotifItem[]>(getInitialNotifications)
  const notifRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifItems.filter((n) => n.unread).length

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return modulesData
      .filter((m) => m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q))
      .slice(0, 5)
  }, [searchQuery])

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchFocused(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const input = searchRef.current?.querySelector('input')
        input?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  function handleSearchSelect(slug: string) {
    setSearchQuery('')
    setSearchFocused(false)
    navigate(`/app/modul/${slug}`)
  }

  function markAllRead() {
    setNotifItems((prev) => {
      const updated = prev.map((n) => ({ ...n, unread: false }))
      localStorage.setItem('nodes-notifications', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-ink-7" role="banner">
      {/* Mobile menu toggle */}
      <button
        onClick={toggle}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-ink-8 text-ink-4 transition-colors cursor-pointer"
        aria-label="Buka menu navigasi"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md" data-tour="search">
        <div className="flex items-center gap-2 px-3 py-2 bg-ink-9 border border-ink-7 rounded-xl text-ink-4 transition-colors focus-within:border-teal-600 focus-within:bg-white">
          <Search className="w-4 h-4 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Cari modul, materi, atau proyek..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-ink placeholder:text-ink-5"
            aria-label="Cari modul, materi, atau proyek"
            role="searchbox"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-ink-7 rounded text-[0.625rem] font-medium text-ink-5">
            ⌘K
          </kbd>
        </div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {searchFocused && searchQuery.trim() && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-ink-7 rounded-xl shadow-xl overflow-hidden z-50"
            >
              {searchResults.length > 0 ? (
                <div className="py-1">
                  {searchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSearchSelect(slugify(m.title))}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-ink-9 transition-colors cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-ink truncate">{m.title}</div>
                        <div className="text-xs text-ink-5 truncate">Sesi {m.num} · {m.duration}</div>
                      </div>
                      <span className="text-[0.625rem] px-2 py-0.5 bg-ink-9 text-ink-5 rounded-full font-medium flex-shrink-0">
                        {m.tags[0]}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <Search className="w-6 h-6 text-ink-5 mx-auto mb-2" />
                  <p className="text-sm text-ink-4">Tidak ada hasil untuk "{searchQuery}"</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-ink-8 text-ink-4 transition-colors cursor-pointer"
            aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
            aria-expanded={showNotif}
            aria-haspopup="true"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white border border-ink-7 rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-ink-7">
                  <h3 className="text-sm font-bold text-ink">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-teal-600 font-medium hover:underline cursor-pointer">
                      Tandai semua dibaca
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto">
                  {notifItems.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <Bell className="w-6 h-6 text-ink-5 mx-auto mb-2" />
                      <p className="text-xs text-ink-4">Belum ada notifikasi.</p>
                    </div>
                  ) : (
                  notifItems.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 hover:bg-ink-9 transition-colors border-b border-ink-8 last:border-0 ${
                        n.unread ? 'bg-teal-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.unread && <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-teal-600 flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-ink">{n.title}</p>
                          <p className="text-xs text-ink-4 mt-0.5">{n.desc}</p>
                          <span className="text-[0.625rem] text-ink-5 mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
