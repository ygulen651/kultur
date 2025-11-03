import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

export const revalidate = 0;

// SSR'da mutlak base-url
async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

function pickCover(it: any) {
  // Yeni modellerde imageUrl kullanılıyor
  const c = it?.imageUrl ?? "";
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

async function getData() {
  const base = await getBaseUrl();
  
  // Sadece basın kategorisinden veri getir
  const basinRes = await fetch(`${base}/api/basin`, { cache: "no-store" });
  const basinData = basinRes.ok ? await basinRes.json() : { items: [] };
  
  // Sadece basın verilerini döndür
  return { items: basinData.items };
}

export default async function BasinYayinPage() {
  const { items = [] } = await getData();

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Basın-Yayın Haberleri</h1>
      <p className="mb-10 text-lg text-gray-600 max-w-2xl">
        Sendikamızın güncel haberleri, basın açıklamaları ve medya içerikleri burada. Kartlara tıklayarak detayları görebilirsiniz.
      </p>
      {!items.length ? (
        <div className="rounded-lg border p-10 text-center text-neutral-500">
          Henüz haber eklenmemiş.
        </div>
      ) : (
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((it: any, i: number) => {
            const cover = pickCover(it);
            const ok = isHttp(cover) || isLocal(cover);
            return (
              <li
                key={it._id || it.slug || i}
                className="group rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-lg flex flex-col"
              >
                <Link href={`/basin-yayin/${it.slug || it._id || ""}`} className="block flex-1">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-neutral-100">
                    {ok ? (
                      <Image
                        src={cover}
                        alt={it.title || "Basın-Yayın"}
                        fill
                        className="object-cover transition will-change-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        priority={i < 2}
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-neutral-400">
                        <span className="text-sm">Kapak görseli yok</span>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 pb-2 flex flex-col gap-1">
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-red-700 transition-colors">
                      {it.title || "Başlık yok"}
                    </h3>
                    <div className="text-xs text-gray-500">
                      {it.createdAt ? new Date(it.createdAt).toLocaleDateString("tr-TR") : "Tarih yok"}
                    </div>
                    {it.summary && (
                      <p className="text-sm text-neutral-600 line-clamp-3">
                        {it.summary}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
