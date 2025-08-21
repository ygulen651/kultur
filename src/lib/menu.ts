export async function getSiteMenu() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';

  const url = base ? `${base}/api/menu` : '/api/menu';
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.item ?? null;
}
