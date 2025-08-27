'use client'

import { Suspense, useEffect, useState } from "react"
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

  const handleDownload = async (post: Post) => {
    try {
      console.log('Download clicked for post:', post);
      console.log('Post fileUrl:', post.fileUrl);
      
      // Dosya URL'ini kontrol et
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

      // Google Docs Viewer ile PDF'i görüntüle
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(post.fileUrl)}&embedded=true`;
      window.open(googleViewerUrl, '_blank');
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
            {post.cover && (
              <div className="mb-4">
                <img 
                  src={post.cover.url} 
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}
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
              {post.fileUrl ? (
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
              ) : (
                <div className="text-xs text-muted-foreground">
                  PDF eklenmemiş
                </div>
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
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/kultur-sanat-is')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('İçerikler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(posts.map(post => post.category))]

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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
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
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-4 text-lg text-muted-foreground">İçerikler yükleniyor...</p>
                </div>
              </div>
            ) : (
              <PostsList posts={filteredPosts} />
            )}
          </Suspense>
        </Container>
      </Section>
    </>
  )
}
