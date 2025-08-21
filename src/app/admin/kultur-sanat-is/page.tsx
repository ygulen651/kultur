'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, Calendar, User, Tag } from 'lucide-react'

type Item = {
  _id: string
  title: string
  slug: string
  excerpt?: string
  publishDate: string
  status: 'draft' | 'published' | 'archived'
  author?: string
  category?: string
  coverImage?: string
  isFeatured?: boolean
}

export default function KulturSanatIsAdminList() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      const res = await fetch('/api/kultur-sanat-is', { cache: 'no-store' })
      const json = await res.json()
      setItems(json.success ? json.data : [])
    } finally { setLoading(false) }
  }

  async function handleDelete(slug: string) {
    if (!confirm('Bu içeriği silmek istiyor musunuz?')) return
    const token = localStorage.getItem('auth-token')
    if (!token) return alert('Oturum kapalı')
    const res = await fetch(`/api/kultur-sanat-is/${slug}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json()
    if (res.ok && json.success) setItems(prev => prev.filter(i => i.slug !== slug))
    else alert(json.message || 'Silinemedi')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Yayında'
      case 'draft': return 'Taslak'
      case 'archived': return 'Arşivlenmiş'
      default: return status
    }
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kültür Sanat-İş Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kültür sanat alanındaki içerikleri yönetin
          </p>
        </div>
        <Link 
          href="/admin/kultur-sanat-is/yeni" 
          className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus className="h-5 w-5 mr-2" />
          Yeni İçerik
        </Link>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam İçerik</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{items.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yayında</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {items.filter(i => i.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <User className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taslak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {items.filter(i => i.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Öne Çıkan</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {items.filter(i => i.isFeatured).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik Listesi */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">İçerikler yükleniyor...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">İçerik Listesi</h3>
          </div>
          
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Henüz içerik yok</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                İlk içeriğinizi oluşturmak için "Yeni İçerik" butonuna tıklayın.
              </p>
              <Link 
                href="/admin/kultur-sanat-is/yeni"
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk İçeriği Oluştur
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İçerik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Yazar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((it, index) => (
                    <tr key={it._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {it.coverImage ? (
                              <img 
                                className="h-12 w-12 rounded-lg object-cover" 
                                src={it.coverImage} 
                                alt={it.title} 
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <Tag className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {it.title}
                            </div>
                            {it.excerpt && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {it.excerpt}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {it.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(it.status)}`}>
                          {getStatusText(it.status)}
                        </span>
                        {it.isFeatured && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Öne Çıkan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {it.author || 'Anonim'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(it.publishDate).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={`/kultur-sanat-is/${it.slug}`}
                            target="_blank"
                            className="inline-flex p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Görüntüle"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link 
                            href={`/admin/kultur-sanat-is/${it.slug}/duzenle`}
                            className="inline-flex p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(it.slug)}
                            className="inline-flex p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
