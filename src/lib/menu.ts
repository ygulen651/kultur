export async function getSiteMenu() {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  const res = await fetch(`${base}/api/menu`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.item ?? null;
}
