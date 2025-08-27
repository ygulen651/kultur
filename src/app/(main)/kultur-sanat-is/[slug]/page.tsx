'use client'

import { useEffect, useState } from "react"
import { FileText, Download, Calendar, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Section } from "@/components/Section"
import { Container } from "@/components/Container"
import Link from "next/link"

interface Post {
  _id: string
  title: string
  slug: string
  excerpt?: string
  author: string
  category: string
  publishAt?: string
  featured: boolean
  content: string
  cover?: {
    url: string
    publicId: string
  }
  gallery?: Array<{
    url: string
    publicId: string
  }>
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  mimeType?: string
  publicId?: string
  createdAt: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [slug, setSlug] = useState<string>("")

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setSlug(resolvedParams.slug)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/kultur-sanat-is`)
      if (response.ok) {
        const data = await response.json()
        const foundPost = data.posts?.find((p: Post) => p.slug === slug)
        setPost(foundPost || null)
      }
    } catch (error) {
      console.error('İçerik yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (post: Post) => {
    try {
      console.log('Download clicked for post:', post);
      console.log('Post fileUrl:', post.fileUrl);
      
      if (!post.fileUrl) {
        alert('Dosya bulunamadı!')
        return
      }

      // PDF'i doğrudan indir
      const link = document.createElement('a');
      link.href = post.fileUrl;
      link.download = post.fileName || 'dosya.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Dosya indirme hatası:', error)
      alert('Dosya indirilemedi. Lütfen tekrar deneyin.')
    }
  }

  const handleView = (post: Post) => {
    try {
      console.log('View clicked for post:', post);
      console.log('Post fileUrl:', post.fileUrl);
      
      if (!post.fileUrl) {
        alert('Dosya bulunamadı!')
        return
      }

      // PDF'i yeni sekmede aç - Cloudinary URL'i ile
      const viewUrl = post.fileUrl.replace('/raw/upload/', '/fl_attachment/');
      window.open(viewUrl, '_blank');
    } catch (error) {
      console.error('Dosya görüntüleme hatası:', error)
      alert('Dosya görüntülenemedi. Lütfen tekrar deneyin.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">İçerik yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-semibold mb-2">İçerik bulunamadı</h3>
        <p className="text-muted-foreground mb-4">Aradığınız içerik mevcut değil.</p>
        <Link href="/kultur-sanat-is">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="mb-6">
            <Link href="/kultur-sanat-is">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Geri Dön
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {post.excerpt}
              </p>
            )}
          </div>
        </Container>
      </Section>

      {/* İçerik */}
      <Section padding="xl">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Kapak Görseli */}
            {post.cover && (
              <div className="mb-8">
                <img 
                  src={post.cover.url} 
                  alt={post.title}
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
            )}

            {/* Meta Bilgiler */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{post.author}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              
              <Badge variant="outline">{post.category}</Badge>
              
              {post.featured && (
                <Badge variant="destructive">Öne Çıkan</Badge>
              )}
            </div>

            {/* PDF Dosya Bilgileri */}
            {post.fileUrl && (
              <div className="mb-6 p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Ek Dosya</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-medium">{post.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {post.fileType?.toUpperCase()} • {formatFileSize(post.fileSize || 0)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={() => handleDownload(post)}>
                      <Download className="h-4 w-4 mr-2" />
                      İndir
                    </Button>
                    <Button variant="outline" onClick={() => handleView(post)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Görüntüle
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Ana İçerik */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">
                {post.content}
              </div>
            </div>

            {/* Galeri */}
            {post.gallery && post.gallery.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Galeri</h3>
                <div className="space-y-4">
                  {post.gallery.map((image, index) => (
                    <div key={index} className="w-full">
                      <img 
                        src={image.url} 
                        alt={`${post.title} - Görsel ${index + 1}`}
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}

