export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroCarousel from "@/components/HeroCarousel";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";
import { getSiteData, getAnnouncements, getSliders, getKamuAr, getEvents, getBoardMembers } from "@/lib/data";
import { pickAnnouncementCover } from "@/lib/ui";
import MVVSection from "@/components/home/MVVSection";
import EventsRow from "@/components/EventsRow";

// Güvenli veri işleme fonksiyonu
function safeGetDate(dateString: string | undefined): string {
  if (!dateString) return "Tarih belirtilmemiş";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Geçersiz tarih";
    return date.toLocaleDateString("tr-TR");
  } catch {
    return "Tarih belirtilmemiş";
  }
}

function safeGetTitle(item: any): string {
  return item?.title || item?.frontmatter?.title || "Başlık bulunamadı";
}

function safeGetDescription(item: any): string {
  return item?.excerpt || item?.description || item?.frontmatter?.description || "Açıklama bulunamadı";
}

function safeGetYear(item: any): string {
  const raw = item?.date || item?.publishDate || item?.frontmatter?.date;
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "";
    return String(d.getFullYear());
  } catch {
    return "";
  }
}

const bgStyle = (src: string) => ({
  backgroundImage: `linear-gradient(135deg, rgba(220,38,38,.78) 0%, rgba(59,130,246,.55) 100%), url("${src}")`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});

