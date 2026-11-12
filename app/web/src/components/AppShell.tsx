import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PenTool,
  Sun,
  Users,
  UserRound,
  X,
} from 'lucide-react';
import { Brand, BrandMark } from './Brand';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { initials } from '../lib/format';
import type { Prefs } from '../lib/types';

const NAV = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/modul', label: 'Modul belajar', icon: BookOpen, end: false },
  { to: '/app/kanvas', label: 'Kanvas praktik', icon: PenTool, end: false },
  { to: '/app/kolaborasi', label: 'Kolaborasi', icon: Users, end: false },
  { to: '/app/profil', label: 'Profil', icon: UserRound, end: false },
];

/** Kerangka aplikasi: sidebar, topbar, dan area konten. */
export function AppShell() {
  const { user, logout, savePrefs } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dark = user?.prefs?.theme === 'dark';

  // Tutup drawer setiap kali rute berubah supaya tidak menutupi konten di layar kecil
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const toggleTheme = async () => {
    const next: Prefs = { theme: dark ? 'light' : 'dark' };
    savePrefs(next);
    try {
      await api('/api/profile', { method: 'PATCH', body: { prefs: next } });
    } catch {
      /* preferensi sudah berlaku lokal; sinkronisasi server boleh gagal diam-diam */
    }
  };

  const doLogout = () => {
    logout();
    navigate('/masuk', { replace: true });
  };

  return (
    <div className="app">
      {open ? <div className="scrim" onClick={() => setOpen(false)} aria-hidden="true" /> : null}
      <aside className={`sidebar${open ? ' open' : ''}`} aria-label="Navigasi utama">
        <div className="row between">
          <Brand to="/app" />
          <button
            type="button"
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            data-close-sidebar
          >
            <X size={16} />
          </button>
        </div>

        <nav className="side-nav">
          <span className="side-label">Belajar</span>
          {NAV.slice(0, 4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
          <span className="side-label">Akun</span>
          <NavLink to="/app/profil" className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <UserRound size={16} /> Profil &amp; pengaturan
          </NavLink>
        </nav>

        <div className="side-foot">
          <button type="button" className="side-link" onClick={toggleTheme} aria-pressed={dark}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Mode terang' : 'Mode gelap'}
          </button>
          <div className="side-user">
            <span className="avatar" aria-hidden="true">{initials(user?.name ?? 'N')}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '.7rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={doLogout} aria-label="Keluar dari akun" title="Keluar">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="row gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => setOpen((v) => !v)}
              aria-label="Buka menu navigasi"
              aria-expanded={open}
              data-open-sidebar
            >
              <Menu size={16} />
            </button>
            <span className="crumbs">
              <BrandMark size={18} />
              <span className="now">nodes</span>
            </span>
          </div>
          <div className="row gap-2">
            <span className="badge badge-teal">
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--teal)' }} />
              tersambung
            </span>
            <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={toggleTheme} aria-label={dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>
        <div className="content page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
