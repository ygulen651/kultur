"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar, User, Clock, Eye, Download, FileText, ExternalLink } from 'lucide-react'
import { Section } from '@/components/Section'
import { Container } from '@/components/Container'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface KamuArItem {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  images: string[]
  file: string
  fileName: string
  fileType: string
  category: string
  tags: string[]
  author: string
  status: string
  isFeatured: boolean
  publishDate: string
  readTime: number
  viewCount: number
}

export default function KamuArSlugPage() {
  const params = useParams()
  const [item, setItem] = useState<KamuArItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadItem = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const slug = params.slug as string
        const response = await fetch(`/api/kamu-ar/${slug}`)
        
        if (!response.ok) {
          throw new Error('İçerik bulunamadı')
        }
        
        const result = await response.json()
        
        if (result.success) {
          setItem(result.data)
        } else {
          setError(result.message || 'İçerik yüklenemedi')
        }
      } catch (err: any) {
        console.error('KAMU-AR yükleme hatası:', err)
        setError(err.message || 'İçerik yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      loadItem()
    }
  }, [params.slug])

  const handleDownload = (item: KamuArItem) => {
    if (!item.file) {
      alert('Dosya bulunamadı!')
      return
    }

    const link = document.createElement('a')
    link.href = item.file
    link.download = item.fileName || 'dosya'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleView = (item: KamuArItem) => {
    if (!item.file) {
      alert('Dosya bulunamadı!')
      return
    }

    window.open(item.file, '_blank')
  }

  if (loading) {
    return (
      <Section padding="xl">
        <Container>
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-lg text-muted-foreground">İçerik yükleniyor...</p>
            </div>
          </div>
        </Container>
      </Section>
    )
  }

  if (error || !item) {
    return (
      <Section padding="xl">
        <Container>
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h1 className="text-3xl font-bold mb-4">İçerik Bulunamadı</h1>
            <p className="text-gray-600 mb-8">{error || 'Aradığınız içerik mevcut değil.'}</p>
            <Link href="/kamu-ar">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                KAMU-AR'a Dön
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <Section padding="xl">
        <Container>
          <div className="max-w-5xl mx-auto">
            {/* Geri Dön Butonu */}
            <Link 
              href="/kamu-ar" 
              className="inline-flex items-center text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> KAMU-AR'a Dön
            </Link>

            {/* Ana İçerik */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden">
              {/* Hero Görsel */}
              {item.coverImage && (
                <div className="relative h-64 md:h-80 lg:h-96">
                  <Image 
                    src={item.coverImage} 
                    alt={item.title} 
                    fill 
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* İçerik Bilgileri - Görsel üzerinde */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex flex-wrap items-center gap-4 text-sm opacity-90 mb-3">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.publishDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <User className="w-4 h-4" />
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4" />
                        <span>{item.readTime} dk okuma</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                        <Eye className="w-4 h-4" />
                        <span>{item.viewCount || 0} görüntülenme</span>
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg">
                      {item.title}
                    </h1>
                    {item.excerpt && (
                      <p className="text-lg text-white/90 mt-4 max-w-3xl">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* İçerik Detayları */}
              <div className="p-6 md:p-8">
                {/* Üst Bilgiler */}
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b">
                  <Badge variant="secondary">{item.category}</Badge>
                  {item.isFeatured && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Öne Çıkan
                    </Badge>
                  )}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ana İçerik */}
                <div className="prose prose-lg max-w-none mb-8">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </div>
                </div>

                {/* Ek Görseller */}
                {item.images && item.images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Ek Görseller</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.images.map((image, index) => (
                        <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                          <Image
                            src={image}
                            alt={`${item.title} - Ek Görsel ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ek Dosya */}
                {item.file && (
                  <div className="mb-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <h3 className="font-semibold mb-3">Ek Dosya</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="font-medium">{item.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.fileType?.toUpperCase()} • {item.fileType}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={() => handleDownload(item)}>
                          <Download className="h-4 w-4 mr-2" />
                          İndir
                        </Button>
                        <Button variant="outline" onClick={() => handleView(item)}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Görüntüle
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alt Bilgiler */}
                <div className="pt-6 border-t text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span>Yazar: {item.author}</span>
                      <span>•</span>
                      <span>Yayın Tarihi: {new Date(item.publishDate).toLocaleDateString('tr-TR')}</span>
                      <span>•</span>
                      <span>Okuma Süresi: {item.readTime} dakika</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{item.viewCount || 0} görüntülenme</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}


