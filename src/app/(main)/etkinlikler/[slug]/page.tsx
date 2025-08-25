import Image from 'next/image'
import Link from 'next/link'
import { Section } from '@/components/Section'
import { Container } from '@/components/Container'
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react'

async function getEvent(slug: string) {
  try {
    // Next.js 15 URL parsing hatası için absolute URL kullan
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.kultursanatis.com.tr';
    const res = await fetch(`${baseUrl}/api/events?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
    const json = await res.json()
    
    console.log('🔍 getEvent API response:', json)
    
    // API'den gelen veriyi kontrol et
    const items = json.success ? json.items : []
    console.log('🔍 getEvent items:', items)
    
    return Array.isArray(items) ? items[0] : null
  } catch (error) {
    console.error('❌ getEvent error:', error)
    return null
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ev = await getEvent(slug)

  if (!ev) {
    return (
      <Section padding="xl">
        <Container>
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Etkinlik bulunamadı</h1>
            <Link href="/etkinlikler" className="inline-flex items-center text-primary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Etkinliklere dön
            </Link>
          </div>
        </Container>
      </Section>
    )
  }

  const date = ev.publishedAt ? new Date(ev.publishedAt).toLocaleDateString('tr-TR') : 
               ev.date ? new Date(ev.date).toLocaleDateString('tr-TR') : 'Tarih belirtilmemiş'

  return (
    <Section padding="xl">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Geri Dön Butonu */}
          <Link 
            href="/etkinlikler" 
            className="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Etkinliklere Dön
          </Link>

          {/* Ana İçerik */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
            {/* Hero Görsel */}
            {ev.image?.url && (
              <div className="relative h-64 md:h-80 lg:h-96">
                <Image 
                  src={ev.image.url} 
                  alt={ev.title} 
                  fill 
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Etkinlik Bilgileri - Görsel üzerinde */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="flex flex-wrap items-center gap-4 text-sm opacity-90 mb-3">
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                    {ev.location && (
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <MapPin className="w-4 h-4" />
                        <span>{ev.location}</span>
                      </div>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
                    {ev.title}
                  </h1>
                </div>
              </div>
            )}

            {/* İçerik Detayları */}
            <div className="p-6 md:p-8">
              {/* Etkinlik Özeti */}
              {ev.excerpt && (
                <div className="mb-6">
                  <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ev.excerpt}
                  </p>
                </div>
              )}

              {/* Etkinlik Açıklaması */}
              {ev.content && (
                <div className="prose dark:prose-invert max-w-none">
                  <div className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    {ev.content}
                  </div>
                </div>
              )}

              {/* Ek Bilgiler */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Yayın Tarihi: {date}</span>
                  </div>
                  {ev.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Konum: {ev.location}</span>
                    </div>
                  )}
                  {ev.featured && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span>Öne Çıkan Etkinlik</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}


