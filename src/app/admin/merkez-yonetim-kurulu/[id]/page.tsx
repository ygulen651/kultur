'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  GraduationCap,
  FileText,
  Upload,
  X,
  Trash2
} from 'lucide-react'

interface ManagementMember {
  _id?: string
  id?: string
  name: string
  position: string
  bio: string
  photo: string
  email: string
  phone: string
  experience: string
  education: string
  order: number
  group: string
}

export default function DuzenleMerkezYonetimUyesiPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  console.log('🚀 DuzenleMerkezYonetimUyesiPage component yüklendi, ID:', id)
  
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formData, setFormData] = useState<ManagementMember>({
    name: '',
    position: '',
    bio: '',
    photo: '',
    email: '',
    phone: '',
    experience: '',
    education: '',
    order: 999,
    group: 'merkez-yonetim-kurulu'
  })
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    console.log('🔄 useEffect çalıştı, ID:', id)
    if (id && id !== 'yeni') {
      console.log('✅ loadMember çağrılıyor')
      loadMember()
    } else {
      console.log('❌ ID yok veya yeni üye')
    }
  }, [id])

  // Form verisi değişimini takip et
  useEffect(() => {
    console.log('📝 Form verisi güncellendi:', formData)
  }, [formData])

  // Yeni üye için manuel sıralama
  useEffect(() => {
    if (id === 'yeni') {
      // Yeni üye için manuel sıralama - kullanıcı 1,2,3,4,5... girebilir
      setFormData(prev => ({ ...prev, order: 1 }))
      console.log('✅ Yeni üye için varsayılan sıralama: 1')
    }
  }, [id])

  const loadMember = async () => {
    try {
      console.log('🔄 Üye yükleniyor, ID:', id)
      const token = localStorage.getItem('auth-token')
      if (!token) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
        router.push('/admin/login')
        return
      }

      const response = await fetch(`/api/boards/merkez-yonetim-kurulu/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📡 API Response Status:', response.status)
      console.log('📡 API Response OK:', response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log('📡 API Response Data:', result)
        if (result.success) {
          console.log('✅ Form verisi ayarlanıyor:', result.data)
          // API'den gelen veriyi form alanlarına eşleştir
          const memberData = result.data
          setFormData({
            name: memberData.name || '',
            position: memberData.position || '',
            bio: memberData.bio || '',
            photo: memberData.photo || '',
            email: memberData.email || '',
            phone: memberData.phone || '',
            experience: memberData.experience || '',
            education: memberData.education || '',
            order: memberData.order || 999,
            group: memberData.group || 'merkez-yonetim-kurulu'
          })
          if (memberData.photo) {
            setPhotoPreview(memberData.photo)
          }
        } else {
          console.log('❌ API başarısız:', result.message)
        }
      } else {
        console.log('❌ HTTP hatası:', response.status)
        alert('Üye bilgileri yüklenemedi')
      }
    } catch (error) {
      console.error('❌ Üye yüklenirken hata:', error)
      alert('Üye bilgileri yüklenemedi')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 999 : value
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPhotoPreview(result)
        setFormData(prev => ({
          ...prev,
          photo: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhotoPreview('')
    setFormData(prev => ({
      ...prev,
      photo: ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.position.trim() || !formData.order) {
      alert('İsim, pozisyon ve sıralama alanları zorunludur!')
      return
    }

    if (formData.order < 1 || formData.order > 100) {
      alert('Sıralama 1 ile 100 arasında olmalıdır!')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
        router.push('/admin/login')
        return
      }

      const url = id === 'yeni' ? '/api/boards/merkez-yonetim-kurulu' : `/api/boards/merkez-yonetim-kurulu/${id}`
      const method = id === 'yeni' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert(id === 'yeni' ? 'Üye başarıyla eklendi!' : 'Üye başarıyla güncellendi!')
        router.push('/admin/merkez-yonetim-kurulu')
      } else {
        alert(result.message || 'İşlem başarısız')
      }
    } catch (error) {
      console.error('Form gönderilirken hata:', error)
      alert('Bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) {
      return
    }

    setIsDeleting(true)

    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
        router.push('/admin/login')
        return
      }

      const response = await fetch(`/api/boards/merkez-yonetim-kurulu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Üye başarıyla silindi!')
        router.push('/admin/merkez-yonetim-kurulu')
      } else {
        alert(result.message || 'Silme işlemi başarısız')
      }
    } catch (error) {
      console.error('Silme işlemi sırasında hata:', error)
      alert('Bir hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/merkez-yonetim-kurulu"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Geri Dön
            </Link>
            <h1 className="text-2xl font-bold">
              {id === 'yeni' ? 'Yeni Merkez Yönetim Kurulu Üyesi' : 'Üye Düzenle'}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Debug Test Butonu */}
            {id !== 'yeni' && (
              <button
                onClick={() => {
                  console.log('🔍 Mevcut form verisi:', formData)
                  console.log('🔍 Photo preview:', photoPreview)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Debug
              </button>
            )}
            
            {id !== 'yeni' && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Siliniyor...' : 'Sil'}
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
          {/* Debug Bilgileri */}
          {id !== 'yeni' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Debug Bilgileri</h3>
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <div>ID: {id}</div>
                <div>Name: {formData.name || 'Boş'}</div>
                <div>Position: {formData.position || 'Boş'}</div>
                <div>Bio: {formData.bio || 'Boş'}</div>
                <div>Email: {formData.email || 'Boş'}</div>
                <div>Phone: {formData.phone || 'Boş'}</div>
                <div>Experience: {formData.experience || 'Boş'}</div>
                <div>Education: {formData.education || 'Boş'}</div>
                <div>Order: {formData.order || 'Boş'}</div>
                <div>Photo: {formData.photo ? 'Var' : 'Yok'}</div>
              </div>
            </div>
          )}

          {/* Temel Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İsim *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pozisyon *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          {/* Sıralama */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sıralama *
            </label>
            <div className="space-y-3">
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                min="1"
                max="100"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="1, 2, 3, 4, 5..."
              />
              <div className="text-xs text-gray-500 space-y-1">
                <p>• 1 = En üst sıra (Başkan)</p>
                <p>• 2 = İkinci sıra (Başkan Yardımcısı)</p>
                <p>• 3 = Üçüncü sıra (Genel Sekreter)</p>
                <p>• 4, 5, 6... = Diğer üyeler</p>
              </div>
              
              {/* Hızlı Sıralama Butonları */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, order: 1 }))}
                  className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  1. Sıra
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, order: 2 }))}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  2. Sıra
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, order: 3 }))}
                  className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  3. Sıra
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, order: 4 }))}
                  className="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors"
                >
                  4. Sıra
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, order: 5 }))}
                  className="px-3 py-1 text-xs bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                >
                  5. Sıra
                </button>
              </div>
              
              {/* Mevcut Sıralama Bilgisi */}
              {id !== 'yeni' && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <strong>Mevcut Sıralama:</strong> {formData.order}. sıra
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Bu üye şu anda listede {formData.order === 1 ? '1. sırada (en üstte)' : 
                    formData.order === 2 ? '2. sırada' : 
                    formData.order === 3 ? '3. sırada' : 
                    `${formData.order}. sırada`} yer alıyor.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Biyografi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Biyografi
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Üye hakkında kısa bilgi..."
            />
          </div>

          {/* İletişim Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Deneyim ve Eğitim */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deneyim
              </label>
              <input
                type="text"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Örn: 10 yıl sendika deneyimi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Eğitim
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Örn: Üniversite mezunu"
              />
            </div>
          </div>

          {/* Fotoğraf */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fotoğraf
            </label>
            <div className="space-y-4">
              {photoPreview && (
                <div className="relative inline-block">
                  <Image
                    src={photoPreview}
                    alt="Önizleme"
                    width={120}
                    height={120}
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-red-900 dark:file:text-red-300"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/merkez-yonetim-kurulu"
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Kaydediliyor...' : (id === 'yeni' ? 'Ekle' : 'Güncelle')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
