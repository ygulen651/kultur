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
    <main className="mx-auto max-w-7xl px-4 py-10">
      {/* Hero Section */}
      <header className="text-center mb-12">
        <p className="text-sm uppercase tracking-widest text-red-600 font-medium">• Galeri</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Kültür Sanat İş Galerisi
        </h1>
                  <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sendikamızın etkinliklerinden, toplantılarından ve faaliyetlerinden unutulmaz anlar
          </p>
          <div className="mt-6">
            <a 
              href="/admin/basin-yayin/afis" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Galeri Yönetimi
            </a>
          </div>
        <div className="mt-6 h-1 w-24 rounded bg-gradient-to-r from-red-600 to-red-800 mx-auto" />
      </header>

      {/* Galeri İçeriği */}
      {!items.length ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6l.586-.586a2 2 0 012.828 0L20 8m-6-6l-.586.586a2 2 0 00-2.828 0L8 2m-6 6l.586.586a2 2 0 002.828 0L2 8m6 6l-.586.586a2 2 0 00-2.828 0L2 14m6 6l.586.586a2 2 0 002.828 0L14 20m6-6l.586.586a2 2 0 002.828 0L20 14m-6 6l.586.586a2 2 0 002.828 0L14 20" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Galeri Henüz Boş
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Galeriye fotoğraf ve video eklemek için yönetim panelini kullanın. 
            Etkinliklerden kareler yakında burada görünecek.
          </p>
        </div>
      ) : (
        <>
          {/* Galeri Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((it) => {
              const src = it.url || it.src || "";
              const alt = it.filename || "galeri görseli";
              return (
                <div
                  key={it._id}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Görsel */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={src}
                      alt={alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Alt Bilgi */}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
                      {alt}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{it.width} × {it.height}</span>
                      <span>{it.createdAt ? new Date(it.createdAt).toLocaleDateString('tr-TR') : ''}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Galeri İstatistikleri */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-8 bg-white dark:bg-gray-800 rounded-full px-8 py-4 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{items.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Görsel</div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {items.filter(item => item.format === 'video').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Video</div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {items.filter(item => item.format === 'image').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fotoğraf</div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
