/** Klien API NODES: satu tempat untuk token, error, dan pembatalan. */

const TOKEN_KEY = 'nodes.token';

export type ApiFieldErrors = Record<string, string>;

export class ApiFailure extends Error {
  code: string;
  status: number;
  fields: ApiFieldErrors;

  constructor(code: string, message: string, status = 0, fields: ApiFieldErrors = {}) {
    super(message);
    this.name = 'ApiFailure';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* penyimpanan diblokir (mode privat) — sesi tetap jalan di memori */
  }
}

type Options = {
  method?: string;
  body?: unknown;
  raw?: BodyInit;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/** Panggil endpoint API dan normalisasi semua kegagalan ke ApiFailure. */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const { method = 'GET', body, raw, headers = {}, signal } = options;
  const finalHeaders: Record<string, string> = { ...headers };
  const token = getToken();
  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined = raw;
  if (body !== undefined) {
    payload = JSON.stringify(body);
    finalHeaders['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(path, { method, body: payload, headers: finalHeaders, signal });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw err;
    throw new ApiFailure(
      'NETWORK',
      'Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.',
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && getToken()) {
      setToken(null);
      window.dispatchEvent(new Event('nodes:unauthorized'));
    }
    const envelope = (data as { error?: { code?: string; message?: string; fields?: ApiFieldErrors } } | null)?.error;
    if (envelope) {
      throw new ApiFailure(
        envelope.code ?? `HTTP_${response.status}`,
        envelope.message ?? 'Permintaan gagal diproses.',
        response.status,
        envelope.fields ?? {},
      );
    }
    throw new ApiFailure(
      `HTTP_${response.status}`,
      response.status >= 500
        ? 'Server sedang bermasalah. Coba lagi beberapa saat.'
        : 'Permintaan tidak dapat diproses.',
      response.status,
    );
  }

  return data as T;
}

/** Ubah kegagalan apa pun menjadi kalimat yang layak ditampilkan. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiFailure) return err.message;
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan tak terduga.';
}
