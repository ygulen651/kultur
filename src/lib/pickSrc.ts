// src/lib/pickSrc.ts
export function pickAnnImage(a: any): string | null {
  if (!a) return null;
  const raw =
    a?.cover ||
    a?.imageFilename ||
    a?.filename ||
    a?.image?.filename ||
    a?.image?.url ||
    a?.featuredImageUrl ||
    a?.featuredImage ||
    a?.coverImage ||
    "";
  const v = String(raw || "").trim().replace(/^C:\\fakepath\\/, "");
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith("/uploads/")) return v;
  return `/uploads/${v}`;
}
