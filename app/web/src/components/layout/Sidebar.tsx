import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Palette, Users, ChevronRight, LogOut } from 'lucide-react'
import { useSidebarStore } from '../../store/sidebarStore'
import { useAuthStore } from '../../store/authStore'
import clsx from 'clsx'

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', tooltip: 'Dashboard', tourId: undefined as string | undefined },
  { to: '/app/modul', icon: BookOpen, label: 'Modul Belajar', tooltip: 'Modul Belajar', tourId: undefined as string | undefined },
  { to: '/app/kanvas', icon: Palette, label: 'Canvas Praktik', tooltip: 'Canvas', tourId: 'sidebar-canvas' },
  { to: '/app/kolaborasi', icon: Users, label: 'Kolaborasi', tooltip: 'Kolaborasi', tourId: 'sidebar-collab' },
]

export default function Sidebar() {
  const { expanded, toggle } = useSidebarStore()
  const profile = useAuthStore((s) => s.profile)
  const displayName = useAuthStore((s) => s.displayName)
  const initials = useAuthStore((s) => s.initials)
  const signOut = useAuthStore((s) => s.signOut)
  const location = useLocation()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/auth')
  }

  return (
    <aside
      role="navigation"
      aria-label="Menu navigasi utama"
      className={clsx(
        'fixed top-0 left-0 bottom-0 z-10 flex flex-col bg-white border-r border-ink-7 transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)] overflow-hidden',
        expanded ? 'w-60 shadow-[4px_0_24px_rgba(15,23,42,.04)]' : 'w-14'
      )}
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center px-3.5 py-4 min-h-[52px] border-b border-ink-7 mb-2 text-xl font-extrabold tracking-tighter text-ink hover:text-teal-600 transition-colors no-underline"
      >
        n
        <span
          className={clsx(
            'font-extrabold tracking-tighter transition-all duration-300 overflow-hidden',
            expanded ? 'max-w-[120px]' : 'max-w-0'
          )}
        >
          odes
        </span>
        <span className="text-teal-600">.</span>
      </Link>

      {/* Section label */}
      <div
        className={clsx(
          'text-[0.5625rem] font-bold tracking-widest uppercase text-ink-5 px-[18px] transition-all duration-200 overflow-hidden',
          expanded ? 'opacity-100 h-auto pt-3 pb-1.5' : 'opacity-0 h-0'
        )}
      >
        Menu
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto overflow-x-hidden min-h-0">
        {navItems.map((item) => {
          const isActive = item.to === '/app'
            ? location.pathname === '/app'
            : location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              {...(item.tourId ? { 'data-tour': item.tourId } : {})}
              className={clsx(
                'group relative flex items-center gap-3 h-10 min-h-[40px] rounded-[10px] px-2 text-[0.8125rem] font-medium whitespace-nowrap transition-all duration-150 no-underline',
                isActive
                  ? 'text-teal-600! bg-teal-50! font-semibold'
                  : 'text-ink-4! hover:text-ink-2! hover:bg-ink-8'
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-[3px] bg-teal-600" />
              )}
              <item.icon className="w-5 h-5 flex-shrink-0 stroke-current" strokeWidth={1.8} />
              <span
                className={clsx(
                  'text-[0.8125rem] font-inherit transition-opacity duration-150',
                  expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
              >
                {item.label}
              </span>
              {/* Tooltip (collapsed only) */}
              {!expanded && (
                <div className="absolute left-[calc(3.5rem+4px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-ink text-white text-[0.6875rem] font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-20">
                  {item.tooltip}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-0.5 px-2 border-t border-ink-7 pt-2 mt-2">
        {/* Toggle */}
        <button
          onClick={toggle}
          aria-label={expanded ? 'Tutup sidebar' : 'Buka sidebar'}
          aria-expanded={expanded}
          className={clsx(
            'flex items-center justify-center gap-2.5 h-9 min-h-[36px] rounded-[10px] text-ink-4 hover:text-teal-600 hover:bg-ink-8 transition-all duration-150 cursor-pointer',
            expanded
              ? 'w-full justify-start px-2.5 border-none bg-transparent'
              : 'w-9 mx-auto mb-1 border-[1.5px] border-ink-7 bg-white'
          )}
        >
          <ChevronRight
            className={clsx('w-[18px] h-[18px] flex-shrink-0 transition-transform duration-300', expanded && 'rotate-180')}
          />
          {expanded && <span className="text-xs font-semibold">Tutup Menu</span>}
        </button>

        <div className="h-px bg-ink-7 mx-3.5 my-1" />

        {/* Avatar */}
        <Link
          to="/app/profil"
          data-tour="sidebar-profile"
          className="group flex items-center gap-2.5 px-2 py-2 rounded-[10px] hover:bg-ink-8 transition-colors whitespace-nowrap overflow-hidden no-underline"
        >
          <div className="w-8 h-8 rounded-[10px] bg-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials()}
          </div>
          <div
            className={clsx(
              'flex flex-col transition-opacity duration-150',
              expanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
          >
            <span className="text-xs font-bold text-ink leading-tight">{displayName()}</span>
            <span className="text-[0.625rem] text-ink-5 leading-tight">{profile?.role || 'Mahasiswa'}</span>
          </div>
          {!expanded && (
            <div className="absolute left-[calc(3.5rem+4px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-ink text-white text-[0.6875rem] font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-20">
              Profil
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={clsx(
            'group relative flex items-center gap-2.5 h-9 min-h-[36px] rounded-[10px] text-ink-4 hover:text-red-500 hover:bg-red-50 transition-all duration-150 cursor-pointer mb-2',
            expanded
              ? 'w-full px-2.5'
              : 'w-9 mx-auto justify-center'
          )}
          aria-label="Keluar"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.8} />
          {expanded && <span className="text-xs font-semibold">Keluar</span>}
          {!expanded && (
            <div className="absolute left-[calc(3.5rem+4px)] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-ink text-white text-[0.6875rem] font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-lg z-20">
              Keluar
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
