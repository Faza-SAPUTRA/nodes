import { Component, Suspense, lazy } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { ToastProvider } from './components/ui';
import { AppShell } from './components/AppShell';

/** Error boundary: tangkap error React yang tidak terduga dan tampilkan layar darurat. */
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="center" style={{ minHeight: '100vh', padding: '2rem' }}>
          <div className="stack gap-3" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 420 }}>
            <h1 className="h2">Terjadi kesalahan</h1>
            <p className="lede">Maaf, ada yang tidak beres. Coba muat ulang halaman.</p>
            <code className="mono" style={{ fontSize: '.76rem', color: 'var(--danger)', background: 'var(--danger-pale)', padding: '.4rem .7rem', borderRadius: 'var(--radius-sm)', wordBreak: 'break-all' }}>
              {this.state.error.message}
            </code>
            <button className="btn btn-teal" onClick={() => { this.setState({ error: null }); window.location.href = '/'; }}>
              Kembali ke beranda
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const Landing = lazy(() => import('./pages/Landing'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Modules = lazy(() => import('./pages/Modules'));
const ModuleDetail = lazy(() => import('./pages/ModuleDetail'));
const CanvasPage = lazy(() => import('./pages/CanvasPage'));
const Collab = lazy(() => import('./pages/Collab'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

/** Layar tunggu saat potongan halaman masih dimuat. */
function RouteFallback() {
  return (
    <div className="center" style={{ minHeight: '60vh' }}>
      <div className="stack gap-2" style={{ alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 160, height: 12 }} />
        <div className="skeleton" style={{ width: 96, height: 12 }} />
      </div>
    </div>
  );
}

/** Penjaga rute: halaman privat hanya untuk pengguna yang sudah masuk. */
function Protected({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <RouteFallback />;
  if (!user) return <Navigate to="/masuk" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

/** Halaman auth tidak perlu ditampilkan lagi bila sesi masih aktif. */
function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready) return <RouteFallback />;
  if (user) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/masuk"
          element={
            <PublicOnly>
              <AuthPage mode="login" />
            </PublicOnly>
          }
        />
        <Route
          path="/daftar"
          element={
            <PublicOnly>
              <AuthPage mode="register" />
            </PublicOnly>
          }
        />
        <Route
          path="/app"
          element={
            <Protected>
              <AppShell />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="modul" element={<Modules />} />
          <Route path="modul/:slug" element={<ModuleDetail />} />
          <Route path="kanvas" element={<CanvasPage />} />
          <Route path="kolaborasi" element={<Collab />} />
          <Route path="profil" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
