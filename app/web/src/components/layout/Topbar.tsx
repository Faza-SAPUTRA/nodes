import { Search, Bell, Menu } from 'lucide-react'
import { useSidebarStore } from '../../store/sidebarStore'

export default function Topbar() {
  const toggle = useSidebarStore((s) => s.toggle)

  return (
    <header className="sticky top-0 z-[5] flex items-center justify-between gap-4 px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-ink-7">
      {/* Mobile menu toggle */}
      <button
        onClick={toggle}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-ink-8 text-ink-4 transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md flex items-center gap-2 px-3 py-2 bg-ink-9 border border-ink-7 rounded-xl text-ink-4 transition-colors focus-within:border-teal-600 focus-within:bg-white">
        <Search className="w-4 h-4 flex-shrink-0" />
        <input
          type="text"
          placeholder="Cari modul, materi, atau proyek..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-ink placeholder:text-ink-5"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-ink-7 rounded text-[0.625rem] font-medium text-ink-5">
          ⌘K
        </kbd>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-ink-8 text-ink-4 transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
        </button>
      </div>
    </header>
  )
}
