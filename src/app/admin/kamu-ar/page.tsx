"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Clock, Calendar, User } from 'lucide-react'
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
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/kamu-ar', { cache: 'no-store' })
      const json = await res.json()
      setItems(json.success ? json.data : [])
    } finally { setLoading(false) }
  }

  async function handleDelete(slug: string) {
    if (!confirm('Bu içeriği silmek istiyor musunuz?')) return
    const token = localStorage.getItem('auth-token')
    if (!token) return alert('Oturum kapalı')
    const res = await fetch(`/api/kamu-ar/${slug}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (res.ok && json.success) setItems(prev => prev.filter(i => i.slug !== slug))
    else alert(json.message || 'Silinemedi')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kamu-AR</h1>
        <Link href="/admin/kamu-ar/yeni" className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg"><Plus className="h-4 w-4 mr-2" />Yeni</Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-lg text-muted-foreground">İçerikler yükleniyor...</p>
          </div>
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


