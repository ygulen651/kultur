"use client";

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Eye, Share2, Download, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Section } from '@/components/Section'
import { Container } from '@/components/Container'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

// API'den duyuru getir
async function getAnnouncementBySlug(slug: string) {
  try {
    console.log('🔍 getAnnouncementBySlug çağrıldı, slug:', slug);
    
    // Relative URL kullan - Vercel'de çalışır
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    
    const response = await fetch(`${baseUrl}/api/announcements?status=published`, {
      cache: 'no-store'
    });
    
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ API hatası:', response.status, response.statusText);
      return null;
    }
    
    const result = await response.json();
    console.log('📊 API Response data:', result);
    
    // API response yapısını kontrol et
    const announcements = result.items || result.data || [];
    console.log('📢 Bulunan duyuru sayısı:', announcements.length);
    
    // Önce slug ile ara
    let announcement = announcements.find((a: any) => a.slug === slug);
    console.log('🔍 Slug ile arama sonucu:', announcement ? 'Bulundu' : 'Bulunamadı');
    
    // Eğer slug bulunamazsa, ID ile ara (ObjectId formatı için)
    if (!announcement && /^[0-9a-fA-F]{24}$/.test(slug)) {
      announcement = announcements.find((a: any) => a._id === slug);
      console.log('🔍 ID ile arama sonucu:', announcement ? 'Bulundu' : 'Bulunamadı');
    }
    
    if (announcement) {
      console.log('✅ Duyuru bulundu:', {
        title: announcement.title,
        slug: announcement.slug,
        _id: announcement._id
      });
    } else {
      console.log('❌ Duyuru bulunamadı');
    }
    
    return announcement || null;
  } catch (error) {
    console.error('❌ getAnnouncementBySlug hatası:', error);
    return null;
  }
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default function DuyuruDetayPage({ params }: PageProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [announcement, setAnnouncement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // useEffect ile veri yükleme
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    async function loadAnnouncement() {
      try {
        console.log('🔄 loadAnnouncement başladı');
        
        // Timeout ekle (10 saniye)
        timeoutId = setTimeout(() => {
          console.log('⏰ Timeout - loading false yapılıyor');
          setLoading(false);
        }, 10000);
        
        const { slug } = await params;
        console.log('🔍 Slug alındı:', slug);
        
        const data = await getAnnouncementBySlug(slug);
        console.log('📊 getAnnouncementBySlug sonucu:', data);
        
        setAnnouncement(data);
        console.log('✅ Announcement state güncellendi');
        
      } catch (error) {
        console.error('❌ Error loading announcement:', error);
        setAnnouncement(null);
      } finally {
        clearTimeout(timeoutId);
        console.log('🏁 Loading false yapılıyor');
        setLoading(false);
      }
    }
    
    loadAnnouncement();
    
    // Cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, [params]);
  // Loading state kontrolü
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium mb-2">Duyuru yükleniyor...</p>
          <p className="text-sm text-gray-500">Lütfen bekleyin</p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Eğer uzun süre bekliyorsanız sayfayı yenileyin</p>
          </div>
        </div>
      </div>
    );
  }

  // Duyuru bulunamadı kontrolü
  if (!announcement) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Duyuru bulunamadı</h1>
          <p className="text-gray-600 mb-4">Aradığınız duyuru bulunamadı veya yayından kaldırılmış olabilir.</p>
          <Link href="/duyurular" className="text-red-600 hover:text-red-700">
            ← Duyurulara geri dön
          </Link>
        </div>
      </div>
    );
  }

  console.log('📢 Bulunan duyuru:', {
    title: announcement.title,
    slug: announcement.slug,
    status: announcement.status,
    featuredImageUrl: announcement.featuredImageUrl,
    images: announcement.images?.length || 0,
    fields: announcement.fields,
    imageFilename: announcement.imageFilename
  });

  console.log('🔍 Duyuru detay sayfası - Debug bilgileri:', {
    title: announcement.title,
    featuredImageUrl: announcement.featuredImageUrl,
    images: announcement.images,
    fields: announcement.fields,
    imageFilename: announcement.imageFilename,
    rawAnnouncement: announcement
  });

  return (
    <>
      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <Image
              src={selectedImage}
              alt="Büyük görsel"
              width={1920}
              height={1080}
              className="object-contain max-h-[90vh] w-auto"
              unoptimized
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Hero Section - tam genişlik görsel + overlay + büyük başlık */}
      <div className="relative w-full">
        <div className="relative w-full aspect-[16/9] md:aspect-[18/9] lg:aspect-[21/9]">
          <Image
            src={announcement.featuredImageUrl || announcement.images?.[0] || announcement.fields?.image?.url || 'https://images.unsplash.com/theme/1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop'}
            alt={announcement.title}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
          {/* Alt taraftan yukarı güçlü koyu degrade */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          {/* Üst tarafta hafif karartma ve okunurluk için */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/30 to-transparent" />
          <Container>
            <div className="absolute inset-0 flex items-end justify-center pb-8">
              <div className="w-full max-w-3xl md:max-w-4xl mx-auto text-center">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-3">
                  <Link href="/" className="text-white/85 hover:text-white bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-xs md:text-sm transition-colors">Ana Sayfa</Link>
                  <span className="text-white/60">/</span>
                  <Link href="/duyurular" className="text-white/85 hover:text-white bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-xs md:text-sm transition-colors">Duyurular</Link>
                </div>
                {/* Başlık bloğu */}
                <div className="bg-black/35 backdrop-blur-sm rounded-2xl inline-block shadow-[0_10px_30px_rgba(0,0,0,0.25)] px-4 md:px-6 py-4 md:py-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-white/15 text-white border-white/20">
                      {announcement.category || 'Genel'}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight md:leading-snug drop-shadow-md max-w-[68ch]">
                    {announcement.title}
                  </h1>
                </div>
                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-6 text-white/85">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(announcement.publishDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{announcement.author || 'Admin'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{announcement.views || 0} görüntülenme</span>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* Content */}
      <Section padding="xl">
        <Container>
          <div className="max-w-3xl mx-auto">
            {/* Özet */}
            {announcement.excerpt && (
              <div className="text-xl md:text-2xl leading-relaxed text-muted-foreground mb-10 p-6 bg-muted/50 rounded-2xl border border-muted">
                {announcement.excerpt}
              </div>
            )}

            {/* İçerik */}
            <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: announcement.content.replace(/\n/g, '<br />') }} />
            </div>

            {/* Ek Görseller */}
            {(announcement.images && announcement.images.length > 0) || (announcement.fields?.image?.url) ? (
              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Ek Görseller</h3>
                

                
                <div className="grid grid-cols-1 gap-8">
                  {/* Ana görsel */}
                  {announcement.fields?.image?.url && (
                    <div 
                      className="relative aspect-[21/9] rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl cursor-pointer group"
                      onClick={() => setSelectedImage(announcement.fields.image.url)}
                    >
                      <Image
                        src={announcement.fields.image.url}
                        alt={`${announcement.title} - Ana Görsel`}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="100vw"
                        quality={95}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-black px-4 py-2 rounded-full font-semibold">
                          🔍 Büyüt
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Ek görseller */}
                  {announcement.images && announcement.images.map((imageUrl: string, index: number) => (
                    <div 
                      key={index} 
                      className="relative aspect-[21/9] rounded-3xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-2xl cursor-pointer group"
                      onClick={() => setSelectedImage(imageUrl)}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${announcement.title} - Ek Görsel ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="100vw"
                        quality={95}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-black px-4 py-2 rounded-full font-semibold">
                          🔍 Büyüt
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-10 p-4 bg-gray-50 dark:bg-gray-800 rounded border">
                <p className="text-muted-foreground">Bu duyuru için ek görsel bulunmuyor.</p>
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Images array: {announcement.images ? `${announcement.images.length} adet` : 'Yok'}</p>
                  <p>Fields image: {announcement.fields?.image?.url ? 'Var' : 'Yok'}</p>
                </div>
              </div>
            )}

            {/* Dosya İndir */}
            {announcement.fileUrl && (
              <div className="mt-10">
                <Button asChild>
                  <a href={announcement.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Ek Dosyayı İndir
                  </a>
                </Button>
              </div>
            )}

            {/* Ek Dosyalar */}
            {announcement.files && announcement.files.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Ek Dosyalar</h3>
                <div className="space-y-3">
                  {announcement.files.map((file: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''} • {file.type}
                          </p>
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" /> İndir
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Görsel Galerisi - Kaldırıldı, sadece Ek Görseller bölümü kaldı */}

            {/* Etiketler + Paylaşım */}
            <div className="mt-12 pt-8 border-t flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {announcement.tags && announcement.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {announcement.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(announcement.title)}`} target="_blank" rel="noopener noreferrer">Twitter</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`/duyurular/${announcement.slug}`)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Son Duyurular */}
      <Section padding="xl" background="muted">
        <Container>
          <RelatedAnnouncements currentSlug={announcement.slug} />
        </Container>
      </Section>
    </>
  )
}



// İlgili duyurular (aynı kategoriden son 3 duyuru)
async function fetchRelated(category: string, currentSlug: string) {
  try {
          // Relative URL kullan - Vercel'de daha güvenilir
      const res = await fetch(`/api/announcements?status=published&category=${encodeURIComponent(category)}&limit=3`, { cache: 'no-store' })
    const json = await res.json()
    const items = json.success ? json.data : []
    return items.filter((x: any) => x.slug !== currentSlug).slice(0, 3)
  } catch {
    return []
  }
}

async function RelatedAnnouncements({ currentSlug }: { currentSlug: string }) {
  // Kategori bilgisine erişmek için duyuruyu tekrar almamamız için basit bir çözüm:
  const curr = await getAnnouncementBySlug(currentSlug)
  const items = curr ? await fetchRelated(curr.category || 'genel', currentSlug) : []

  if (!items.length) return null

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">İlgili Duyurular</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((it: any) => (
          <Link key={it._id} href={`/duyurular/${it.slug}`} className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border hover:shadow-md transition-all">
            <div className="relative aspect-[16/9] bg-black/5">
              {(it.featuredImageUrl || it.fields?.image?.url) && (
                <Image src={it.featuredImageUrl || it.fields?.image?.url} alt={it.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
              )}
            </div>
            <div className="p-4">
              <div className="text-xs text-muted-foreground mb-2">
                {new Date(it.publishDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              <div className="font-semibold line-clamp-2 group-hover:text-primary">
                {it.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
