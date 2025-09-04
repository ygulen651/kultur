'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Loader2, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRef } from 'react';

interface BuyukSlider {
  _id: string
  title: string
  subtitle?: string
  description?: string
  imageUrl: string
  imageFilename: string
  link?: string
  buttonText?: string
  buttonLink?: string
  order: number
  isActive: boolean
  backgroundColor?: string
  textColor?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export default function BuyukSliderPage() {
  const [sliders, setSliders] = useState<BuyukSlider[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlider, setEditingSlider] = useState<BuyukSlider | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    imageUrl: '',
    imageFilename: '',
    link: '',
    buttonText: '',
    buttonLink: '',
    order: 1,
    isActive: true,
    backgroundColor: '#000000',
    textColor: '#ffffff'
  })

  // Fetch sliders
  const fetchSliders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/buyuk-slider')
      const data = await response.json()
      if (data.success) {
        setSliders(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching sliders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSliders()
  }, [])

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.url,
          imageFilename: result.filename
        }))
        return result.url
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Görsel yükleme hatası: ' + (error as Error).message)
    } finally {
      setUploading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingSlider ? `/api/buyuk-slider/${editingSlider._id}` : '/api/buyuk-slider'
      const method = editingSlider ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setIsDialogOpen(false)
        setEditingSlider(null)
        resetForm()
        fetchSliders()
        alert(editingSlider ? 'Slider güncellendi!' : 'Slider eklendi!')
      } else {
        throw new Error(result.error || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Hata: ' + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      imageFilename: '',
      link: '',
      buttonText: '',
      buttonLink: '',
      order: 1,
      isActive: true,
      backgroundColor: '#000000',
      textColor: '#ffffff'
    })
  }

  // Open dialog for new slider
  const openNewDialog = () => {
    resetForm()
    setEditingSlider(null)
    setIsDialogOpen(true)
  }

  // Open dialog for editing
  const openEditDialog = (slider: BuyukSlider) => {
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle || '',
      description: slider.description || '',
      imageUrl: slider.imageUrl,
      imageFilename: slider.imageFilename,
      link: slider.link || '',
      buttonText: slider.buttonText || '',
      buttonLink: slider.buttonLink || '',
      order: slider.order,
      isActive: slider.isActive,
      backgroundColor: slider.backgroundColor || '#000000',
      textColor: slider.textColor || '#ffffff'
    })
    setEditingSlider(slider)
    setIsDialogOpen(true)
  }

  // Delete slider
  const deleteSlider = async (id: string) => {
    if (!confirm('Bu slider\'ı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/buyuk-slider/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        fetchSliders()
        alert('Slider silindi!')
      } else {
        throw new Error(result.error || 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Hata: ' + (error as Error).message)
    }
  }

  // Toggle active status
  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/buyuk-slider/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      const result = await response.json()

      if (result.success) {
        fetchSliders()
      } else {
        throw new Error(result.error || 'Güncelleme başarısız')
      }
    } catch (error) {
      console.error('Toggle error:', error)
      alert('Hata: ' + (error as Error).message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Büyük Slider Yönetimi</h1>
          <p className="text-gray-600 mt-2">Ana sayfadaki büyük slider'ı yönetin</p>
        </div>
        <Button onClick={openNewDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Slider Ekle
        </Button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sliders.map((slider) => (
          <div key={slider._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
              {slider.imageUrl ? (
                <Image
                  src={slider.imageUrl}
                  alt={slider.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Görsel Yok
                </div>
              )}
              <div className="absolute top-2 right-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  slider.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {slider.isActive ? 'Aktif' : 'Pasif'}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{slider.title}</h3>
              {slider.subtitle && (
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{slider.subtitle}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span>Sıra: {slider.order}</span>
                <span>{new Date(slider.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(slider)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Düzenle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(slider._id, slider.isActive)}
                  className={slider.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                >
                  {slider.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteSlider(slider._id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sliders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-4">Henüz slider eklenmemiş</div>
          <Button onClick={openNewDialog} className="flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            İlk Slider'ı Ekle
          </Button>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSlider ? 'Slider Düzenle' : 'Yeni Slider Ekle'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="Slider başlığı"
              />
            </div>

            {/* Subtitle */}
            <div>
              <Label htmlFor="subtitle">Alt Başlık</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Alt başlık (opsiyonel)"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Slider açıklaması (opsiyonel)"
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label>Görsel *</Label>
              <div className="mt-2">
                {formData.imageUrl ? (
                  <div className="relative">
                    <Image
                      src={formData.imageUrl}
                      alt="Preview"
                      width={300}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute top-2 right-2"
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Değiştir
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Görsel yüklemek için tıklayın</p>
                    <p className="text-sm text-gray-500">PNG, JPG, GIF (Max 5MB)</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                />
              </div>
            </div>

            {/* Link */}
            <div>
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            {/* Button Text */}
            <div>
              <Label htmlFor="buttonText">Buton Metni</Label>
              <Input
                id="buttonText"
                value={formData.buttonText}
                onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                placeholder="Detayları Gör"
              />
            </div>

            {/* Button Link */}
            <div>
              <Label htmlFor="buttonLink">Buton Linki</Label>
              <Input
                id="buttonLink"
                value={formData.buttonLink}
                onChange={(e) => setFormData(prev => ({ ...prev, buttonLink: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>

            {/* Order */}
            <div>
              <Label htmlFor="order">Sıra</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                min="1"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backgroundColor">Arka Plan Rengi</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="textColor">Metin Rengi</Label>
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.title || !formData.imageUrl}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {editingSlider ? 'Güncelleniyor...' : 'Ekleniyor...'}
                  </>
                ) : (
                  editingSlider ? 'Güncelle' : 'Ekle'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