export default async function Home() {
  const siteData = await getSiteData();
  const sliders = await getSliders();
  console.log('🎯 Ana sayfa - sliders array:', sliders);
  console.log('🎯 Ana sayfa - sliders length:', sliders.length);
  const heroSlides = Array.isArray(sliders) ? sliders : [];
  console.log('🎯 Ana sayfa - heroSlides array:', heroSlides);
  console.log('🎯 Ana sayfa - heroSlides length:', heroSlides.length);
  const items = await getAnnouncements();
  console.log('🎯 Ana sayfa - announcements array:', items);
  console.log('🎯 Ana sayfa - announcements length:', items.length);

  const _published = Array.isArray(items) ? items.filter((a) => !!a?.publishDate || a?.status === 'published') : [];
  console.log('🎯 Ana sayfa - _published array:', _published);
  console.log('🎯 Ana sayfa - _published length:', _published.length);
  
  const featuredAnnouncements = _published.filter(
    (a) => a.isFeatured === true || a.featured === true || a.isFeatured === "true" || a.featured === "true",
  );
  console.log('🎯 Ana sayfa - featuredAnnouncements array:', featuredAnnouncements);
  console.log('🎯 Ana sayfa - featuredAnnouncements length:', featuredAnnouncements.length);
  
  const latestAnnouncements = [..._published]
    .sort(
      (a, b) =>
        new Date(b.publishDate ?? b.createdAt ?? 0).getTime() -
        new Date(a.publishDate ?? a.createdAt ?? 0).getTime(),
    )
    .slice(0, 3);
  console.log('🎯 Ana sayfa - latestAnnouncements array:', latestAnnouncements);
  console.log('🎯 Ana sayfa - latestAnnouncements length:', latestAnnouncements.length);
  
  const heroAnnouncement = featuredAnnouncements[0] ?? latestAnnouncements[0] ?? null;
  console.log('🎯 Ana sayfa - heroAnnouncement:', heroAnnouncement);

  const events = await getEvents({ status: "published" });
  console.log('🎯 Ana sayfa - events array:', events);
  console.log('🎯 Ana sayfa - events length:', events.length);
  const latest3 = events.slice(0, 3);
  console.log('🎯 Ana sayfa - latest3 array:', latest3);
  console.log('🎯 Ana sayfa - latest3 length:', latest3.length);

  // Yönetim kurulu verilerini çek - Tüm yönetim kurulu üyelerini al
  const boardMembers = await getBoardMembers();
  console.log('🎯 Ana sayfa - boardMembers:', boardMembers);
  console.log('🎯 Ana sayfa - boardMembers length:', boardMembers.length);

  return (
    <>
      {/* Hero Carousel */}
      {heroSlides.length > 0 ? (
        <HeroCarousel slides={heroSlides} autoPlayMs={6000} />
      ) : (
        <div className="relative min-h-[500px] bg-gradient-to-br from-slate-50 via-red-50 to-blue-50 dark:from-slate-800 dark:via-red-900/20 dark:to-blue-900/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-slate-400 to-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Calendar className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-slate-900 via-red-600 to-blue-600 bg-clip-text text-transparent dark:from-white dark:via-red-400 dark:to-blue-400">
              Kültür Sanat İş
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto">
              Slider eklenmemiş. Admin panelinden slider ekleyin.
            </p>
          </div>
        </div>
      )}

      {/* Ultra Modern Son Duyurular */}
      <section className="py-10 sm:py-14 lg:py-20">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {/* Mobile Responsive Başlık */}
          <div className="text-center mb-6 md:mb-12">
            <div className="relative inline-block">
              {/* Mobile Optimized Glow */}
              <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-red-600/20 via-blue-600/20 to-purple-600/20 rounded-xl md:rounded-2xl blur-lg md:blur-xl animate-pulse"></div>

              {/* Mobile Optimized Badge */}
              <div className="relative inline-flex items-center gap-1.5 md:gap-2 bg-black/5 dark:bg-white/5 backdrop-blur-xl rounded-full px-4 py-1.5 md:px-6 md:py-2 mb-4 md:mb-6 border border-red-200/30 dark:border-red-700/30">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div
                    className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div
                    className="w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-500 rounded-full animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                </div>
                <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Son Duyurular
                </span>
              </div>
            </div>

            <h2 className="h2 text-[clamp(28px,6vw,64px)] mb-3 md:mb-4" title="Güncel Haberler">
              <span className="bg-gradient-to-r from-slate-900 via-red-600 to-blue-600 bg-clip-text text-transparent dark:from-white dark:via-red-400 dark:to-blue-400">
                Güncel Haberler
              </span>
            </h2>

            <p className="text-base md:text-lg text-muted-foreground max-w-xs sm:max-w-md md:max-w-3xl mx-auto leading-relaxed mb-3 md:mb-4">
              Sendikamızdan en güncel haberler, önemli duyurular ve gelişmeler
            </p>

            {/* Mobile Optimized Dekoratif Çizgiler */}
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <div className="h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-red-500"></div>
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-red-500 rounded-full"></div>
              <div className="h-px w-16 md:w-24 bg-gradient-to-r from-red-500 via-blue-500 to-purple-500"></div>
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full"></div>
              <div className="h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-purple-500"></div>
            </div>
          </div>

          {/* Featured Announcement - Ultra Modern Hero Card */}
          {heroAnnouncement ? (
            <div className="mb-16">
              <div className="relative group">
                <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 shadow-2xl group-hover:shadow-3xl transition-all duration-700">
                  <div className="grid lg:grid-cols-2 min-h-[500px]">
                    {/* Sol Taraf - Görsel ve Dekoratif Elementler */}
                    <div
                      className="relative overflow-hidden"
                      style={(() => {
                        const f = heroAnnouncement;
                        const src = pickAnnouncementCover(f);
                        return src ? bgStyle(src) : { background: "linear-gradient(135deg, #dc2626, #1d4ed8)" };
                      })()}
                    >
                      {/* Enhanced Background Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:30px_50px]"></div>
                      </div>
                      
                      {/* Enhanced Animated Floating Elements */}
                      <div className="absolute inset-0">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-3 h-3 bg-white/20 rounded-full animate-pulse"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              animationDelay: `${Math.random() * 3}s`,
                              animationDuration: `${2 + Math.random() * 2}s`,
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Modern Content Overlay */}
                      <div className="relative h-full flex flex-col justify-center items-center text-white p-10">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl group-hover:rotate-12 transition-transform duration-500 group-hover:scale-110">
                            <Calendar className="h-10 w-10" />
                          </div>
                          <h4 className="text-2xl font-black mb-2 uppercase tracking-wider group-hover:text-white transition-colors duration-300">Öne Çıkan</h4>
                          <p className="text-lg opacity-90 font-medium group-hover:opacity-100 transition-opacity duration-300">Güncel Duyuru</p>
                          <div className="mt-4 h-px w-24 bg-white/60 mx-auto group-hover:w-32 transition-all duration-300"></div>
                        </div>
                      </div>
                      
                      {/* Enhanced Geometric Shapes */}
                      <div className="absolute top-8 right-8 w-16 h-16 border-2 border-white/30 rotate-45 animate-spin group-hover:scale-110 transition-transform duration-500" style={{animationDuration: '20s'}}></div>
                      <div className="absolute bottom-8 left-8 w-12 h-12 bg-white/20 rounded-full animate-bounce group-hover:scale-125 transition-transform duration-500" style={{animationDuration: '3s'}}></div>
                      
                      {/* Additional Decorative Elements */}
                      <div className="absolute top-1/4 left-1/4 w-8 h-8 border border-white/20 rotate-45 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      <div className="absolute bottom-1/4 right-1/4 w-6 h-6 bg-white/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{animationDelay: '1s'}}></div>
                    </div>

                    {/* Sağ Taraf - Modern İçerik */}
                    <CardContent className="p-10 flex flex-col justify-center">
                      {/* Modern Badge ve Tarih */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-blue-500 rounded-full opacity-75 blur-sm"></div>
                          <Badge className="relative bg-gradient-to-r from-red-600 to-blue-600 text-white border-0 px-4 py-1 font-bold">
                            {heroAnnouncement?.frontmatter?.tags?.[0] || heroAnnouncement?.tags?.[0] || "DUYURU"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{safeGetDate(heroAnnouncement?.publishDate || heroAnnouncement?.frontmatter?.date)}</span>
                        </div>
                      </div>

                      {/* Ana İçerik */}
                      <h3 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{safeGetTitle(heroAnnouncement)}</h3>
                      <p className="text-lg text-muted-foreground mb-6 leading-relaxed line-clamp-3">
                        {safeGetDescription(heroAnnouncement)}
                      </p>

                      {/* CTA Button */}
                      <div className="flex items-center gap-4">
                        <Button
                          asChild
                          size="lg"
                          className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white border-0 rounded-xl px-6 py-3 font-bold shadow-lg group-hover:shadow-xl transition-all duration-300"
                        >
                          <Link href={`/duyurular/${heroAnnouncement?.slug || heroAnnouncement?.id || "#"}`}>
                            Devamını Oku
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </Button>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span>Öne Çıkan İçerik</span>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          ) : null}

          {/* Magazine Style Layout */}
          <div className="relative mb-16 -mx-4 sm:-mx-6 lg:-mx-8">
            {latestAnnouncements.length === 0 ? (
              <div className="text-center py-16">
                <EmptyState text="Duyurular ve haberler yakında burada görünecek." />
              </div>
            ) : (
              <div className="flex flex-wrap w-full">
                {/* Ana Hero Kart */}
                {latestAnnouncements[0] && (
                  <div className="w-full sm:w-2/3 lg:w-2/3 group">
                    <div
                      className="relative h-64 sm:h-80 lg:h-96 overflow-hidden shadow-xl lg:shadow-2xl group-hover:shadow-red-500/25 transition-all duration-500 rounded-xl group-hover:scale-[1.02]"
                      style={(() => {
                        const src = pickAnnouncementCover(latestAnnouncements[0]);
                        return src ? bgStyle(src) : { background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)' };
                      })()}
                    >
                      {/* Enhanced Background Pattern */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:25px_25px] opacity-30"></div>
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-blue-600/30 to-purple-800/50"></div>
                      
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0">
                        {Array.from({ length: 25 }).map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-white/15 rounded-full animate-pulse"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              animationDelay: `${Math.random() * 3}s`,
                              animationDuration: `${2 + Math.random() * 2}s`
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-white">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 lg:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/25 backdrop-blur-md rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-wide lg:tracking-widest opacity-90 text-white">
                                {latestAnnouncements[0]?.frontmatter?.tags?.[0] || latestAnnouncements[0]?.tags?.[0] || 'DUYURU'}
                              </p>
                              <p className="text-xs lg:text-sm opacity-80 text-white">
                                {safeGetDate(latestAnnouncements[0]?.publishDate || latestAnnouncements[0]?.frontmatter?.date)}
                              </p>
                            </div>
                          </div>
                          <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                            01
                          </div>
                        </div>
                        
                        {/* Main Content */}
                        <div className="space-y-3 lg:space-y-4">
                          <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black leading-tight text-white">
                            {safeGetTitle(latestAnnouncements[0])}
                          </h2>
                          <p className="text-sm sm:text-base lg:text-lg opacity-90 leading-relaxed line-clamp-2 lg:line-clamp-3 text-white">
                            {safeGetDescription(latestAnnouncements[0])}
                          </p>
                          <Link 
                            href={`/duyurular/${latestAnnouncements[0]?.slug || latestAnnouncements[0]?.id || '#'}`}
                            className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-md rounded-full px-4 py-2 lg:px-6 lg:py-3 font-bold text-xs lg:text-sm hover:bg-white/35 transition-all duration-300 group-hover:translate-x-2 shadow-lg border border-white/20"
                          >
                            Devamını Oku
                            <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Link>
                        </div>
                        
                        {/* Decorative Elements */}
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Yan Kartlar */}
                <div className="w-full sm:w-1/3 lg:w-1/3 flex flex-col">
                  {latestAnnouncements.slice(1, 3).map((announcement: any, index: number) => {
                    const src = pickAnnouncementCover(announcement);
                    return (
                      <div key={`announcement-${index + 1}`} className="w-full group flex-1">
                        <div
                          className="relative h-40 sm:h-44 lg:h-48 overflow-hidden shadow-lg lg:shadow-xl transition-all duration-500 rounded-xl group-hover:scale-105"
                          style={src ? bgStyle(src) : { background: index === 0 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
                        >
                          {/* Enhanced Background Pattern */}
                          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%)] bg-[length:15px_15px] opacity-25"></div>
                          
                          {/* Red Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-red-600/50 via-red-700/40 to-red-800/60"></div>
                          
                          {/* Content */}
                          <div className="relative h-full flex flex-col justify-between p-6 text-white">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/25 backdrop-blur-md rounded-lg flex items-center justify-center shadow-md">
                                  <Calendar className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold opacity-90 text-white">
                                  {safeGetDate(announcement?.publishDate || announcement?.frontmatter?.date)}
                                </span>
                              </div>
                              <div className="w-6 h-6 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center text-xs font-black shadow-md">
                                {String(index + 2).padStart(2, '0')}
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <h3 className="text-lg font-bold leading-tight line-clamp-2 text-white">
                                {safeGetTitle(announcement)}
                              </h3>
                              <p className="text-sm opacity-90 line-clamp-2 text-white">
                                {safeGetDescription(announcement)}
                              </p>
                              <Link 
                                href={`/duyurular/${announcement.slug || announcement._id || announcement.id || '#'}`}
                                className="inline-flex items-center gap-1 text-xs font-bold opacity-90 hover:opacity-100 transition-opacity group-hover:translate-x-1 transition-transform duration-300 text-white"
                              >
                                Oku
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Alt Küçük Kartlar */}
                <div className="w-full flex flex-wrap">
                  {latestAnnouncements.slice(3, 6).map((announcement: any, index: number) => {
                    const src = pickAnnouncementCover(announcement);
                    return (
                      <div key={`announcement-small-${index + 3}`} className="w-full sm:w-1/2 lg:w-1/3 group">
                        <div
                          className="relative h-32 sm:h-36 lg:h-40 overflow-hidden shadow-md lg:shadow-lg transition-all duration-500 rounded-xl group-hover:scale-105"
                          style={src ? bgStyle(src) : { 
                            background: index === 0 ? 'linear-gradient(135deg, #10b981, #065f46)' : 
                                       index === 1 ? 'linear-gradient(135deg, #f97316, #c2410c)' : 
                                       'linear-gradient(135deg, #ec4899, #be185d)' 
                          }}
                        >
                          {/* Enhanced Background Pattern */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:12px_12px] opacity-30"></div>
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-transparent"></div>
                          
                          {/* Content */}
                          <div className="relative h-full flex flex-col justify-between p-4 text-white">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-white/25 backdrop-blur-md rounded-lg flex items-center justify-center shadow-sm">
                                  <Calendar className="h-3 w-3" />
                                </div>
                                <span className="text-xs font-bold opacity-90 text-white">
                                  {safeGetDate(announcement?.publishDate || announcement?.frontmatter?.date)}
                                </span>
                              </div>
                              <div className="w-5 h-5 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center text-xs font-black shadow-sm">
                                {String(index + 4).padStart(2, '0')}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h3 className="text-sm font-bold leading-tight line-clamp-2 text-white">
                                {safeGetTitle(announcement)}
                              </h3>
                              <p className="text-xs opacity-90 line-clamp-2 text-white">
                                {safeGetDescription(announcement)}
                              </p>
                              <Link 
                                href={`/duyurular/${announcement.slug || announcement._id || announcement.id || '#'}`}
                                className="inline-flex items-center gap-1 text-xs font-bold opacity-90 hover:opacity-100 transition-opacity group-hover:translate-x-1 transition-transform duration-300 text-white"
                              >
                                Oku
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Responsive CTA */}
          <div className="relative px-4 mt-12">
            <div className="bg-gradient-to-r from-slate-900 via-red-900 to-blue-900 dark:from-slate-800 dark:via-red-800 dark:to-blue-800 rounded-2xl lg:rounded-3xl p-6 lg:p-8 shadow-xl lg:shadow-2xl overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:30px_30px] lg:bg-[length:50px_50px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] lg:bg-[length:30px_50px]"></div>
              </div>

              {/* Mobile Optimized Content */}
              <div className="relative text-center text-white">
                <div className="inline-flex items-center gap-1.5 lg:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 lg:px-4 lg:py-2 mb-4 lg:mb-6">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-red-400 rounded-full animate-pulse"></div>
                  <span className="text-xs lg:text-sm font-bold uppercase tracking-wider">Daha Fazla Haber</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 lg:mb-4">Tüm Duyuruları Keşfet</h3>

                <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-6 lg:mb-8 max-w-sm sm:max-w-md lg:max-w-2xl mx-auto">
                  Sendikamızdan tüm güncel haberler, duyurular ve önemli gelişmeleri takip edin
                </p>

                <Link
                  href="/duyurular"
                  className="inline-flex items-center gap-2 lg:gap-3 bg-white text-slate-900 px-6 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg shadow-lg lg:shadow-xl hover:shadow-xl lg:hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  Tüm Duyuruları Gör
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-16 h-16 bg-white/5 rounded-full"></div>
              <div className="absolute bottom-8 left-8 w-24 h-24 bg-white/5 rounded-full"></div>
              <div className="absolute top-1/2 right-16 w-8 h-8 bg-red-400/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Sendika Hakkında - MVV Section */}
      <MVVSection />

      {/* Ultra Modern Galeri */}
      <section className="py-10 sm:py-14 lg:py-20 bg-muted">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {/* Modern Başlık */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-blue-500/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-red-200/20 dark:border-red-700/20">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Etkinlikler</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-red-600 to-blue-600 bg-clip-text text-transparent dark:from-white dark:via-red-400 dark:to-blue-400">
                Yaklaşan Etkinlikler
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sendikamızın düzenlediği etkinlikler ve önemli toplantılar
            </p>
            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-red-500 to-blue-500 rounded-full mx-auto"></div>
          </div>

          {/* Ultra Modern Etkinlikler Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {latest3.length ? (
              latest3.map((ev: any, idx: number) => (
                <Link
                  href={ev.slug ? `/etkinlikler/${ev.slug}` : `/etkinlikler/${ev._id || ev.id || "#"}`}
                  key={ev._id || ev.id || ev.slug || idx}
                  className="group relative"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1">
                    {ev.computedCover ? (
                      <img
                        src={ev.computedCover}
                        alt={ev.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-blue-50 dark:from-slate-800 dark:via-red-900/20 dark:to-blue-900/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    
                    {/* Enhanced Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="text-white">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-white/25 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg">
                            <Calendar className="h-4 w-4" />
                          </div>
                                                     <span className="text-xs font-bold opacity-90">
                             {ev.startDate ? new Date(ev.startDate).toLocaleDateString('tr-TR') : 
                              ev.date ? new Date(ev.date).toLocaleDateString('tr-TR') : ""}
                           </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 leading-tight">{ev.title}</h3>
                        {ev.excerpt && (
                          <p className="text-sm opacity-90 line-clamp-2 mb-3">{ev.excerpt}</p>
                        )}
                        {ev.location && (
                          <p className="text-xs opacity-80">{ev.location}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                    <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16">
                <EmptyState text="Henüz etkinlik eklenmemiş. Admin panelinden etkinlik ekleyebilirsiniz." />
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="relative inline-block group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-lg transition-all duration-300 animate-pulse"></div>
              <Button
                size="lg"
                asChild
                className="relative bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white border-0 rounded-2xl px-8 py-4 font-bold text-lg shadow-2xl"
              >
                <Link href="/etkinlikler">
                  Tüm Etkinlikleri Gör
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Yönetim Kurulu Bölümü */}
      <section className="py-10 sm:py-14 lg:py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {/* Modern Başlık */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-blue-500/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-red-200/20 dark:border-red-700/20">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Yönetim</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-red-600 to-blue-600 bg-clip-text text-transparent dark:from-white dark:via-red-400 dark:to-blue-400">
                Yönetim Kurulu
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sendikamızın yönetim kurulu üyeleri
            </p>
            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-red-500 to-blue-500 rounded-full mx-auto"></div>
          </div>

          {/* Yönetim Kurulu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {boardMembers.length ? (
              boardMembers.map((member: any, idx: number) => (
                <div key={member._id || idx} className="group">
                  <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-blue-50 dark:from-slate-800 dark:via-red-900/20 dark:to-blue-900/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <div className="text-white text-center">
                        <h3 className="text-lg font-bold mb-1 leading-tight">{member.name}</h3>
                        <p className="text-sm opacity-90">{member.position}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-4 text-center py-16">
                <EmptyState text="Henüz yönetim kurulu üyesi eklenmemiş. Admin panelinden üye ekleyebilirsiniz." />
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="relative inline-block group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-lg transition-all duration-300 animate-pulse"></div>
              <Button
                size="lg"
                asChild
                className="relative bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white border-0 rounded-2xl px-8 py-4 font-bold text-lg shadow-2xl"
              >
                <Link href="/yonetim">
                  Tüm Yönetim Kurulunu Gör
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
