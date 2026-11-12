import { Link } from 'react-router-dom';

/** Lambang NODES: simpul yang terhubung, bukan sekadar kotak. */
export function BrandMark({ size = 26 }: { size?: number }) {
  return (
    <span className="brand-mark" style={{ width: size, height: size }} aria-hidden="true">
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="4.5" r="2.6" fill="currentColor" />
        <circle cx="4.5" cy="18" r="2.6" fill="currentColor" />
        <circle cx="19.5" cy="18" r="2.6" fill="currentColor" />
        <path d="M12 7.1 5.9 15.6M12 7.1l6.1 8.5M7.1 18h9.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".75" />
      </svg>
    </span>
  );
}

export function Brand({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="brand" aria-label="NODES — beranda">
      <BrandMark />
      <span>nodes.</span>
    </Link>
  );
}
