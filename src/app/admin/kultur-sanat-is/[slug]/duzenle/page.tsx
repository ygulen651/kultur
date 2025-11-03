'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Upload, Image as ImageIcon, X } from 'lucide-react'

export default function DuzenleKulturSanatIs({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<any>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [newFile, setNewFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    params.then(p => {
      setSlug(p.slug)
    })
  }, [params])

  useEffect(() => {
    if (slug) load()
  }, [slug])

  async function load() {
    try {
      const res = await fetch(`/api/kultur-sanat-is/${slug}`, { cache: 'no-store' })
      const json = await res.json()
      if (json.success) {
        const it = json.data
        setForm({
          title: it.title, 
          slug: it.slug, 
          excerpt: it.excerpt || '', 
          content: it.content || '',
          tags: (it.tags || []).join(','), 
          featured: !!it.isFeatured,
          publishDate: it.publishDate ? String(it.publishDate).slice(0, 10) : '',
          images: it.images || [],
          file: it.file || '',
          fileName: it.fileName || '',
          fileType: it.fileType || ''
        })
      }
    } finally { setLoading(false) }
  }

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageRemove = (index: number) => {
    setForm((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewImages(prev => [...prev, ...files].slice(0, 8))
  }

  const handleNewImageRemove = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) return router.push('/admin/login')
      
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('excerpt', form.excerpt)
      formData.append('content', form.content)
      formData.append('tags', form.tags)
      formData.append('featured', form.featured.toString())
      formData.append('publishDate', form.publishDate)
      
      // Yeni eklenen görseller
      newImages.forEach(img => formData.append('newImages', img))
      
      // Yeni eklenen dosya
      if (newFile) formData.append('newFile', newFile)
      
      const res = await fetch(`/api/kultur-sanat-is/${slug}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      
      const json = await res.json()
      if (res.ok && json.success) { 
        alert('Kaydedildi'); 
        router.push('/admin/kultur-sanat-is') 
      } else {
        alert(json.message || 'Hata')
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error)
      alert('Kaydetme sırasında hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !form || !slug) return <div>Yükleniyor…</div>

  return (
    <div className="space-y-6 p-6">
      <button onClick={() => router.push('/admin/kultur-sanat-is')} className="inline-flex items-center text-red-600">
        <ArrowLeft className="h-4 w-4 mr-2" />Geri
      </button>
      <h1 className="text-2xl font-bold">Kültür Sanat-İş Düzenle</h1>
      
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Kolon - Ana Bilgiler */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Temel Bilgiler</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Başlık *</label>
                <input 
                  name="title" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <input 
                  name="slug" 
                  value={form.slug} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kısa Özet *</label>
                <textarea 
                  name="excerpt" 
                  value={form.excerpt} 
                  onChange={handleChange} 
                  rows={3}
                  maxLength={200}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  required
                />
                <div className="text-xs text-gray-500 mt-1">{form.excerpt.length}/200</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">İçerik *</label>
                <textarea 
                  name="content" 
                  value={form.content} 
                  onChange={handleChange} 
                  rows={8} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etiketler</label>
                <input 
                  name="tags" 
                  value={form.tags} 
                  onChange={handleChange} 
                  placeholder="etiket1, etiket2, etiket3" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
                <div className="text-xs text-gray-500 mt-1">Virgülle ayırarak birden fazla etiket ekleyebilirsiniz</div>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox" 
                    name="featured" 
                    checked={form.featured} 
                    onChange={handleChange} 
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  /> 
                  Öne çıkar
                </label>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yayın Tarihi</label>
                  <input 
                    type="date" 
                    name="publishDate" 
                    value={form.publishDate} 
                    onChange={handleChange} 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Medya ve Dosyalar */}
        <div className="space-y-6">
          {/* Mevcut Ek Görseller */}
          {form.images && form.images.length > 0 && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Mevcut Ek Görseller ({form.images.length} adet)</h2>
              <div className="grid grid-cols-2 gap-4">
                {form.images.map((image: string, index: number) => (
                  <div key={index} className="relative group">
                    <img 
                      src={image} 
                      alt={`Görsel ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Yeni Ek Görseller */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Yeni Ek Görseller Ekle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Görseller Seçin</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleNewImageChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
                <div className="text-xs text-gray-500 mt-1">Maksimum 8 görsel</div>
              </div>
              
              {/* Seçilen yeni görseller önizleme */}
              {newImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seçilen Görseller</label>
                  <div className="grid grid-cols-2 gap-4">
                    {newImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Yeni görsel ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleNewImageRemove(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mevcut Ek Dosya */}
          {form.file && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Mevcut Ek Dosya</h2>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {form.fileName || 'Ek Dosya'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {form.fileType || 'Dosya türü bilinmiyor'}
                  </p>
                </div>
                <a 
                  href={form.file} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Görüntüle
                </a>
              </div>
            </div>
          )}
          
          {/* Yeni Ek Dosya */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Yeni Ek Dosya Ekle</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dosya Seçin</label>
                <input 
                  type="file" 
                  accept="application/pdf,video/*,audio/*" 
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
                <div className="text-xs text-gray-500 mt-1">PDF, video veya ses dosyası</div>
              </div>
              
              {newFile && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Seçilen dosya: {newFile.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Boyut: {(newFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Kaydet Butonu */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <button 
              type="submit"
              disabled={saving} 
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

