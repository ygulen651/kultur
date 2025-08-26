'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  Share2,
  AlertCircle
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
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showPrivate, setShowPrivate] = useState(false)
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  // Authentication kontrolü
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('auth-token')
    if (!token) {
      router.push('/admin/login')
      return false
    }
    return true
  }, [router])

  const fetchDocuments = useCallback(async () => {
    if (!checkAuth()) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setError('Oturum süresi dolmuş')
        return
      }

      const params = new URLSearchParams()
      
      if (selectedCategory !== 'Tümü') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (searchTerm) params.append('search', searchTerm)
      if (showPrivate) params.append('showPrivate', 'true')

      const response = await fetch(`/api/documents?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()

      if (result.success) {
        setDocuments(result.data || [])
      } else {
        setError(result.message || 'Veriler yüklenemedi')
        setDocuments([])
      }
    } catch (error: any) {
      console.error('Fetch documents error:', error)
      setError(error.message || 'Veriler yüklenemedi')
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory, selectedStatus, searchTerm, showPrivate, checkAuth])

  // Belgeleri API'den yükle
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const filteredDocuments = documents.filter(doc => {
    if (searchTerm && !doc.title.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (selectedCategory !== 'Tümü' && doc.category !== selectedCategory) return false
    if (selectedStatus !== 'all' && doc.status !== selectedStatus) return false
    return true
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
    if (!confirm('Bu belgeyi silmek istediğinizden emin misiniz?')) return
    
    if (!checkAuth()) return
    
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setError('Oturum süresi dolmuş')
        return
      }

      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setDocuments(prev => prev.filter(doc => doc._id !== docId))
        alert('Belge başarıyla silindi!')
      } else {
        setError(result.message || 'Belge silinemedi')
      }
    } catch (error: any) {
      console.error('Delete error:', error)
      setError(error.message || 'Belge silinirken hata oluştu')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('Silinecek belge seçin')
      return
    }

    if (!checkAuth()) return

    const count = selectedItems.length
    if (confirm(`${count} belgeyi silmek istediğinizden emin misiniz?`)) {
      try {
        const token = localStorage.getItem('auth-token')
        if (!token) {
          setError('Oturum süresi dolmuş')
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
      } catch (error: any) {
        console.error('Bulk delete error:', error)
        setError(error.message || 'Bir hata oluştu')
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

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkAuth()) return
    
    if (!uploadForm.title || !uploadForm.category || !uploadForm.file) {
      alert('Lütfen tüm gerekli alanları doldurun')
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setError('Oturum süresi dolmuş')
        return
      }

      const formData = new FormData()
      formData.append('title', uploadForm.title)
      formData.append('description', uploadForm.description)
      formData.append('category', uploadForm.category)
      formData.append('tags', uploadForm.tags)
      formData.append('status', uploadForm.status)
      formData.append('isPrivate', uploadForm.isPrivate.toString())
      formData.append('file', uploadForm.file)
      formData.append('uploadedBy', 'Admin') // Gerçek uygulamada kullanıcı bilgisi

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Belge başarıyla yüklendi!')
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
        fetchDocuments() // Listeyi yenile
      } else {
        setError(result.message || 'Belge yüklenemedi')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Belge yüklenirken hata oluştu')
    } finally {
      setIsUploading(false)
    }
  }



  // Authentication hatası varsa login sayfasına yönlendir
  if (error === 'Oturum süresi dolmuş') {
    router.push('/admin/login')
    return null
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

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Hata</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button 
            onClick={fetchDocuments}
            className="ml-auto px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Belge</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{documents.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yayında</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {documents.filter(doc => doc.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Archive className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taslak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {documents.filter(doc => doc.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam İndirme</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {documents.reduce((total, doc) => total + (doc.downloadCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Arama
            </label>
            <input
              type="text"
              placeholder="Belge ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Durum
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tümü</option>
              <option value="published">Yayında</option>
              <option value="draft">Taslak</option>
              <option value="archived">Arşiv</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPrivate}
                onChange={(e) => setShowPrivate(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Özel Belgeler</span>
            </label>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Belgeler yükleniyor...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Belge bulunamadı</h3>
          <p className="text-muted-foreground mb-6">
            Arama kriterlerinize uygun belge bulunamadı
          </p>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            İlk Belgeyi Ekle
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Belge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Boyut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    İndirme
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
                {filteredDocuments.map((document) => (
                  <tr key={document._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                            <File className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {document.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {document.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {document.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[document.status as keyof typeof statusColors] || statusColors.draft}`}>
                        {statusLabels[document.status as keyof typeof statusLabels] || document.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {document.fileSize ? `${(document.fileSize / 1024 / 1024).toFixed(2)} MB` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {document.downloadCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(document.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => window.open(document.fileUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Yeni Belge Yükle</h2>
            <form onSubmit={handleUploadDocument} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Başlık *
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori *
                </label>
                <select
                  required
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Etiketler
                </label>
                <input
                  type="text"
                  placeholder="virgülle ayırın"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durum
                </label>
                <select
                  value={uploadForm.status}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="published">Yayında</option>
                  <option value="draft">Taslak</option>
                  <option value="archived">Arşiv</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dosya *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setUploadForm(prev => ({ 
                        ...prev, 
                        file,
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.name.split('.').pop() || '',
                        mimeType: file.type
                      }))
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={uploadForm.isPrivate}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Özel belge (sadece yöneticiler görebilir)
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Yükleniyor...' : 'Yükle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
