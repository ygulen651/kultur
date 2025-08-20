export const dynamic = "force-dynamic";
export const revalidate = 0;
import Link from "next/link"
import { ArrowRight, Calendar, Users, Award, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import HeroCarousel from "@/components/HeroCarousel";
import AnnouncementCard from "@/components/AnnouncementCard"

import EmptyState from "@/components/EmptyState"
import { getSiteData, getAnnouncements, getSliders, getKamuAr } from "@/lib/data"
import { pickAnnouncementCover } from '@/lib/ui';
import MVVSection from '@/components/home/MVVSection';
import { getEvents } from "@/lib/get-events";
import EventsRow from "@/components/EventsRow";

// Güvenli veri işleme fonksiyonu
function safeGetDate(dateString: string | undefined): string {
  if (!dateString) return 'Tarih belirtilmemiş'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Geçersiz tarih'
    return date.toLocaleDateString('tr-TR')
  } catch (error) {
    console.warn('Date parsing error:', error)
    return 'Tarih belirtilmemiş'
  }
}

function safeGetTitle(item: any): string {
  return item?.title || item?.frontmatter?.title || 'Başlık bulunamadı'
}

function safeGetDescription(item: any): string {
  return item?.excerpt || item?.description || item?.frontmatter?.description || 'Açıklama bulunamadı'
}

function safeGetYear(item: any): string {
  const raw = item?.date || item?.publishDate || item?.frontmatter?.date
  if (!raw) return ''
  try {
    const d = new Date(raw)
    if (isNaN(d.getTime())) return ''
    return String(d.getFullYear())
  } catch { return '' }
}

