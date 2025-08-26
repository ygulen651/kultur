'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Save, 
  Eye, 
  X, 
  FileText,
  Image as ImageIcon,
  Globe,
  AlertCircle,
  Loader2,
  Trash2,
  File,
  Image,
  Upload
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'

const categories = [
  'genel',
  'toplu-sozlesme', 
  'egitim',
  'sosyal',
  'hukuk',
  'basin-aciklamasi'
]

const categoryLabels = {
  'genel': 'Genel',
  'toplu-sozlesme': 'Toplu Sözleşme',
  'egitim': 'Eğitim',
  'sosyal': 'Sosyal',
  'hukuk': 'Hukuk',
  'basin-aciklamasi': 'Basın Açıklaması'
}

interface Announcement {
  _id: string
  title: string
  excerpt: string
  content: string
  category: string
  tags: string[]
  featuredImage?: string
  images?: string[]
  files?: Array<{
    name: string;
    url: string;
    type: string;
    size?: number;
  }>
  status: 'draft' | 'published' | 'archived'
  featured: boolean
  publishDate: string
}

export default function EditAnnouncementPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // Ek görseller ve dosyalar için state
  const [newImages, setNewImages] = useState<File[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'genel',
    tags: '',
    featuredImage: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featured: false,
    publishDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadAnnouncement()
  }, [params.id])

  const loadAnnouncement = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch(`/api/announcements/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const data = result.data
          setAnnouncement(data)
          setFormData({
            title: data.title || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            category: data.category || 'genel',
            tags: data.tags ? data.tags.join(', ') : '',
            featuredImage: data.featuredImage || '',
            status: data.status || 'draft',
            featured: data.featured || false,
            publishDate: data.publishDate ? new Date(data.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          })
        } else {
          setError('Duyuru bulunamadı')
        }
      } else {
        setError('Duyuru yüklenemedi')
      }
    } catch (error) {
      setError('Bir hata oluştu')
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Ek görselleri yükle
  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[]
    if (files.length > 8) {
      alert('En fazla 8 görsel seçebilirsiniz')
      return
    }
    
    setNewImages(files)
    setUploading(true)
    
    try {
      const uploadedUrls: string[] = []
      
      for (const file of files) {
        try {
          // Sadece Cloudinary'ye yükle
          const fd = new FormData()
          fd.append("file", file)
          const r = await fetch("/api/cloudinary/upload", { method: "POST", body: fd })
          const j = await r.json()
          
          if (j?.ok && j.url) {
            uploadedUrls.push(j.url)
          } else {
            throw new Error('Cloudinary upload başarısız')
          }
        } catch (err) {
          console.error('Görsel yükleme hatası:', err)
          alert(`Görsel yüklenemedi: ${file.name}`)
        }
      }
      
      // Mevcut görsellere ekle
      if (announcement) {
        setAnnouncement({
          ...announcement,
          images: [...(announcement.images || []), ...uploadedUrls]
        })
      }
    } finally {
      setUploading(false)
    }
  }

  // Ek dosyaları yükle
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[]
    if (files.length > 5) {
      alert('En fazla 5 dosya seçebilirsiniz')
      return
    }
    
    setNewFiles(files)
    setUploading(true)
    
    try {
      const uploadedFiles: Array<{
        name: string;
        url: string;
        type: string;
        size: number;
      }> = []
      
      for (const file of files) {
        try {
          // Dosyaları da Cloudinary'ye yükle
          const fd = new FormData()
          fd.append("file", file)
          const r = await fetch("/api/cloudinary/upload", { method: "POST", body: fd })
          const j = await r.json()
          
          if (j?.ok) {
            uploadedFiles.push({
              name: file.name,
              url: j.url,
              type: file.type,
              size: file.size
            })
          } else {
            throw new Error('Cloudinary upload başarısız')
          }
        } catch (err) {
          console.error('Dosya yükleme hatası:', err)
          alert(`Dosya yüklenemedi: ${file.name}`)
        }
      }
      
      // Mevcut dosyalara ekle
      if (announcement) {
        setAnnouncement({
          ...announcement,
          files: [...(announcement.files || []), ...uploadedFiles]
        })
      }
    } finally {
      setUploading(false)
    }
  }

  // Görsel kaldır
  const removeImage = (index: number) => {
    if (announcement) {
      const newImages = [...(announcement.images || [])]
      newImages.splice(index, 1)
      setAnnouncement({
        ...announcement,
        images: newImages
      })
    }
  }

  // Dosya kaldır
  const removeFile = (index: number) => {
    if (announcement) {
      const newFiles = [...(announcement.files || [])]
      newFiles.splice(index, 1)
      setAnnouncement({
        ...announcement,
        files: newFiles
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent, status?: 'draft' | 'published' | 'archived') => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const submitData = {
        ...formData,
        status: status || formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        // Ek görseller ve dosyalar
        images: announcement?.images || [],
        files: announcement?.files || []
      }

      const response = await fetch(`/api/announcements/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(`Duyuru başarıyla güncellendi!`)
        setTimeout(() => {
          router.push('/admin/duyurular')
        }, 1500)
      } else {
        setError(result.message || 'Duyuru güncellenemedi')
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Duyuru yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Duyuru Bulunamadı</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Aradığınız duyuru bulunamadı veya erişim yetkiniz yok.</p>
        <Button onClick={() => router.push('/admin/duyurular')}>
          Duyurular Listesine Dön
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Duyuru Düzenle</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {announcement.title}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          İptal
        </Button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          <AlertCircle className="h-4 w-4" />
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Temel Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Duyuru başlığını girin..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Özet *</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Duyuru özetini girin..."
                  rows={3}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="content">İçerik *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Duyuru içeriğini girin..."
                  rows={12}
                  required
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  HTML etiketleri kullanabilirsiniz
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Öne Çıkan Görsel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="featuredImage">Görsel URL</Label>
                <Input
                  id="featuredImage"
                  name="featuredImage"
                  value={formData.featuredImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  disabled={isLoading}
                />
                {formData.featuredImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.featuredImage} 
                      alt="Preview" 
                      className="max-w-xs rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ek Görsel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Ek Görsel (Tek görsel)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Yeni Görsel Ekle</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImagesUpload}
                  disabled={isLoading || uploading}
                />
                <p className="text-xs text-gray-500 mt-1">Sadece 1 görsel seçebilirsiniz</p>
              </div>

              {/* Mevcut görselleri göster */}
              {announcement?.images && announcement.images.length > 0 && (
                <div>
                  <Label className="mb-2 block">Mevcut Görseller</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {announcement.images.map((url, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
                        <img 
                          src={url} 
                          alt={`Görsel ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ek Dosyalar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                Ek Dosyalar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Yeni Dosya Ekle</Label>
                <Input
                  type="file"
                  accept="application/pdf,video/*,audio/*,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  multiple
                  onChange={handleFilesUpload}
                  disabled={isLoading || uploading}
                />
                <p className="text-xs text-gray-500 mt-1">PDF, video, ses, görsel ve Office dosyaları kabul edilir</p>
              </div>

              {/* Mevcut dosyaları göster */}
              {announcement?.files && announcement.files.length > 0 && (
                <div>
                  <Label className="mb-2 block">Mevcut Dosyalar</Label>
                  <div className="space-y-2">
                    {announcement.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <File className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''} • {file.type}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Yayın Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Durum</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={isLoading}
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                  <option value="archived">Arşiv</option>
                </select>
              </div>

              <div>
                <Label htmlFor="publishDate">Yayın Tarihi</Label>
                <Input
                  id="publishDate"
                  name="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={isLoading}
                />
                <Label htmlFor="featured">Öne çıkan duyuru</Label>
              </div>
            </CardContent>
          </Card>

          {/* Category & Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Kategori & Etiketler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  disabled={isLoading}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="tags">Etiketler</Label>
                <Input
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="etiket1, etiket2, etiket3"
                  disabled={isLoading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Virgülle ayırın
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || uploading}
              >
                <Save className="h-4 w-4 mr-2" />
                {uploading ? 'Görsel Yükleniyor...' : isLoading ? 'Güncelleniyor...' : 'Güncelle'}
              </Button>
              
              {formData.status !== 'published' && (
                <Button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'published')}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading || uploading}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {uploading ? 'Görsel Yükleniyor...' : isLoading ? 'Yayınlanıyor...' : 'Yayınla'}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Önizle
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}


