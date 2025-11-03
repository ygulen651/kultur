"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Clock, Calendar, User, AlertCircle, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Item = {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: string
  author: string
  publishDate: string
  status: 'draft' | 'published' | 'archived'
  isFeatured: boolean
  readTime: number
  viewCount: number
  coverImage: string
}

export default function KamuArAdminList() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { 
    checkAuth()
    load() 
  }, [])

  // Authentication kontrolü
  const checkAuth = () => {
    const token = localStorage.getItem('auth-token')
    if (!token) {
      router.push('/admin/login')
      return
    }
  }

  async function load() {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setError('Oturum süresi dolmuş')
        return
      }

      const res = await fetch('/api/kamu-ar', { 
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
      
      const json = await res.json()
      if (json.success) {
        setItems(json.data || [])
      } else {
        setError(json.message || 'Veriler yüklenemedi')
      }
    } catch (err: any) {
      console.error('Load error:', err)
      setError(err.message || 'Veriler yüklenemedi')
    } finally { 
      setLoading(false) 
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm('Bu içeriği silmek istiyor musunuz?')) return
    
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        alert('Oturum süresi dolmuş')
        router.push('/admin/login')
        return
      }
      
      const res = await fetch(`/api/kamu-ar/${slug}`, { 
        method: 'DELETE', 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      })
      
      const json = await res.json()
      if (res.ok && json.success) {
        setItems(prev => prev.filter(i => i.slug !== slug))
        alert('İçerik başarıyla silindi!')
      } else {
        alert(json.message || 'Silinemedi')
      }
    } catch (err: any) {
      console.error('Delete error:', err)
      alert('Silme işlemi sırasında hata oluştu')
    }
  }

  // Authentication hatası varsa login sayfasına yönlendir
  if (error === 'Oturum süresi dolmuş') {
    router.push('/admin/login')
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kamu-AR</h1>
        <Link href="/admin/kamu-ar/yeni" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          <Plus className="h-4 w-4 mr-2" />Yeni
        </Link>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Hata</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={load}
            className="ml-auto"
          >
            Tekrar Dene
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">İçerikler yükleniyor...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Henüz içerik yok</h3>
          <p className="text-muted-foreground mb-6">
            İlk KAMU-AR içeriğini ekleyerek başlayın
          </p>
          <Link href="/admin/kamu-ar/yeni" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            İlk İçeriği Ekle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[16/9] overflow-hidden">
                {item.coverImage && (
                  <img 
                    src={item.coverImage} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 left-3">
                  <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                    {item.status === 'published' ? 'Yayında' : item.status === 'draft' ? 'Taslak' : 'Arşiv'}
                  </Badge>
                </div>
                {item.isFeatured && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Öne Çıkan
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {item.excerpt}
                </p>
                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.publishDate).toLocaleDateString('tr-TR')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.readTime} dk okuma
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {item.viewCount} görüntülenme
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link href={`/admin/kamu-ar/${item.slug}/duzenle`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Düzenle
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/kamu-ar/${item.slug}`} target="_blank">
                      <Eye className="h-4 w-4 mr-2" />
                      Görüntüle
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.slug)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


