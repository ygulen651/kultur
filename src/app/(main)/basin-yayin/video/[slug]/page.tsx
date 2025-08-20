import Image from "next/image";
import { headers } from "next/headers";

export const revalidate = 0;

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function pickCover(it: any) {
  const c =
    it?.cover?.url ??
    it?.coverUrl ??
    it?.image?.url ??
    it?.fields?.image?.url ??
    it?.src ??
    "";
  if (typeof c !== "string") return "";
  const t = c.trim();
  return t.length > 0 ? t : "";
}

function isHttp(url: string) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isLocal(url: string) {
  return typeof url === "string" && url.startsWith("/uploads/");
}

async function getItem(slug: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/video?status=published&limit=1&search=${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.items.find((x:any)=>x.slug===slug) || null;
  return item;
}

function getEmbedUrl(videoUrl: string) {
  if (!videoUrl) return "";
  // YouTube
  if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
    const id = videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("youtu.be/")[1];
    return id ? `https://www.youtube.com/embed/${id}` : "";
  }
  // Vimeo
  if (videoUrl.includes("vimeo.com")) {
    const id = videoUrl.split("vimeo.com/")[1]?.split("/")[0];
    return id ? `https://player.vimeo.com/video/${id}` : "";
  }
  return "";
}

export default async function VideoDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getItem(slug);
  if (!item) return <div className="p-8 text-center">Video bulunamadı.</div>;
  const cover = pickCover(item);
  const ok = isHttp(cover) || isLocal(cover);
  const embedUrl = getEmbedUrl(item.videoUrl);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{item.title}</h1>
      {!!cover && ok && (
        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={cover}
            alt={item.title || "Video"}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}
      {embedUrl && (
        <div className="mb-6 aspect-[16/9]">
          <iframe
            src={embedUrl}
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full rounded-xl border"
            title={item.title}
          />
        </div>
      )}
      {item.description && <p className="text-lg text-gray-600 mb-4">{item.description}</p>}
      {item.publishedAt && (
        <div className="text-xs text-gray-400 mb-2">
          {new Date(item.publishedAt).toLocaleDateString("tr-TR")}
        </div>
      )}
    </article>
  );
}