const bgStyle = (src: string) => ({
  backgroundImage: `linear-gradient(135deg, rgba(220,38,38,.78) 0%, rgba(59,130,246,.55) 100%), url("${src}")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
});

export default async function Home() {
  const siteData = await getSiteData();
  const sliders = await getSliders();
  const heroSlides = Array.isArray(sliders) ? sliders : [];
  const items = await getAnnouncements();
  const _published = Array.isArray(items) ? items.filter(a => !!a?.publishedAt) : [];
  const featuredAnnouncements = _published.filter(a => a.isFeatured === true || a.featured === true || a.isFeatured === "true" || a.featured === "true");
  const latestAnnouncements = [..._published]
    .sort((a, b) =>
      new Date(b.publishedAt ?? b.createdAt ?? 0).getTime() -
      new Date(a.publishedAt ?? a.createdAt ?? 0).getTime()
    )
    .slice(0, 6);
  const heroAnnouncement = featuredAnnouncements[0] ?? latestAnnouncements[0] ?? null;

  const events = await getEvents({ published: "true" });
  const latest3 = events.slice(0, 3);

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
      <section className="section">
        <div className="stack">
          {/* Mobile Responsive Başlık */}
          <div className="text-center mb-6 md:mb-12">
            <div className="relative inline-block">
              {/* Mobile Optimized Glow */}
              <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-red-600/20 via-blue-600/20 to-purple-600/20 rounded-xl md:rounded-2xl blur-lg md:blur-xl animate-pulse"></div>
              
              {/* Mobile Optimized Badge */}
              <div className="relative inline-flex items-center gap-1.5 md:gap-2 bg-black/5 dark:bg-white/5 backdrop-blur-xl rounded-full px-4 py-1.5 md:px-6 md:py-2 mb-4 md:mb-6 border border-red-200/30 dark:border-red-700/30">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                </div>
                <span className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wider">Son Duyurular</span>
              </div>
            </div>
            
            <h2
              className="h2 whitespace-nowrap text-[clamp(28px,6vw,64px)] mb-3 md:mb-4"
              title="Güncel Haberler"
            >
              <span className="bg-gradient-to-r from-slate-900 via-red-600 to-blue-600 bg-clip-text text-transparent dark:from-white dark:via-red-400 dark:to-blue-400">
                Güncel&nbsp;Haberler
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
                    {(() => {
                      const f = heroAnnouncement;
                      const src = pickAnnouncementCover(f);
                      return (
                        <div
                          className="relative overflow-hidden"
                          style={src ? bgStyle(src) : { background: 'linear-gradient(135deg, #dc2626, #1d4ed8)' }}
                        >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:30px_30px]"></div>
                      </div>
                      
                      {/* Animated Floating Elements */}
                      <div className="absolute inset-0">
                        {[...Array(20)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-3 h-3 bg-white/20 rounded-full animate-pulse"
                            style={{
                              left: `${Math.random() * 100}%`,
                              top: `${Math.random() * 100}%`,
                              animationDelay: `${Math.random() * 3}s`,
                              animationDuration: `${2 + Math.random() * 2}s`
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Modern Content Overlay */}
                      <div className="relative h-full flex flex-col justify-center items-center text-white p-10">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                            <Calendar className="h-10 w-10" />
                          </div>
                          <h4 className="text-2xl font-black mb-2 uppercase tracking-wider">Öne Çıkan</h4>
                          <p className="text-lg opacity-90 font-medium">Güncel Duyuru</p>
                          <div className="mt-4 h-px w-24 bg-white/60 mx-auto"></div>
                        </div>
                      </div>
                      
                      {/* Geometric Shapes */}
                      <div className="absolute top-8 right-8 w-16 h-16 border-2 border-white/30 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
                      <div className="absolute bottom-8 left-8 w-12 h-12 bg-white/20 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
                        </div>
                      );
                    })()}
                    
                    {/* Sağ Taraf - Modern İçerik */}
                    <CardContent className="p-10 flex flex-col justify-center">
                      {/* Modern Badge ve Tarih */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-blue-500 rounded-full opacity-75 blur-sm"></div>
                          <Badge className="relative bg-gradient-to-r from-red-600 to-blue-600 text-white border-0 px-4 py-1 font-bold">
                            ÖNE ÇIKAN
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {safeGetDate(heroAnnouncement?.publishedAt || heroAnnouncement?.frontmatter?.date)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Başlık */}
                      <h3 className="text-3xl lg:text-4xl font-black mb-6 leading-tight group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-blue-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                        {safeGetTitle(heroAnnouncement)}
                      </h3>
                      
                      {/* Açıklama */}
                      <p className="text-muted-foreground mb-8 text-lg leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50">
                        {safeGetDescription(heroAnnouncement)}
                      </p>
                      
                      {/* Modern CTA */}
                      <div className="relative inline-block w-fit">
                        <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-lg transition-all duration-300 animate-pulse"></div>
                        <Button size="lg" asChild className="relative bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white border-0 rounded-2xl px-8 py-4 font-bold text-lg shadow-2xl">
                          <Link href={`/duyurular/${heroAnnouncement?.slug || heroAnnouncement?._id || '#'}`}>
                            Devamını Oku
                            <ArrowRight className="ml-3 h-5 w-5" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            // Empty state for featured announcements
            <div className="mb-16">
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900 rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-400 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Öne Çıkan Duyuru Yok
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Henüz öne çıkan duyuru eklenmemiş. Admin panelinden duyuruları öne çıkarabilirsiniz.
                </p>
                <Link 
                  href="/duyurular"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-slate-700 hover:to-blue-700 transition-all duration-300"
                >
                  Tüm Duyuruları Gör
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Magazine Style Bento Grid Layout */}
          <div className="relative mb-16 -mx-8 sm:-mx-12 lg:-mx-16">
            {/* Mobile Responsive Grid Container - No Gaps */}
            <div className="flex flex-wrap w-full">
              
              {/* Highlights listesi boşsa mesaj göster */}
              {latestAnnouncements.length === 0 ? (
                <div className="w-full text-center py-16">
                  <EmptyState text="Duyurular ve haberler yakında burada görünecek. (latestAnnouncements boş)" />
                </div>
              ) : (
                <>
                  {/* Mobile Optimized Featured Haber */}
                  {latestAnnouncements[0] && (
                    <div className="w-full sm:w-2/3 lg:w-2/3 group">
                      <div
                        className="relative h-64 sm:h-80 lg:h-96 overflow-hidden shadow-xl lg:shadow-2xl group-hover:shadow-red-500/25 transition-all duration-500"
                        style={pickAnnouncementCover(latestAnnouncements[0]) ? bgStyle(pickAnnouncementCover(latestAnnouncements[0])) : { background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:25px_25px] opacity-30"></div>
                        
                        {/* Animated Background Pattern */}
                        <div className="absolute inset-0">
                          {[...Array(30)].map((_, i) => (
                            <div
                              key={i}
                              className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
                              style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Mobile Optimized Content */}
                        <div className="relative h-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-white">
                          {/* Mobile Optimized Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 lg:gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl flex items-center justify-center">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide lg:tracking-widest opacity-80">
                                  {latestAnnouncements[0]?.frontmatter?.tags?.[0] || latestAnnouncements[0]?.tags?.[0] || 'DUYURU'}
                                </p>
                                <p className="text-xs lg:text-sm opacity-60">
                                  {safeGetDate(latestAnnouncements[0]?.publishedAt || latestAnnouncements[0]?.frontmatter?.date)}
                                </p>
                              </div>
                            </div>
                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-black">
                              01
                            </div>
                          </div>
                          
                          {/* Mobile Optimized Main Content */}
                          <div className="space-y-3 lg:space-y-4">
                            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black leading-tight">
                              {safeGetTitle(latestAnnouncements[0])}
                            </h2>
                            <p className="text-sm sm:text-base lg:text-lg opacity-90 leading-relaxed line-clamp-2 lg:line-clamp-3">
                              {safeGetDescription(latestAnnouncements[0])}
                            </p>
                            <Link 
                              href={`/duyurular/${latestAnnouncements[0]?.slug || latestAnnouncements[0]?.id || '#'}`}
                              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 lg:px-6 lg:py-3 font-bold text-xs lg:text-sm hover:bg-white/30 transition-all duration-300 group-hover:translate-x-2"
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
                  
                  {/* Mobile Responsive Orta Boyut Haberler */}
                  <div className="w-full sm:w-1/3 lg:w-1/3 flex flex-col">
                  {latestAnnouncements.slice(1, 3).map((announcement: any, index: number) => {
                    const src = pickAnnouncementCover(announcement);
                    return (
                    <div key={`announcement-${index + 1}`} className="w-full group flex-1">
                      <div
                        className="relative h-40 sm:h-44 lg:h-48 overflow-hidden shadow-lg lg:shadow-xl transition-all duration-500 rounded-xl group-hover:scale-105"
                        style={src ? bgStyle(src) : { background: index === 0 ? 'linear-gradient(135deg, #2563eb, #1e40af)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)' }}
                      >
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_25%,transparent_25%)] bg-[length:15px_15px] opacity-25"></div>
                        
                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-between p-6 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <span className="text-xs font-bold opacity-80">
                                {safeGetDate(announcement?.publishedAt || announcement?.frontmatter?.date)}
                              </span>
                            </div>
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-black">
                              {String(index + 2).padStart(2, '0')}
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h3 className="text-lg font-bold leading-tight line-clamp-2">
                              {safeGetTitle(announcement)}
                            </h3>
                            <p className="text-sm opacity-80 line-clamp-2">
                              {safeGetDescription(announcement)}
                            </p>
                            <Link 
                              href={`/duyurular/${announcement.slug || announcement._id || announcement.id || '#'}`}
                              className="inline-flex items-center gap-1 text-xs font-bold opacity-90 hover:opacity-100 transition-opacity group-hover:translate-x-1 transition-transform duration-300"
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
                  
                  {/* Mobile Responsive Küçük Haberler */}
                  <div className="w-full flex flex-wrap">
                  {latestAnnouncements.slice(3, 6).map((announcement: any, index: number) => {
                    const src = pickAnnouncementCover(announcement);
                    return (
                    <div key={`announcement-small-${index + 3}`} className="w-full sm:w-1/2 lg:w-1/3 group">
                      <div
                        className="relative h-32 sm:h-36 lg:h-40 overflow-hidden shadow-md lg:shadow-lg transition-all duration-500 rounded-xl group-hover:scale-105"
                        style={src ? bgStyle(src) : { background: index === 0 ? 'linear-gradient(135deg, #10b981, #065f46)' : index === 1 ? 'linear-gradient(135deg, #f97316, #c2410c)' : 'linear-gradient(135deg, #ec4899, #be185d)' }}
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:12px_12px] opacity-30"></div>
                        
                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-between p-4 text-white">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                                <Calendar className="h-3 w-3" />
                              </div>
                              <span className="text-xs font-bold opacity-80">
                                {safeGetDate(announcement?.publishedAt || announcement?.frontmatter?.date)}
                              </span>
                            </div>
                            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-black">
                              {String(index + 4).padStart(2, '0')}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold leading-tight line-clamp-2">
                              {safeGetTitle(announcement)}
                            </h3>
                            <p className="text-xs opacity-80 line-clamp-2">
                              {safeGetDescription(announcement)}
                            </p>
                            <Link 
                              href={`/duyurular/${announcement.slug || announcement._id || announcement.id || '#'}`}
                              className="inline-flex items-center gap-1 text-xs font-bold opacity-90 hover:opacity-100 transition-opacity group-hover:translate-x-1 transition-transform duration-300"
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
                </>
              )}
            </div>
          </div>

          {/* Mobile Responsive CTA */}
          <div className="relative px-4">
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
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 lg:mb-4">
                  Tüm Duyuruları Keşfet
                </h3>
                
                <p className="text-sm sm:text-base lg:text-lg opacity-90 mb-6 lg:mb-8 max-w-sm sm:max-w-md lg:max-w-2xl mx-auto">
                  Sendikamızdan tüm güncel haberler, duyurular ve önemli gelişmeleri takip edin
                </p>
                
                <Link 
                  href="/duyurular"
                  className="inline-flex items-center gap-2 lg:gap-3 bg-white text-slate-900 px-6 py-3 lg:px-8 lg:py-4 rounded-xl lg:rounded-2xl font-bold text-base lg:text-lg shadow-lg lg:shadow-xl hover:shadow-xl lg:hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  Tüm Duyuruları Gör
                  <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 group-hover:translate-x-1 transition-transform" />
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

      {/* Kamu-AR Öne Çıkanlar - Yorum satırında kaldı */}

      {/* Sendika Hakkında - MVV Section */}
      <MVVSection />

      {/* Ultra Modern Galeri */}
      <section className="section bg-muted">
        <div className="stack">
          {/* Modern Başlık */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/10 to-blue-500/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-red-200/20 dark:border-red-700/20">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Galeri</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-slate-900 via-red-600 to-blue-600 bg-clip-text text-transparent dark:from-white dark:via-red-400 dark:to-blue-400">
                Etkinliklerimiz
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Sendikamızın düzenlediği etkinliklerden ve özel anlarımızdan kareler
            </p>
            <div className="mt-6 h-1 w-24 bg-gradient-to-r from-red-500 to-blue-500 rounded-full mx-auto"></div>
          </div>

          {/* Ultra Modern Galeri Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {latest3.length ? (
              latest3.map((ev: any, idx: number) => (
                <Link href={`/etkinlikler/${ev.slug || ev._id || ev.id || '#'}`} key={ev._id || ev.id || ev.slug || idx} className="group relative">
                  <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105">
                    {ev.computedCover ? (
                      <img src={ev.computedCover} alt={ev.title} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-blue-50 dark:from-slate-800 dark:via-red-900/20 dark:to-blue-900/20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-blue-500 rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-lg group-hover:rotate-12 transition-transform duration-500">
                          <Calendar className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{ev.startAt ? new Date(ev.startAt).getFullYear() : ''}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-2 md:col-span-4 text-center py-16">
                <EmptyState text="Henüz etkinlik eklenmemiş. Admin panelinden etkinlik ekleyebilirsiniz." />
              </div>
            )}
          </div>

          
          <div className="text-center">
            <div className="relative inline-block group">
              <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-lg transition-all duration-300 animate-pulse"></div>
              <Button size="lg" asChild className="relative bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white border-0 rounded-2xl px-8 py-4 font-bold text-lg shadow-2xl">
                <Link href="/galeri">
                  Tüm Galeriyi Keşfet
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}