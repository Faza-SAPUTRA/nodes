import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useSidebarStore } from '../../store/sidebarStore'
import clsx from 'clsx'

export default function AppLayout() {
  const expanded = useSidebarStore((s) => s.expanded)

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main
        className={clsx(
          'transition-[margin-left] duration-300 ease-[cubic-bezier(.4,0,.2,1)] min-h-screen',
          expanded ? 'ml-60' : 'ml-14',
          'max-lg:!ml-0'
        )}
      >
        <Topbar />
        <div className="p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
