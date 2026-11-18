import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/ui/ErrorBoundary'
import AuthGuard from './components/auth/AuthGuard'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ModulesPage from './pages/ModulesPage'
import ModuleDetailPage from './pages/ModuleDetailPage'
import CanvasPage from './pages/CanvasPage'
import CollabPage from './pages/CollabPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import AppLayout from './components/layout/AppLayout'
import { useAuthStore } from './store/authStore'

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/app" element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="modul" element={<ModulesPage />} />
            <Route path="modul/:slug" element={<ModuleDetailPage />} />
            <Route path="profil" element={<ProfilePage />} />
          </Route>
          {/* Canvas & Collab: full viewport without sidebar/topbar */}
          <Route path="/app/kanvas" element={
            <AuthGuard>
              <CanvasPage />
            </AuthGuard>
          } />
          <Route path="/app/kolaborasi" element={
            <AuthGuard>
              <CollabPage />
            </AuthGuard>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  )
}
