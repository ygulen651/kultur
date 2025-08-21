'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Search, 
  FileText,
  File,
  Download,
  Upload,
  Folder,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Filter,
  Archive,
  Lock,
  Unlock,
  Share2
} from 'lucide-react'
import Link from 'next/link'

// Mock data - boş liste
const documentsData: any[] = []

const fileTypeColors = {
  pdf: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  docx: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  xlsx: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  pptx: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  txt: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

const statusColors = {
  published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

const statusLabels = {
  published: 'Yayında',
  draft: 'Taslak',
  archived: 'Arşiv'
}

const categories = ['Tümü', 'Resmi Belgeler', 'Şablonlar', 'Formlar', 'Yönetim', 'Hukuki', 'Eğitim']

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showPrivate, setShowPrivate] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'Resmi Belgeler',
    tags: '',
    file: null as File | null,
    fileName: '',
    fileSize: 0,
    fileType: '',
    mimeType: '',
    status: 'published',
    isPrivate: false
  })
  const [isUploading, setIsUploading] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (selectedCategory !== 'Tümü') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (searchTerm) params.append('search', searchTerm)
      if (showPrivate) params.append('showPrivate', 'true')

      const response = await fetch(`/api/documents?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setDocuments(result.data)
      } else {
        console.error('Documents fetch error:', result.message)
        setDocuments([])
      }
    } catch (error) {
      console.error('Fetch documents error:', error)
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory, selectedStatus, searchTerm, showPrivate])

  // Belgeleri API'den yükle
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'Tümü' || doc.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus
    const matchesPrivacy = showPrivate || !doc.isPrivate
    return matchesSearch && matchesCategory && matchesStatus && matchesPrivacy
  })

  const handleSelectAll = () => {
    if (selectedItems.length === filteredDocuments.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredDocuments.map(item => item._id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalSizeBytes = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0)
  const totalSize = formatFileSize(totalSizeBytes)

  const totalDownloads = documents.reduce((sum, doc) => sum + (doc.downloadCount || 0), 0)

  const handleDeleteDocument = async (docId: string) => {
    const doc = documents.find(d => d._id === docId)
    if (!doc) return

    if (confirm(`"${doc.title}" belgesini silmek istediğinizden emin misiniz?`)) {
      try {
        const token = localStorage.getItem('auth-token')
        if (!token) {
          alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
          return
        }

        const response = await fetch(`/api/documents/${docId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const result = await response.json()

        if (response.ok && result.success) {
          // Listeyi yeniden yükle
          fetchDocuments()
          // Seçili öğelerden de kaldır
          setSelectedItems(prev => prev.filter(id => id !== docId))
          alert('Belge başarıyla silindi!')
        } else {
          alert(result.message || 'Belge silinemedi')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('Bir hata oluştu')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Silinecek belge seçin')
      return
    }

    const count = selectedItems.length
    if (confirm(`${count} belgeyi silmek istediğinizden emin misiniz?`)) {
      try {
        const token = localStorage.getItem('auth-token')
        if (!token) {
          alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
          return
        }

        // Tüm belgeleri sil
        const deletePromises = selectedItems.map(id =>
          fetch(`/api/documents/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )

        await Promise.all(deletePromises)
        
        // Listeyi yeniden yükle
        fetchDocuments()
        setSelectedItems([])
        alert(`${count} belge başarıyla silindi!`)
      } catch (error) {
        console.error('Bulk delete error:', error)
        alert('Bir hata oluştu')
      }
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadForm({
        ...uploadForm,
        file,
        fileName: file.name,
        fileSize: file.size / (1024 * 1024), // MB cinsinden
        fileType: file.name.split('.').pop()?.toLowerCase() || '',
        mimeType: file.type
      })
    }
  }

  const handleUploadDocument = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.')
        return
      }

      // Validation
      if (!uploadForm.title || !uploadForm.category || !uploadForm.file) {
        alert('Lütfen zorunlu alanları doldurun!')
        return
      }

      setIsUploading(true)

      // Önce dosyayı yükle
      const formData = new FormData()
      formData.append('file', uploadForm.file)
      formData.append('title', uploadForm.title)
      formData.append('description', uploadForm.description || '')
      formData.append('category', uploadForm.category)
      formData.append('tags', uploadForm.tags || '')
      formData.append('status', uploadForm.status)
      formData.append('isPrivate', uploadForm.isPrivate.toString())
      formData.append('uploadedBy', 'Admin')

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Belge başarıyla eklendi!')
        setShowUploadModal(false)
        setUploadForm({
          title: '',
          description: '',
          category: 'Resmi Belgeler',
          tags: '',
          file: null,
          fileName: '',
          fileSize: 0,
          fileType: '',
          mimeType: '',
          status: 'published',
          isPrivate: false
        })
        fetchDocuments()
      } else {
        alert(result.message || 'Belge eklenemedi')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Bir hata oluştu')
    } finally {
      setIsUploading(false)
    }
  }



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bilgi-Belge Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tüm belgeleri ve dosyaları yönetin
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Belge Yükle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Belge</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
              <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam İndirme</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalDownloads.toLocaleString('tr-TR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
              <Archive className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Depolama</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalSize}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-lg">
              <Lock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gizli Belgeler</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {documents.filter(doc => doc.isPrivate).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Belge ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
            <option value="archived">Arşiv</option>
          </select>

          {/* Privacy Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show-private"
              checked={showPrivate}
              onChange={(e) => setShowPrivate(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <label htmlFor="show-private" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Gizli belgeleri göster
            </label>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.length} belge seçildi
              </span>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
                  İndir
                </button>
                <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Arşivle
                </button>
                <button 
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="w-12 px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredDocuments.length && filteredDocuments.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Belge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Boyut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Yazar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İndirme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredDocuments.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(doc._id)}
                      onChange={() => handleSelectItem(doc._id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg mr-3">
                        <File className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {doc.title}
                          </h3>
                          {doc.isPrivate && (
                            <Lock className="h-4 w-4 text-orange-500 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {doc.description}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${fileTypeColors[doc.fileType as keyof typeof fileTypeColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'}`}>
                            {(doc.fileType || 'unknown').toUpperCase()}
                          </span>
                          <div className="flex flex-wrap gap-1 ml-2">
                            {(doc.tags || []).slice(0, 2).map((tag: string) => (
                              <span key={tag} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {formatFileSize(doc.fileSize || 0)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{doc.uploadedBy || 'Bilinmiyor'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[doc.status as keyof typeof statusColors]}`}>
                      {statusLabels[doc.status as keyof typeof statusLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Download className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{doc.downloadCount || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="İndir"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/admin/bilgi-belge/${doc._id}`}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/admin/bilgi-belge/${doc._id}/duzenle`}
                        className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Daha fazla"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Toplam {filteredDocuments.length} belge
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Önceki
              </button>
              <button className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 w-full max-w-2xl mx-4 shadow-2xl border border-slate-200/20 dark:border-slate-700/20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Yeni Belge Ekle</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Başlık *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="Belge başlığı"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Açıklama</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  rows={3}
                  placeholder="Belge açıklaması"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Kategori *</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  >
                    {categories.filter(cat => cat !== 'Tümü').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Durum</label>
                  <select
                    value={uploadForm.status}
                    onChange={(e) => setUploadForm({...uploadForm, status: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  >
                    <option value="published">Yayında</option>
                    <option value="draft">Taslak</option>
                    <option value="archived">Arşiv</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Etiketler (virgülle ayırın)</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  placeholder="etiket1, etiket2, etiket3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Dosya Seç *</label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors duration-200">
                  {uploadForm.file ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                          <FileText className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{uploadForm.fileName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {(uploadForm.fileSize).toFixed(2)} MB • {(uploadForm.fileType || 'unknown').toUpperCase()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadForm({...uploadForm, file: null, fileName: '', fileSize: 0, fileType: '', mimeType: ''})}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Dosyayı Kaldır
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                          <Upload className="h-8 w-8 text-slate-600 dark:text-slate-400" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Dosya seçmek için tıklayın</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          PDF, DOC, XLSX, PPTX dosyaları desteklenir
                        </p>
                      </div>
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer transition-colors duration-200"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Dosya Seç
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Dosya Boyutu (MB)</label>
                  <input
                    type="number"
                    value={uploadForm.fileSize}
                    onChange={(e) => setUploadForm({...uploadForm, fileSize: parseFloat(e.target.value)})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="2.5"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Dosya Türü</label>
                  <input
                    type="text"
                    value={uploadForm.fileType}
                    onChange={(e) => setUploadForm({...uploadForm, fileType: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="pdf"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">MIME Type</label>
                  <input
                    type="text"
                    value={uploadForm.mimeType}
                    onChange={(e) => setUploadForm({...uploadForm, mimeType: e.target.value})}
                    className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    placeholder="application/pdf"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={uploadForm.isPrivate}
                  onChange={(e) => setUploadForm({...uploadForm, isPrivate: e.target.checked})}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-red-600 focus:ring-red-500 focus:ring-2"
                />
                <label htmlFor="isPrivate" className="text-sm font-medium text-slate-700 dark:text-slate-300">Gizli belge</label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-all duration-200"
              >
                İptal
              </button>
              <button
                onClick={handleUploadDocument}
                disabled={isUploading}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Yükleniyor...
                  </>
                ) : (
                  'Belge Ekle'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
