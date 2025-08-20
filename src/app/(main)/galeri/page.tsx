import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type GalleryItem = {
  _id: string;
  url?: string;
  src?: string;
  filename?: string;
  width?: number;
  height?: number;
};

async function getItems(): Promise<GalleryItem[]> {
  try {
    // Host ve protokolü güvenli biçimde çıkar
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "http";
    const base = `${proto}://${host}`;

    // Her zaman tam URL kullan (cache kapalı)
    const res = await fetch(`${base}/api/gallery/items`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      // İstersen debug için sayfaya küçük bir uyarı basarız
      console.error("Gallery fetch failed:", res.status, await res.text());
      return [];
    }

    const data = await res.json().catch(() => null);
    const items = Array.isArray(data?.items) ? data.items : [];

    return items.map((it: any) => ({
      _id: String(it._id ?? crypto.randomUUID()),
      url: it.url ?? it.src ?? "",
      src: it.src ?? it.url ?? "",
      filename: it.filename ?? "galeri",
      width: Number(it.width ?? 0),
      height: Number(it.height ?? 0),
    }));
  } catch (err) {
    console.error("Gallery fetch error:", err);
    return [];
  }
}

export default async function GaleriPage() {
  const items = await getItems();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-rose-500">• Galeri</p>
        <h1 className="mt-2 text-3xl font-extrabold">Etkinliklerden Kareler</h1>
        <div className="mt-2 h-1 w-16 rounded bg-gradient-to-r from-rose-500 to-blue-600" />
      </header>

      {!items.length ? (
        <div className="text-center text-slate-500 py-24 border rounded-xl bg-white/30">
          Henüz medya eklenmemiş. Lütfen yönetim panelinden fotoğraf/video yükleyin.
        </div>
      ) : (
        <ul aria-label="Galeri" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const src = it.url || it.src || "";
            const alt = it.filename || "galeri görseli";
            return (
              <li
                key={it._id}
                className="group rounded-xl overflow-hidden bg-white/5 shadow hover:shadow-2xl transition-shadow"
              >
                {/* next/image yerine img -> config gerektirmez */}
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-64 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  loading="lazy"
                />
                <figcaption className="p-3 text-sm text-slate-600">{alt}</figcaption>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
