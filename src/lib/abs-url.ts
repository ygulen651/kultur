import { headers } from "next/headers";

/** SSR fetch için mutlak URL üretir */
export async function absoluteUrl(path: string) {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const base = process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;
  return new URL(path, base).toString();
}

/** Path + query objesini birleştir */
export async function buildApiUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>
) {
  const u = new URL(await absoluteUrl(path));
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        u.searchParams.set(k, String(v));
      }
    }
  }
  return u.toString();
}
