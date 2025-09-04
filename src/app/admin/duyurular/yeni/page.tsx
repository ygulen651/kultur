'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Calendar,
  Tag,
  FileText,
  Image as ImageIcon,
  Globe,
  AlertCircle,
  Trash2,
  File,
  Image,
  Crop
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import ImageCropper from '@/components/ImageCropper'

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

export default function NewAnnouncementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>>([])
  const [file, setFile] = useState<File | null>(null)
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null)
  const [imageFilename, setImageFilename] = useState(""); // ✅ yeni
  const [uploading, setUploading] = useState(false)
  const uploadPromiseRef = useRef<Promise<void> | null>(null)
  
  // Görsel kırpma için state
  const [showCropper, setShowCropper] = useState(false)
  const [croppingImageUrl, setCroppingImageUrl] = useState('')
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'genel',
    tags: '',
    featuredImage: '',
    imageFilename: '', // <-- eklendi
    status: 'draft',
    featured: false,
    publishDate: new Date().toISOString().split('T')[0],
    fields: { image: { url: '', publicId: '' } } // <-- düzeltildi
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Görsel dosya seçimi - Vercel Blob'a yükleme form submit'te yapılacak
  async function handleFeaturedImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFeaturedImageFile(file);
    console.log('Öne çıkan görsel seçildi:', file.name, file.size);
  }

  // Ek görselleri seç - Vercel Blob'a yükleme form submit'te yapılacak
  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[]
    if (files.length > 3) {
      alert('En fazla 3 görsel seçebilirsiniz')
      return
    }
    
    setImages(files)
    console.log('Ek görseller seçildi:', files.map(f => f.name));
  }

  // Ek dosyaları seç - Vercel Blob'a yükleme form submit'te yapılacak
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[]
    if (files.length > 5) {
      alert('En fazla 5 dosya seçebilirsiniz')
      return
    }
    
    setFiles(files)
    console.log('Ek dosyalar seçildi:', files.map(f => f.name));
  }

  // Görsel kaldır
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Dosya kaldır
  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Görsel kırpma başlat
  const startCropping = (imageUrl: string, index: number) => {
    setCroppingImageUrl(imageUrl)
    setCroppingImageIndex(index)
    setShowCropper(true)
  }

  // Kırpılmış görseli kaydet
  const handleCropComplete = async (croppedImageUrl: string) => {
    if (croppingImageIndex === null) return

    try {
      // Base64'ü blob'a çevir
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      
      // Yeni dosya oluştur
      const file: File = new (File as any)([blob], `cropped-image-${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      // Görseli güncelle
      const newImages = [...images]
      newImages[croppingImageIndex] = file
      setImages(newImages)
      
      setSuccess('Görsel başarıyla kırpıldı!')
    } catch (error) {
      setError('Görsel işlenirken hata oluştu')
    } finally {
      setShowCropper(false)
      setCroppingImageUrl('')
      setCroppingImageIndex(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published' = 'draft') => {
    e.preventDefault();
    
    // Upload devam ediyorsa engelle
    if (uploading) {
      alert('Görsel yükleniyor… Lütfen bitmesini bekleyin.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setError('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
        return;
      }
      
      // FormData kullanarak Vercel Blob API'sine gönder
      const formDataToSend = new FormData();
      
      // Temel bilgiler
      formDataToSend.append('title', formData.title);
      formDataToSend.append('excerpt', formData.excerpt || '');
      formDataToSend.append('content', formData.content || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('featured', formData.featured.toString());
      formDataToSend.append('status', status);
      formDataToSend.append('publishDate', formData.publishDate);
      
      // Öne çıkan görsel
      if (featuredImageFile) {
        formDataToSend.append('image', featuredImageFile);
      }
      
      // Ek görseller
      images.forEach((image, index) => {
        formDataToSend.append('images', image);
      });
      
      // Ek dosyalar
      files.forEach((file, index) => {
        formDataToSend.append('files', file);
      });
      
      console.log('Gönderilen FormData:', {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        featured: formData.featured,
        status: status,
        publishDate: formData.publishDate,
        imageFile: featuredImageFile?.name,
        imagesCount: images.length,
        filesCount: files.length
      });
      
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Content-Type header'ı ekleme - FormData otomatik olarak ayarlar
        },
        body: formDataToSend,
      });
      
      let data: any = null;
      try { 
        data = await response.json(); 
      } catch (parseError) {
        console.error('Response parse hatası:', parseError);
        setError('Sunucudan geçersiz yanıt alındı.');
        return;
      }
      
      console.log('API Response:', response.status, data);
      
      if (!response.ok || data?.success === false) {
        const msg = data?.message || data?.error || `HTTP ${response.status}`;
        setError(msg);
        console.error('Save error:', msg, data);
        return;
      }
      
      setSuccess(`Duyuru başarıyla ${status === 'published' ? 'yayınlandı' : 'taslak olarak kaydedildi'}!`);
      setTimeout(() => {
        router.push('/admin/duyurular');
      }, 1500);
    } catch (error: any) {
      console.error('Save exception:', error);
      setError(error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Yeni Duyuru</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Yeni bir duyuru oluşturun ve yayınlayın
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

      <form onSubmit={(e) => handleSubmit(e, 'draft')} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Öne Çıkan Görsel URL (opsiyonel)</Label>
                  <Input
                    name="featuredImage"
                    value={formData.featuredImage}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label>Öne Çıkan Görsel Dosya (opsiyonel)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">URL girmezseniz dosya kullanılır.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ek Görseller */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Ek Görseller (3 adet)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Görseller Seç</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesUpload}
                  disabled={isLoading || uploading}
                />
                <p className="text-xs text-gray-500 mt-1">3 adet görsel seçebilirsiniz</p>
              </div>

              {/* Yüklenen görselleri göster */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group aspect-[4/3] rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                      <img 
                        src={url} 
                        alt={`Görsel ${index + 1}`} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => startCropping(url, index)}
                          className="bg-white/90 hover:bg-white text-gray-900"
                        >
                          <Crop className="h-4 w-4 mr-1" />
                          Kırp
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(index)}
                          className="bg-red-500/90 hover:bg-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                        Görsel {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ek Dosyalar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                Ek Dosyalar (1-5 adet)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Dosya Seç</Label>
                <Input
                  type="file"
                  accept="application/pdf,video/*,audio/*,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  multiple
                  onChange={handleFilesUpload}
                  disabled={isLoading || uploading}
                />
                <p className="text-xs text-gray-500 mt-1">PDF, video, ses, görsel ve Office dosyaları kabul edilir</p>
              </div>

              {/* Yüklenen dosyaları göster */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <File className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
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
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Kategori & Etiketler
              </CardTitle>
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
                {uploading ? 'Görsel Yükleniyor...' : isLoading ? 'Kaydediliyor...' : 'Taslak Kaydet'}
              </Button>
              
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, 'published')}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || uploading}
              >
                <Globe className="h-4 w-4 mr-2" />
                {uploading ? 'Görsel Yükleniyor...' : isLoading ? 'Yayınlanıyor...' : 'Yayınla'}
              </Button>

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

      {/* Image Cropper Modal */}
      {showCropper && (
        <ImageCropper
          imageUrl={croppingImageUrl}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropper(false)
            setCroppingImageUrl('')
            setCroppingImageIndex(null)
          }}
          aspectRatio={16/9}
          title={formData.title || "Duyuru Görseli"}
        />
      )}
    </div>
  )
}