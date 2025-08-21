"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'

export default function YeniKulturSanatIs() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Genel',
    tags: '',
    author: '',
    featured: false,
    publishDate: new Date().toISOString().split('T')[0],
    coverImageUrl: ''
  })
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [images, setImages] = useState<File[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      // Önizleme URL'i oluştur
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title || !form.excerpt || !form.content || !form.author) {
      alert('Lütfen tüm gerekli alanları doldurun')
      return
    }

    if (!coverFile && !form.coverImageUrl) {
      alert('Lütfen bir kapak görseli seçin veya URL girin')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('auth-token')
      if (!token) return router.push('/admin/login')
      
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)))
      if (coverFile) fd.append('coverImageFile', coverFile)
      images.forEach(img => fd.append('images', img))
      if (file) fd.append('file', file)
      
      const res = await fetch('/api/kultur-sanat-is', { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${token}` }, 
        body: fd 
      })
      
      const json = await res.json()
      if (res.ok && json.success) {
        alert('Kültür Sanat-İş içeriği başarıyla oluşturuldu!')
        router.push('/admin/kultur-sanat-is')
      } else {
        alert(json.message || 'İçerik oluşturulamadı')
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push('/admin/kultur-sanat-is')} 
          className="inline-flex items-center text-red-600 hover:text-red-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Yeni Kültür Sanat-İş İçeriği</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Kolon - Ana Bilgiler */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Temel Bilgiler</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Başlık *</label>
                <input 
                  name="title" 
                  placeholder="İçerik başlığı" 
                  value={form.title} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug (Opsiyonel)</label>
                <input 
                  name="slug" 
                  placeholder="otomatik oluşturulacak" 
                  value={form.slug} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kısa Özet *</label>
                <textarea 
                  name="excerpt" 
                  placeholder="İçeriğin kısa özeti (maksimum 200 karakter)" 
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Yazar *</label>
                <input 
                  name="author" 
                  placeholder="İçerik yazarı" 
                  value={form.author} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <select 
                  name="category" 
                  value={form.category} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Genel">Genel</option>
                  <option value="Haber">Haber</option>
                  <option value="Analiz">Analiz</option>
                  <option value="Röportaj">Röportaj</option>
                  <option value="Makale">Makale</option>
                  <option value="Etkinlik">Etkinlik</option>
                  <option value="Sanat">Sanat</option>
                  <option value="Kültür">Kültür</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etiketler</label>
                <input 
                  name="tags" 
                  placeholder="etiket1, etiket2, etiket3" 
                  value={form.tags} 
                  onChange={handleChange} 
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
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">İçerik</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İçerik *</label>
              <textarea 
                name="content" 
                placeholder="İçeriğin ana metni..." 
                value={form.content} 
                onChange={handleChange} 
                rows={12} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                required
              />
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Medya ve Dosyalar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Kapak Görseli</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dosyadan Yükle *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCoverFileChange}
                    className="hidden"
                    id="coverFile"
                    required={!form.coverImageUrl}
                  />
                  <label htmlFor="coverFile" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {coverFile ? coverFile.name : 'Kapak görseli seçin'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (max 5MB)</p>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Veya URL Girin</label>
                <input 
                  type="url" 
                  name="coverImageUrl" 
                  placeholder="https://example.com/image.jpg" 
                  value={form.coverImageUrl} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
              </div>
              
              {/* Önizleme */}
              {(previewUrl || form.coverImageUrl) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Önizleme</label>
                  <div className="border rounded-lg p-2">
                    <img 
                      src={previewUrl || form.coverImageUrl} 
                      alt="Kapak görseli önizleme" 
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Ek Dosyalar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ek Görseller</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 8))} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
                <div className="text-xs text-gray-500 mt-1">Maksimum 8 görsel</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ek Dosya</label>
                <input 
                  type="file" 
                  accept="application/pdf,video/*,audio/*" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
                <div className="text-xs text-gray-500 mt-1">PDF, video veya ses dosyası</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <button 
              disabled={loading} 
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Kaydediliyor...' : 'İçeriği Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

