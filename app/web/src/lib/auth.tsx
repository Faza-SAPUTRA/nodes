import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, setToken, getToken } from './api';
import type { Prefs, User } from './types';

type AuthValue = {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (next: User) => void;
  savePrefs: (next: Prefs) => void;
};

const AuthContext = createContext<AuthValue | null>(null);
const THEME_KEY = 'nodes.theme';

/** Backend mengirim prefs sebagai string JSON pada /auth, objek pada /profile. */
function normalizeUser(raw: User | (User & { prefs: unknown })): User {
  const prefs = raw.prefs;
  if (typeof prefs === 'string') {
    try {
      return { ...raw, prefs: JSON.parse(prefs) as Prefs };
    } catch {
      return { ...raw, prefs: {} };
    }
  }
  return { ...raw, prefs: (prefs ?? {}) as Prefs };
}

/** Terapkan tema & preferensi gerak ke elemen html. */
export function applyPrefs(prefs: Prefs | undefined): void {
  const root = document.documentElement;
  const theme = prefs?.theme === 'dark' ? 'dark' : 'light';
  root.dataset.theme = theme;
  root.dataset.reduceMotion = prefs?.reduce_motion ? 'true' : 'false';
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* penyimpanan diblokir — tema tetap berlaku untuk sesi ini */
  }
}

/** Tema awal sebelum pengguna login (dibaca dari cache lokal). */
export function bootstrapTheme(): void {
  let theme = 'light';
  try {
    theme = localStorage.getItem(THEME_KEY) ?? 'light';
  } catch {
    /* abaikan */
  }
  document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    bootstrapTheme();
    let alive = true;
    if (!getToken()) {
      setReady(true);
      return () => {
        alive = false;
      };
    }
    api<{ user: User }>('/api/auth/me')
      .then((res) => {
        if (!alive) return;
        const next = normalizeUser(res.user);
        setUserState(next);
        applyPrefs(next.prefs);
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUserState(null);
    window.addEventListener('nodes:unauthorized', onUnauthorized);
    return () => window.removeEventListener('nodes:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const res = await api<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password, remember },
    });
    setToken(res.token);
    const next = normalizeUser(res.user);
    setUserState(next);
    applyPrefs(next.prefs);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    setToken(res.token);
    const next = normalizeUser(res.user);
    setUserState(next);
    applyPrefs(next.prefs);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserState(null);
  }, []);

  const setUser = useCallback((next: User) => {
    const normalized = normalizeUser(next);
    setUserState(normalized);
    applyPrefs(normalized.prefs);
  }, []);

  const savePrefs = useCallback((next: Prefs) => {
    setUserState((prev) => {
      if (!prev) return prev;
      const merged = { ...prev.prefs, ...next };
      applyPrefs(merged);
      return { ...prev, prefs: merged };
    });
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout, setUser, savePrefs }),
    [user, ready, login, register, logout, setUser, savePrefs],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
