export function buildNedenKulturPdfUrl(fileUrl: string, slug?: string, download?: boolean) {
  if (!fileUrl) return "";
  const isNeden = !!slug && slug.startsWith("neden-kultur-sanat-is");
  if (!isNeden) return fileUrl; // diğer sayfalarda orijinal link

  const base = `/api/pdf/proxy?url=${encodeURIComponent(fileUrl)}`;
  return download ? `${base}&download=1` : base;
}
