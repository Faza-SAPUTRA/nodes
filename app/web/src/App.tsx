import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import ErrorBoundary from './components/ui/ErrorBoundary'
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

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="modul" element={<ModulesPage />} />
            <Route path="modul/:slug" element={<ModuleDetailPage />} />
            <Route path="kanvas" element={<CanvasPage />} />
            <Route path="kolaborasi" element={<CollabPage />} />
            <Route path="profil" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </ErrorBoundary>
  )
}
