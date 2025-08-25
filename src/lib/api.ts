// lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL!;
if (!API_BASE) {
  // Build-time güvenliği
  // eslint-disable-next-line no-console
  console.warn('NEXT_PUBLIC_API_URL is not set!');
}

export async function apiGet<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    cache: 'no-store', // alan adı değişimi sonrası stale cache'leri devre dışı
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('API Hatası:', res.status, url, text);
    throw new Error(`API ${res.status} @ ${url} -> ${text}`);
  }
  return res.json();
}

export async function apiPost<T = any>(path: string, data?: any, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: 'POST',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: data ? JSON.stringify(data) : undefined,
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('API Hatası:', res.status, url, text);
    throw new Error(`API ${res.status} @ ${url} -> ${text}`);
  }
  return res.json();
}

export async function apiPut<T = any>(path: string, data?: any, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: 'PUT',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: data ? JSON.stringify(data) : undefined,
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('API Hatası:', res.status, url, text);
    throw new Error(`API ${res.status} @ ${url} -> ${text}`);
  }
  return res.json();
}

export async function apiDelete<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: 'DELETE',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('API Hatası:', res.status, url, text);
    throw new Error(`API ${res.status} @ ${url} -> ${text}`);
  }
  return res.json();
}
