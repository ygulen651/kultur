"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, User, Edit, Trash2, ArrowUp, ArrowDown, GripVertical, Save } from 'lucide-react'

interface Member { 
  _id?: string
  id?: string
  name: string
  position: string
  photo: string
  bio: string
  order: number
}

export default function GroupManagement({ group, showActions = false, apiPath, title }: { group: string; showActions?: boolean; apiPath?: string; title?: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isReordering, setIsReordering] = useState(false)
  const [originalOrder, setOriginalOrder] = useState<Member[]>([])

  useEffect(() => { load() }, [group, apiPath])

  async function load() {
    try {
      setLoading(true)
      const url = apiPath ? apiPath : `/api/management?group=${encodeURIComponent(group)}`
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        // Sıralama yap
        const sortedMembers = (json.data as any[]).sort((a, b) => (a.order || 999) - (b.order || 999))
        setMembers(sortedMembers)
        setOriginalOrder([...sortedMembers])
      } else setMembers([])
    } finally { setLoading(false) }
  }

  async function addEmptyCard() {
    const token = localStorage.getItem('auth-token')
    if (!token) return alert('Oturum kapalı')
    
    // Kullanıcıdan isim ve pozisyon bilgilerini al
    const name = prompt('Üye adını girin:')
    if (!name || name.trim() === '') {
      alert('Üye adı zorunludur!')
      return
    }
    
    const position = prompt('Üye pozisyonunu girin:')
    if (!position || position.trim() === '') {
      alert('Üye pozisyonu zorunludur!')
      return
    }
    
    const url = apiPath ? apiPath : '/api/management'
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ 
        group, 
        name: name.trim(), 
        position: position.trim(), 
        email: '',
        bio: '',
        photo: '',
        phone: '',
        experience: '',
        education: '',
        order: 999
      })
    })
    const json = await res.json()
    if (res.ok && json.success) {
      await load()
      alert('Yeni üye eklendi')
    } else alert(json.message || 'Eklenemedi')
  }

  async function updateOrder(memberId: string, newOrder: number) {
    const token = localStorage.getItem('auth-token')
    if (!token) return alert('Oturum kapalı')
    
    try {
      const res = await fetch(`${apiPath}/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order: newOrder })
      })
      
      if (res.ok) {
        await load() // Listeyi yenile
      } else {
        alert('Sıralama güncellenemedi')
      }
    } catch (error) {
      alert('Sıralama güncellenirken hata oluştu')
    }
  }

  async function saveNewOrder() {
    const token = localStorage.getItem('auth-token')
    if (!token) return alert('Oturum kapalı')
    
    setIsReordering(true)
    
    try {
      // Tüm üyelerin sıralamasını güncelle
      const updatePromises = members.map((member, index) => {
        const newOrder = index + 1
        return fetch(`${apiPath}/${member._id || member.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ order: newOrder })
        })
      })
      
      await Promise.all(updatePromises)
      await load() // Listeyi yenile
      setIsReordering(false)
      alert('Sıralama başarıyla kaydedildi!')
    } catch (error) {
      alert('Sıralama kaydedilirken hata oluştu')
      setIsReordering(false)
    }
  }

  function moveCard(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= members.length) return
    
    const newMembers = [...members]
    const [movedMember] = newMembers.splice(fromIndex, 1)
    newMembers.splice(toIndex, 0, movedMember)
    
    // Sıra numaralarını güncelle
    newMembers.forEach((member, index) => {
      member.order = index + 1
    })
    
    setMembers(newMembers)
  }

  function cancelReordering() {
    setMembers([...originalOrder])
    setIsReordering(false)
  }

  async function deleteMember(memberId: string) {
    if (!confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) return
    
    const token = localStorage.getItem('auth-token')
    if (!token) return alert('Oturum kapalı')
    
    try {
      const res = await fetch(`${apiPath}/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (res.ok) {
        await load() // Listeyi yenile
        alert('Üye silindi')
      } else {
        alert('Üye silinemedi')
      }
    } catch (error) {
      alert('Üye silinirken hata oluştu')
    }
  }

  const titleMap: Record<string, string> = {
    'yonetim-kurulu': 'Yönetim Kurulu',
    'merkez-yonetim-kurulu': 'Merkez Yönetim Kurulu',
    'merkez-denetleme-kurulu': 'Merkez Denetleme Kurulu',
    'merkez-disiplin-kurulu': 'Merkez Disiplin Kurulu'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title || titleMap[group] || 'Yönetim'}</h1>
        <div className="flex items-center gap-2">
          {isReordering && (
            <>
              <button
                onClick={cancelReordering}
                className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
              >
                İptal
              </button>
              <button
                onClick={saveNewOrder}
                disabled={isReordering}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                Sıralamayı Kaydet
              </button>
            </>
          )}
          {!isReordering && (
            <>
              <button
                onClick={() => setIsReordering(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <GripVertical className="h-4 w-4 mr-2" />
                Sıralamayı Düzenle
              </button>
              {showActions && (
                <>
                  <button onClick={addEmptyCard} className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
                    <Plus className="h-4 w-4 mr-2" /> Boş Kart Ekle
                  </button>
                  <Link href="/admin/yonetim/yeni" className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                    <Plus className="h-4 w-4 mr-2" /> Yeni Üye
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Henüz üye eklenmemiş</h3>
          <p className="text-muted-foreground">
            İlk üyeyi eklemek için yukarıdaki butonları kullanın.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((m, index) => (
            <div 
              key={m._id || m.id || index} 
              className={`bg-white dark:bg-gray-800 rounded-xl border p-6 relative group transition-all duration-200 ${
                isReordering ? 'cursor-move hover:shadow-lg' : ''
              }`}
            >
              {/* Sıralama Kontrolleri */}
              {isReordering ? (
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <button
                    onClick={() => moveCard(index, index - 1)}
                    disabled={index === 0}
                    className="w-6 h-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center text-xs disabled:cursor-not-allowed"
                    title="Yukarı taşı"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => moveCard(index, index + 1)}
                    disabled={index === members.length - 1}
                    className="w-6 h-6 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center text-xs disabled:cursor-not-allowed"
                    title="Aşağı taşı"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => updateOrder(m._id || m.id || '', (m.order || 999) - 1)}
                    className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs"
                    title="Yukarı taşı"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => updateOrder(m._id || m.id || '', (m.order || 999) + 1)}
                    className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs"
                    title="Aşağı taşı"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Sıra Numarası */}
              <div className="absolute top-2 left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {m.order || index + 1}
              </div>

              {/* Drag Handle */}
              {isReordering && (
                <div className="absolute top-2 left-10 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs cursor-move">
                  <GripVertical className="h-3 w-3" />
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photo} alt={m.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{m.name || '(İsim Yok)'}</div>
                  <div className="text-sm text-red-600">{m.position || '(Pozisyon Yok)'}</div>
                </div>
              </div>
              
              {m.bio && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{m.bio}</p>}
              
              {/* Aksiyon Butonları */}
              {showActions && !isReordering && (
                <div className="mt-4 flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href={`/admin/yonetim/${m._id || m.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    Düzenle
                  </Link>
                  <button
                    onClick={() => deleteMember(m._id || m.id || '')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Sil
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sıralama Bilgisi */}
      {isReordering && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <GripVertical className="h-5 w-5" />
            <div>
              <p className="font-medium">Sıralama Modu Aktif</p>
              <p className="text-sm">Yukarı/aşağı okları ile kartları sıralayın, sonra "Sıralamayı Kaydet" butonuna tıklayın.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
