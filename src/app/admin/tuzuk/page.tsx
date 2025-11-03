'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

import { Badge } from '@/components/ui/badge'
import { BookOpen, Save, Edit, Eye, Plus, Trash2, AlertCircle } from 'lucide-react'

export default function TuzukPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showNewTuzukModal, setShowNewTuzukModal] = useState(false)
  const [currentTuzuk, setCurrentTuzuk] = useState<any>(null)
  const [tuzukForm, setTuzukForm] = useState({
    title: 'Sendika Tüzüğü',
    content: '',
    version: '1.0.0',
    status: 'published'
  })

  // Tüzük verilerini yükle
  useEffect(() => {
    fetchTuzuk()
  }, [])

  const fetchTuzuk = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tuzuk')
      const result = await response.json()
      
      if (result.success && result.data) {
        setCurrentTuzuk(result.data)
        setTuzukForm({
          title: result.data.title,
          content: result.data.content,
          version: result.data.version,
          status: result.data.status
        })
      }
    } catch (error) {
      console.error('Tüzük yükleme hatası:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
        return
      }

      if (!currentTuzuk) {
        // Yeni tüzük oluştur
        const response = await fetch('/api/tuzuk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...tuzukForm,
            lastModifiedBy: 'Admin'
          })
        })

        const result = await response.json()
        if (response.ok && result.success) {
          alert('Tüzük başarıyla oluşturuldu!')
          setCurrentTuzuk(result.data)
          setIsEditing(false)
          fetchTuzuk()
        } else {
          alert(result.message || 'Tüzük oluşturulamadı')
        }
      } else {
        // Mevcut tüzüğü güncelle
        const response = await fetch(`/api/tuzuk/${currentTuzuk._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...tuzukForm,
            lastModifiedBy: 'Admin'
          })
        })

        const result = await response.json()
        if (response.ok && result.success) {
          alert('Tüzük başarıyla güncellendi!')
          setCurrentTuzuk(result.data)
          setIsEditing(false)
          fetchTuzuk()
        } else {
          alert(result.message || 'Tüzük güncellenemedi')
        }
      }
    } catch (error) {
      console.error('Kaydetme hatası:', error)
      alert('Bir hata oluştu')
    }
  }

  const handleNewTuzuk = () => {
    setTuzukForm({
      title: 'Sendika Tüzüğü',
      content: '',
      version: '1.0.0',
      status: 'published'
    })
    setCurrentTuzuk(null)
    setShowNewTuzukModal(true)
  }

  const handleDeleteTuzuk = async () => {
    if (!currentTuzuk) return
    
    if (confirm(`"${currentTuzuk.title}" tüzüğünü silmek istediğinizden emin misiniz?`)) {
      try {
        const token = localStorage.getItem('auth-token')
        if (!token) {
          alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
          return
        }

        const response = await fetch(`/api/tuzuk/${currentTuzuk._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const result = await response.json()
        if (response.ok && result.success) {
          alert('Tüzük başarıyla silindi!')
          setCurrentTuzuk(null)
          setTuzukForm({
            title: 'Sendika Tüzüğü',
            content: '',
            version: '1.0.0',
            status: 'published'
          })
          fetchTuzuk()
        } else {
          alert(result.message || 'Tüzük silinemedi')
        }
      } catch (error) {
        console.error('Silme hatası:', error)
        alert('Bir hata oluştu')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-purple-600" />
            Tüzük Yönetimi
          </h1>
          <p className="text-muted-foreground mt-2">
            Sendika tüzüğünü görüntüleyin ve düzenleyin
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.open('/tuzuk', '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Önizleme
          </Button>
          
          <Button variant="outline" onClick={handleNewTuzuk}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Tüzük
          </Button>
          
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
            disabled={!currentTuzuk}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Düzenlemeyi Bitir' : 'Düzenle'}
          </Button>
          
          {isEditing && (
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          )}
          
          {currentTuzuk && (
            <Button variant="destructive" onClick={handleDeleteTuzuk}>
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          )}
        </div>
      </div>

      {/* Tüzük İçeriği */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">Tüzük yükleniyor...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : currentTuzuk ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentTuzuk.title}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">v{currentTuzuk.version}</Badge>
                <Badge variant={currentTuzuk.status === 'published' ? 'default' : 'secondary'}>
                  {currentTuzuk.status === 'published' ? 'Yayında' : 'Taslak'}
                </Badge>
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Son güncelleme: {new Date(currentTuzuk.updatedAt).toLocaleDateString('tr-TR')} - {currentTuzuk.lastModifiedBy}
            </p>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Başlık</label>
                  <Input
                    value={tuzukForm.title}
                    onChange={(e) => setTuzukForm({...tuzukForm, title: e.target.value})}
                    placeholder="Tüzük başlığı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Versiyon</label>
                  <Input
                    value={tuzukForm.version}
                    onChange={(e) => setTuzukForm({...tuzukForm, version: e.target.value})}
                    placeholder="1.0.0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Durum</label>
                  <select
                    value={tuzukForm.status}
                    onChange={(e) => setTuzukForm({...tuzukForm, status: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  >
                    <option value="draft">Taslak</option>
                    <option value="published">Yayında</option>
                    <option value="archived">Arşiv</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">İçerik</label>
                  <Textarea
                    value={tuzukForm.content}
                    onChange={(e) => setTuzukForm({...tuzukForm, content: e.target.value})}
                    className="min-h-[500px] font-mono"
                    placeholder="Tüzük içeriğini buraya yazın..."
                  />
                </div>
              </div>
            ) : (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {currentTuzuk.content}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Henüz Tüzük Eklenmemiş</h3>
              <p className="text-muted-foreground mb-6">
                İlk tüzüğü eklemek için "Yeni Tüzük" butonuna tıklayın.
              </p>
              <Button onClick={handleNewTuzuk}>
                <Plus className="h-4 w-4 mr-2" />
                İlk Tüzüğü Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Durum Mesajı */}
      {isEditing && (
        <div className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Tüzük düzenleme modu aktif
          </div>
        </div>
      )}

      {/* Yeni Tüzük Modal */}
      {showNewTuzukModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-4xl mx-4 shadow-2xl border border-slate-200/20 dark:border-slate-700/20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Yeni Tüzük Ekle</h3>
              <button
                onClick={() => setShowNewTuzukModal(false)}
                className="w-8 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Başlık *</label>
                <Input
                  type="text"
                  value={tuzukForm.title}
                  onChange={(e) => setTuzukForm({...tuzukForm, title: e.target.value})}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Tüzük başlığı"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Versiyon</label>
                  <Input
                    type="text"
                    value={tuzukForm.version}
                    onChange={(e) => setTuzukForm({...tuzukForm, version: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="1.0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Durum</label>
                  <select
                    value={tuzukForm.status}
                    onChange={(e) => setTuzukForm({...tuzukForm, status: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  >
                    <option value="draft">Taslak</option>
                    <option value="published">Yayında</option>
                    <option value="archived">Arşiv</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">İçerik *</label>
                <Textarea
                  value={tuzukForm.content}
                  onChange={(e) => setTuzukForm({...tuzukForm, content: e.target.value})}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 min-h-[400px] font-mono"
                  placeholder="Tüzük içeriğini buraya yazın..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowNewTuzukModal(false)}
                className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-all duration-200"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  handleSave()
                  setShowNewTuzukModal(false)
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Tüzük Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



