// app/page.tsx — Birleşik Kamu‑İş ana sayfa düzeni
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HeroCarousel from "@/components/HeroCarousel";
import AnnouncementSlider from "@/components/AnnouncementSlider";
import SmallAnnouncementSlider from "@/components/SmallAnnouncementSlider";
import { getAnnouncements, getSliders, getBuyukSliders, getEvents, getSiteData, getKamuAr } from "@/lib/data";
import { pickAnnouncementCover } from "@/lib/ui";

// —— helpers ——
function safeDate(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleString("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getTitle(a: any) {
  return a?.title || a?.frontmatter?.title || "Başlık";
}

function getDesc(a: any) {
  return (
    a?.excerpt || a?.description || a?.frontmatter?.description || "Açıklama bulunamadı"
  );
}

function getImageUrl(item: any) {
  // Farklı görsel alanlarını kontrol et
  const imageUrl = item?.image || 
                   item?.featuredImage || 
                   item?.imageUrl ||
                   item?.frontmatter?.image || 
                   item?.frontmatter?.featuredImage ||
                   item?.coverImage ||
                   null;
  
  // URL'yi normalize et
  if (!imageUrl) return null;
  
  // Zaten tam URL ise
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // Vercel Blob URL'si ise
  if (imageUrl.startsWith('/uploads/')) return imageUrl;
  
  // Unsplash placeholder ise
  if (imageUrl.includes('unsplash.com')) return imageUrl;
  
  // Diğer durumlar için fallback
  return null;
}


// —— layout components ——
function OverlayLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-black/60 text-white px-3 py-1 text-xs font-bold">
      {children}
    </span>
  );
}

