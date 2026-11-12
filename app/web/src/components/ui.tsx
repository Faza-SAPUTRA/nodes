import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AlertTriangle, CheckCircle2, Info, RefreshCw, X } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info' | 'warn';
type ToastItem = { id: number; kind: ToastKind; title: string; message?: string };
type ToastApi = {
  push: (kind: ToastKind, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warn: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);
let toastSeq = 0;

const ICONS: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 size={16} />,
  error: <AlertTriangle size={16} />,
  info: <Info size={16} />,
  warn: <AlertTriangle size={16} />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<number[]>([]);

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = ++toastSeq;
      setItems((prev) => [...prev.slice(-3), { id, kind, title, message }]);
      const timer = window.setTimeout(() => remove(id), kind === 'error' ? 7000 : 4200);
      timers.current.push(timer);
    },
    [remove],
  );

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      info: (title, message) => push('info', title, message),
      warn: (title, message) => push('warn', title, message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-layer" role="status" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className="toast" data-kind={item.kind}>
            <i className="bar" aria-hidden="true" />
            <span style={{ color: 'var(--muted)', marginTop: 2 }} aria-hidden="true">
              {ICONS[item.kind]}
            </span>
            <div style={{ flex: 1 }}>
              <strong>{item.title}</strong>
              {item.message ? <p>{item.message}</p> : null}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => remove(item.id)}
              aria-label="Tutup notifikasi"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider');
  return ctx;
}

export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid var(--line-strong)',
        borderTopColor: 'var(--teal)',
        display: 'inline-block',
        animation: 'spin .7s linear infinite',
      }}
    />
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <span className="field-error" role="alert">
          <AlertTriangle size={12} /> {error}
        </span>
      ) : hint ? (
        <span className="help">{hint}</span>
      ) : null}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="row between" style={{ marginBottom: '.9rem' }}>
          <h2 className="h3">{title}</h2>
          <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Tutup dialog">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Empty({
  icon,
  title,
  text,
  action,
}: {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      {icon}
      <strong style={{ color: 'var(--ink)' }}>{title}</strong>
      {text ? <p className="small muted" style={{ maxWidth: '42ch' }}>{text}</p> : null}
      {action}
    </div>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="empty" role="alert" style={{ borderColor: 'color-mix(in srgb, var(--danger) 40%, var(--line))' }}>
      <AlertTriangle size={20} color="var(--danger)" />
      <strong style={{ color: 'var(--ink)' }}>Gagal memuat data</strong>
      <p className="small muted" style={{ maxWidth: '46ch' }}>{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn-sm" onClick={onRetry}>
          <RefreshCw size={13} /> Coba lagi
        </button>
      ) : null}
    </div>
  );
}

export function SkeletonBlock({ height = 16, width = '100%' }: { height?: number; width?: string }) {
  return <div className="skeleton" style={{ height, width }} aria-hidden="true" />;
}
