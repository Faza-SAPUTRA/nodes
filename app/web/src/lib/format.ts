/** Utilitas format tanggal, angka, dan teks pendek. */

export function relativeTime(iso: string): string {
  const then = new Date(iso.endsWith('Z') ? iso : `${iso}Z`).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.round((Date.now() - then) / 1000);
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
  return fullDate(iso);
}

export function fullDate(iso: string): string {
  const date = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function clockTime(iso: string): string {
  const date = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function pct(done: number, total: number): number {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}
