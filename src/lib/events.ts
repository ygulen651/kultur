import { baseUrl } from './baseUrl';

export async function getEvents(params: Record<string, string> = { published: 'true' }) {
  const qs = new URLSearchParams(params).toString();
  const url = `${baseUrl}/api/events${qs ? `?${qs}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({} as any));
  const items = Array.isArray(data?.items) ? data.items : [];
  // cover veya computedCover'a fallback
  return items.map((i: any) => ({ ...i, cover: i.cover || i.computedCover || '' }));
}
