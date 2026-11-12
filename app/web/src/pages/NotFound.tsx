import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

/** Halaman 404 untuk rute yang tidak dikenal. */
export default function NotFound() {
  return (
    <div className="center page" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div className="stack gap-3" style={{ alignItems: 'center', textAlign: 'center', maxWidth: 420 }}>
        <span className="mono muted">404</span>
        <h1 className="h1" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Halaman tidak ditemukan</h1>
        <p className="small muted">
          Alamat yang kamu buka tidak ada, sudah dipindahkan, atau butuh akses akun.
        </p>
        <div className="row gap-2 wrapflex" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-primary" to="/app">
            <Home size={15} /> Ke dashboard
          </Link>
          <Link className="btn" to="/">
            <Compass size={15} /> Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
