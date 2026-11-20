import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import CatMascot from '../ui/CatMascot'
import OnboardingTour from '../ui/OnboardingTour'
import { useSidebarStore } from '../../store/sidebarStore'
import clsx from 'clsx'

export default function AppLayout() {
  const expanded = useSidebarStore((s) => s.expanded)

  return (
    <div className="min-h-screen bg-white">
      {/* WCAG: Skip-to-content link */}
      <a href="#main-content" className="skip-link">
        Langsung ke konten utama
      </a>
      <Sidebar />
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
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
      <CatMascot />
      <OnboardingTour />
    </div>
  )
}