function NewsTile({ item, index = 1, isLarge = false, isStacked = false, isGrid = false, isHorizontal = false }: { item: any; index?: number; isLarge?: boolean; isStacked?: boolean; isGrid?: boolean; isHorizontal?: boolean }) {
  const cover = pickAnnouncementCover(item);
  const href = `/duyurular/${item?.slug || item?._id || item?.id || "#"}`;
  
  return (
    <Link href={href} className="group relative block overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300">
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={cover} 
          alt={getTitle(item)} 
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isHorizontal ? 'h-32' : isGrid ? 'h-80' : isStacked ? 'h-32' : isLarge ? 'h-80' : 'h-48'
          }`} 
        />
      ) : (
        <div className={`w-full bg-gradient-to-br from-red-500 to-blue-500 ${
          isHorizontal ? 'h-32' : isGrid ? 'h-80' : isStacked ? 'h-32' : isLarge ? 'h-80' : 'h-48'
        }`} />
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        {/* Date */}
        <div className="mb-1 text-xs font-medium opacity-90">
          {safeDate(item?.publishDate || item?.frontmatter?.date)}
        </div>
        
        {/* Title */}
        <h3 className={`font-bold leading-tight line-clamp-2 drop-shadow-sm ${
          isHorizontal ? 'text-sm' : isGrid ? 'text-lg' : isStacked ? 'text-sm' : isLarge ? 'text-lg' : 'text-base'
        }`}>
          {getTitle(item)}
        </h3>
      </div>
      
      {/* Number badge */}
      <div className={`absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xs font-bold text-white ${
        isHorizontal ? 'w-6 h-6' : isGrid ? 'w-8 h-8' : 'w-5 h-5'
      }`}>
        {String(index).padStart(2, "0")}
      </div>
    </Link>
  );
}

export default async function Home() {
  const [slides, buyukSliders, announcements, events, siteData, kamuAr] = await Promise.all([
    getSliders(),
    getBuyukSliders(),
    getAnnouncements({ limit: "20" }), // Daha fazla duyuru getir
    getEvents({ status: "published" }),
    getSiteData(),
    getKamuAr?.()?.catch?.(() => null) ?? null,
  ]);

  const items = Array.isArray(announcements) ? announcements : [];
  const published = items.filter((a) => !!a?.publishDate || a?.status === "published");
  const latest = [...published].sort((a, b) => new Date(b?.publishDate ?? b?.createdAt ?? 0).getTime() - new Date(a?.publishDate ?? a?.createdAt ?? 0).getTime());

  const rightTiles = latest.slice(0, 4);

  const heroSlides = Array.isArray(slides) ? slides : [];

  // Debug info
  console.log('🔍 Debug - announcements:', announcements?.length || 0);
  console.log('🔍 Debug - published:', published?.length || 0);
  console.log('🔍 Debug - latest:', latest?.length || 0);
  console.log('🔍 Debug - rightTiles:', rightTiles?.length || 0);
  console.log('🔍 Debug - latest data sample:', latest.slice(0, 2));
  console.log('🔍 Debug - image URLs:', latest.slice(0, 2).map(item => ({
    title: getTitle(item),
    image: getImageUrl(item),
    rawImage: item?.image,
    featuredImage: item?.featuredImage,
    imageUrl: item?.imageUrl
  })));

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ——— FULLSCREEN HERO SLIDER ——— */}
      <section className="w-full mt-16">
        {buyukSliders?.length > 0 ? (
          <AnnouncementSlider announcements={buyukSliders} />
        ) : latest?.length > 0 ? (
          <AnnouncementSlider announcements={latest} />
        ) : (
          <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
            {/* Left Logo */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center border-4 border-yellow-400">
                <div className="text-white text-xs font-bold text-center">
                  <div>BİRLEŞİK</div>
                  <div>KAMU-İŞ</div>
                </div>
              </div>
            </div>

            {/* Right Logo */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center border-4 border-yellow-400">
                <div className="text-white text-xs font-bold text-center">
                  <div>BİRLEŞİK</div>
                  <div>KAMU-İŞ</div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center px-8 max-w-4xl mx-auto">
              {/* Image from KAMU-AR data */}
              {kamuAr && typeof kamuAr === 'object' && 'image' in kamuAr && (kamuAr as any).image ? (
                <div className="mb-8">
                  <div className="relative max-w-4xl mx-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={(kamuAr as any).image} 
                      alt={(kamuAr as any)?.title || "Kamu-Ar Görseli"} 
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {/* Main Headline */}
                  <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-blue-600 mb-2">Ağustosta Açlık Sınırı</h1>
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-red-600">28.000 TL'Yİ DE AŞTI!</h2>
                  </div>

                  {/* Body Text */}
                  <p className="text-lg md:text-xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Kamu-Ar tarafından açıklanan verilere göre açlık sınırı ağustosta 28 bin 444 TL'ye, 
                    yoksulluk sınırı ise 87 bin 910 TL'ye yükseldi. Resmi söylem ile mutfak arasındaki 
                    uçurum gün geçtikçe büyüyor!
                  </p>

                  {/* Data Boxes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Poverty Line */}
                    <div className="bg-red-600 rounded-lg p-6 text-white">
                      <div className="text-sm font-semibold mb-2">Yoksulluk Sınırı Yıllık Artış</div>
                      <div className="text-3xl font-black mb-2">23.753 TL</div>
                      <div className="text-sm opacity-90">Son bir yılda yoksulluk sınırı 23 bin 753 lira arttı.</div>
                    </div>

                    {/* Hunger Line */}
                    <div className="bg-blue-600 rounded-lg p-6 text-white">
                      <div className="text-sm font-semibold mb-2">Açlık Sınırı Yıllık Artış</div>
                      <div className="text-3xl font-black mb-2">7.486 TL</div>
                      <div className="text-sm opacity-90">Son bir yılda açlık sınırı 7 bin 486 lira arttı.</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Navigation Arrows */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-gray-600 backdrop-blur-sm transition-all">
              ‹
            </button>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-gray-600 backdrop-blur-sm transition-all">
              ›
            </button>
          </div>
        )}
      </section>

      {/* ——— MAIN LAYOUT: Top Left Slider + Bottom Right Cards ——— */}
      <section className="w-full pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-0 h-auto lg:h-[600px]">
          {/* Top Left: Small Hero - 4/7 width on desktop, full width on mobile */}
          <div className="lg:col-span-4">
            <SmallAnnouncementSlider announcements={latest} />
          </div>

          {/* Bottom Right: Square Cards - 3/7 width on desktop, full width on mobile */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-0">
            {latest.length > 0 ? (
              latest.slice(0, 4).map((it, i) => {
                const imageUrl = getImageUrl(it);
                return (
                  <div key={it?._id || it?.id || i} className="bg-gray-100 p-2 flex flex-col items-center justify-center gap-1 hover:bg-gray-200 transition-colors aspect-square relative overflow-hidden">
                    {imageUrl ? (
                      <div className="absolute inset-0">
                        <Image
                          src={imageUrl}
                          alt={getTitle(it)}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="text-center relative z-10">
                          <h3 className="text-xs font-medium text-white line-clamp-2 drop-shadow-lg">{getTitle(it)}</h3>
                          <p className="text-xs text-white/80 mt-1 drop-shadow-lg">{safeDate(it?.publishDate || it?.frontmatter?.date)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <Calendar className="h-6 w-6 text-gray-600" />
                        <h3 className="text-xs font-medium text-gray-900 line-clamp-2">{getTitle(it)}</h3>
                        <p className="text-xs text-gray-500">{safeDate(it?.publishDate || it?.frontmatter?.date)}</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Fallback cards when no data
              Array.from({ length: 4 }).map((_, i) => (
                <div key={`fallback-${i}`} className="bg-gray-100 p-2 flex flex-col items-center justify-center gap-1 hover:bg-gray-200 transition-colors aspect-square">
                  <Calendar className="h-6 w-6 text-gray-600" />
                  <div className="text-center">
                    <h3 className="text-xs font-medium text-gray-900">Duyuru {i + 1}</h3>
                    <p className="text-xs text-gray-500 mt-1">Yakında eklenecek</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ——— ADDITIONAL CARDS SLIDER ——— */}
      <section className="w-full py-8">
        <div className="container mx-auto max-w-[1400px] px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Son Haberler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {latest.length > 0 ? (
              latest.slice(0, 8).map((it, i) => {
                const imageUrl = getImageUrl(it);
                return (
                  <div key={it?._id || it?.id || i} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                      {imageUrl ? (
                                              <Image
                        src={imageUrl}
                        alt={getTitle(it)}
                        fill
                        className="object-cover"
                      />
                      ) : (
                        <Calendar className="h-8 w-8 text-gray-500" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2">{getTitle(it)}</h3>
                      <p className="text-xs text-gray-500">{safeDate(it?.publishDate || it?.frontmatter?.date)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              // Fallback cards when no data
              Array.from({ length: 8 }).map((_, i) => (
                <div key={`fallback-${i}`} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-gray-500" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Haber {i + 1}</h3>
                    <p className="text-xs text-gray-500">Yakında eklenecek</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </main>
  );
}


