import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/ui/ErrorBoundary'
import AuthGuard from './components/auth/AuthGuard'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import EmailConfirmedPage from './pages/EmailConfirmedPage'
import DashboardPage from './pages/DashboardPage'
import ModulesPage from './pages/ModulesPage'
import ModuleDetailPage from './pages/ModuleDetailPage'
import CanvasPage from './pages/CanvasPage'
import CollabPage from './pages/CollabPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import AppLayout from './components/layout/AppLayout'
import { useAuthStore } from './store/authStore'

/**
 * Detects Supabase auth callback hash fragments and redirects accordingly.
 * After email confirmation, Supabase redirects to: /#access_token=...&type=signup
 * We catch this and redirect to /email-confirmed.
 */
function AuthCallbackHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    // Parse hash fragment
    const params = new URLSearchParams(hash.substring(1))
    const type = params.get('type')
    const accessToken = params.get('access_token')

    // If this is an email confirmation callback
    if (accessToken && (type === 'signup' || type === 'email' || type === 'recovery' || type === 'magiclink')) {
      // Let Supabase client process the token first (it auto-detects hash)
      // Then redirect to our confirmation page
      setTimeout(() => {
        // Clear the hash
        window.history.replaceState(null, '', location.pathname)
        if (type === 'recovery') {
          navigate('/app/profil', { replace: true })
        } else {
          navigate('/email-confirmed', { replace: true })
        }
      }, 500)
    }
  }, [navigate, location.pathname])

  return null
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthCallbackHandler />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/email-confirmed" element={<EmailConfirmedPage />} />
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
