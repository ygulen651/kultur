'use client'

import { Suspense } from "react"
import { FileText, Download, Calendar, User, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Section } from "@/components/Section"
import { Container } from "@/components/Container"

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
  // PDF bilgileri - bilgi-belge gibi
  fileUrl?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  mimeType?: string
  createdAt: string
}

// Statik içerik verileri (test için)
const posts: Post[] = [
  {
    "_id": "1",
    "title": "NEDEN KÜLTÜR SANAT-İŞ SENDİKASINA ÜYE OLMALIYIZ",
    "slug": "neden-kultur-sanat-is-sendikasina-uye-olmaliyiz",
    "excerpt": "Kültür Sanat İş sendikasına neden üye olunmalı konusunda detaylı bilgi",
    "author": "Admin",
    "category": "Genel",
    "publishAt": "2025-08-27T00:00:00.000Z",
    "featured": true,
    "content": "Detaylı içerik...",
    "fileUrl": "/uploads/1754912116203-NEDEN_KULTUR_SANAT-IS_SENDIKASINA_UYE_OLMALIYIZ.pdf",
    "fileName": "NEDEN_KULTUR_SANAT-IS_SENDIKASINA_UYE_OLMALIYIZ.pdf",
    "fileSize": 1185792,
    "fileType": "pdf",
    "mimeType": "application/pdf",
    "createdAt": "2025-08-27T00:00:00.000Z"
  }
]

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileTypeColor(fileType: string): string {
  const colors: Record<string, string> = {
    pdf: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    doc: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    docx: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    xls: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    xlsx: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    ppt: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    pptx: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    txt: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
  return colors[fileType.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

function PostsList({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold mb-2">Henüz içerik yok</h3>
        <p className="text-muted-foreground">İçerikler yakında eklenecek.</p>
      </div>
    )
  }

  const handleDownload = (post: Post) => {
    try {
      // Dosya URL'ini kontrol et
      if (!post.fileUrl) {
        alert('Dosya bulunamadı!')
        return
      }

      // API endpoint'i kullanarak dosya indir
      const downloadUrl = `/api/download?file=${encodeURIComponent(post.fileUrl)}&name=${encodeURIComponent(post.fileName || 'dosya')}`
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Dosya indirme hatası:', error)
      alert('Dosya indirilemedi. Lütfen tekrar deneyin.')
    }
  }

  const handleView = (post: Post) => {
    try {
      if (!post.fileUrl) {
        alert('Dosya bulunamadı!')
        return
      }

      // Yeni sekmede aç
      window.open(post.fileUrl, '_blank')
    } catch (error) {
      console.error('Dosya görüntüleme hatası:', error)
      alert('Dosya görüntülenemedi. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <Card key={post._id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold mb-2">
                  {post.title}
                </CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                  {post.fileType && (
                    <Badge variant="secondary" className="text-xs">
                      {post.fileType.toUpperCase()}
                    </Badge>
                  )}
                  {post.featured && (
                    <Badge variant="destructive" className="text-xs">
                      Öne Çıkan
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {post.excerpt && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            )}
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              
              {post.fileSize && (
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span>{formatFileSize(post.fileSize)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              {post.fileUrl && (
                <>
                  <Button 
                    onClick={() => handleDownload(post)}
                    className="flex-1"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    İndir
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleView(post)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Görüntüle
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <a href={`/kultur-sanat-is/${post.slug}`}>
                  Detay
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function KulturSanatIsPage() {
  return (
    <>
      {/* Hero Section */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Kültür Sanat-İş
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Kültür ve sanat alanında çalışan kamu görevlilerinin haklarını koruyor, 
              mesleki gelişimlerini destekliyor ve sanatın gücünü toplum yararına kullanıyoruz.
            </p>
          </div>
        </Container>
      </Section>

      {/* İçerikler */}
      <Section padding="xl">
        <Container>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="İçerik ara..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
              </div>
            </div>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">İçerikler yükleniyor...</p>
              </div>
            </div>
          }>
            <PostsList posts={posts} />
          </Suspense>
        </Container>
      </Section>
    </>
  )
}
