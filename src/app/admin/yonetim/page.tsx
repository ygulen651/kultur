"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface ManagementMember {
  _id?: string
  id?: string
  group: string
  name: string
  position: string
  bio?: string
  photo?: string
  email?: string
  phone?: string
  experience?: string
  education?: string
  order?: number
  isActive?: boolean
}

export default function AdminYonetimPage() {
  const [members, setMembers] = useState<ManagementMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('yonetim-kurulu')

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/boards/yonetim-kurulu')
      
      if (response.ok) {
        const result = await response.json()
        console.log('📡 API Response:', JSON.stringify(result, null, 2))
        
        if (result.success) {
          // Sıralama yap
          const sortedMembers = (result.data || []).sort((a: any, b: any) => (a.order || 999) - (b.order || 999))
          console.log('✅ Sıralanmış üyeler:', JSON.stringify(sortedMembers, null, 2))
          console.log('🔢 Üye sayısı:', sortedMembers.length)
          console.log('👤 İlk üye:', sortedMembers[0])
          setMembers(sortedMembers)
        } else {
          console.error('❌ API Error:', result.message)
        }
      } else {
        console.error('❌ HTTP Error:', response.status)
      }
    } catch (error) {
      console.error('❌ Network Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMember = async (id: string) => {
    if (!confirm('Bu üyeyi silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/boards/yonetim-kurulu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })

      if (response.ok) {
        alert('Üye başarıyla silindi!')
        loadMembers() // Listeyi yenile
      } else {
        alert('Üye silinirken hata oluştu!')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Üye silinirken hata oluştu!')
    }
  }

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupTitleMap: { [key: string]: string } = {
    'yonetim-kurulu': 'Yönetim Kurulu',
    'merkez-yonetim-kurulu': 'Merkez Yönetim Kurulu',
    'merkez-denetleme-kurulu': 'Merkez Denetleme Kurulu',
    'merkez-disiplin-kurulu': 'Merkez Disiplin Kurulu'
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {groupTitleMap[selectedGroup] || 'Yönetim Kurulu'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Toplam {members.length} üye
          </p>
        </div>
        
        <div className="flex gap-2">
          <Link href="/admin/yonetim/yeni">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Yeni Üye Ekle
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Üye ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz üye eklenmemiş.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member, index) => (
            <Card key={member._id || member.id || `member-${index}`} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </CardTitle>
                    <Badge variant="secondary" className="mt-2">
                      {member.position}
                    </Badge>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Link href={`/admin/yonetim/${member._id || member.id}`}>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() => deleteMember(member._id || member.id || '')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {member.photo && (
                  <div className="mb-4">
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {member.bio && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {member.bio}
                  </p>
                )}
                
                <div className="space-y-2 text-sm">
                  {member.email && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">E-posta:</span>
                      <span className="text-gray-600 dark:text-gray-400">{member.email}</span>
                    </div>
                  )}
                  
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Telefon:</span>
                      <span className="text-gray-600 dark:text-gray-400">{member.phone}</span>
                    </div>
                  )}
                  
                  {member.order !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Sıra:</span>
                      <span className="text-gray-600 dark:text-gray-400">{member.order}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* MongoDB Test Button */}
      <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Debug Bilgileri</h3>
        <Button 
          onClick={async () => {
            try {
              const response = await fetch('/api/test-mongodb')
              const result = await response.json()
              console.log('🧪 Test sonucu:', result)
              alert(`MongoDB Test: ${result.message}`)
            } catch (error) {
              console.error('Test error:', error)
              alert('Test hatası!')
            }
          }}
          variant="outline"
        >
          MongoDB Bağlantısını Test Et
        </Button>
      </div>
    </div>
  )
}
