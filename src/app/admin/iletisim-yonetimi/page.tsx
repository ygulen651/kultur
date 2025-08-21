'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, Eye, CheckCircle, Archive, Reply, Clock, 
  Search, Filter, Trash2, Edit, Phone, Building, 
  AlertCircle, MessageSquare, User, Calendar
} from 'lucide-react'

interface Contact {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  company?: string
  status: 'new' | 'read' | 'replied' | 'archived'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  createdAt: string
  readAt?: string
  repliedAt?: string
  adminNotes?: string
  ipAddress?: string
  userAgent?: string
}

export default function ContactManagementPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showContactDetail, setShowContactDetail] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')

  // İletişim mesajlarını yükle
  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/contact')
      if (response.ok) {
        const data = await response.json()
        setContacts(data.data || [])
      }
    } catch (error) {
      console.error('İletişim mesajları yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await loadContacts()
      }
    } catch (error) {
      console.error('Durum güncellenirken hata:', error)
    }
  }

  const handlePriorityChange = async (id: string, priority: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority }),
      })

      if (response.ok) {
        await loadContacts()
      }
    } catch (error) {
      console.error('Öncelik güncellenirken hata:', error)
    }
  }

  const handleAddNotes = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminNotes }),
      })

      if (response.ok) {
        await loadContacts()
        setAdminNotes('')
        setShowContactDetail(false)
      }
    } catch (error) {
      console.error('Notlar eklenirken hata:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/admin/contacts/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadContacts()
        }
      } catch (error) {
        console.error('Mesaj silinirken hata:', error)
      }
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = selectedTab === 'all' || contact.status === selectedTab
    
    return matchesSearch && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'read': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'replied': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      case 'archived': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      case 'normal': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'low': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  const stats = {
    total: contacts.length,
    new: contacts.filter(c => c.status === 'new').length,
    read: contacts.filter(c => c.status === 'read').length,
    replied: contacts.filter(c => c.status === 'replied').length,
    archived: contacts.filter(c => c.status === 'archived').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">İletişim Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gelen iletişim mesajlarını yönetin</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Toplam Mesaj</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.new}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Yeni</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.read}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Okundu</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Reply className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.replied}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Yanıtlandı</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-900/20">
              <Archive className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.archived}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Arşivlendi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { key: 'all', label: 'Tümü' },
                { key: 'new', label: 'Yeni' },
                { key: 'read', label: 'Okundu' },
                { key: 'replied', label: 'Yanıtlandı' },
                { key: 'archived', label: 'Arşivlendi' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === tab.key
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mesajlarda ara..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            İletişim Mesajları ({filteredContacts.length})
          </h3>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Henüz iletişim mesajı bulunmuyor</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredContacts.map((contact) => (
              <div key={contact._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {contact.subject}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                        {contact.status === 'new' && 'Yeni'}
                        {contact.status === 'read' && 'Okundu'}
                        {contact.status === 'replied' && 'Yanıtlandı'}
                        {contact.status === 'archived' && 'Arşivlendi'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(contact.priority)}`}>
                        {contact.priority === 'urgent' && 'Acil'}
                        {contact.priority === 'high' && 'Yüksek'}
                        {contact.priority === 'normal' && 'Normal'}
                        {contact.priority === 'low' && 'Düşük'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {contact.name}
                      </span>
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {contact.email}
                      </span>
                      {contact.phone && (
                        <span className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {contact.phone}
                        </span>
                      )}
                      {contact.company && (
                        <span className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {contact.company}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {contact.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(contact.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                      {contact.readAt && (
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          Okundu: {new Date(contact.readAt).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                      {contact.repliedAt && (
                        <span className="flex items-center">
                          <Reply className="h-4 w-4 mr-1" />
                          Yanıtlandı: {new Date(contact.repliedAt).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedContact(contact)
                        setShowContactDetail(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg"
                      title="Detayları Gör"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    {contact.status === 'new' && (
                      <button
                        onClick={() => handleStatusChange(contact._id, 'read')}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                        title="Okundu Olarak İşaretle"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    
                    {contact.status !== 'replied' && (
                      <button
                        onClick={() => handleStatusChange(contact._id, 'replied')}
                        className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg"
                        title="Yanıtlandı Olarak İşaretle"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg"
                      title="Sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {showContactDetail && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Mesaj Detayları: {selectedContact.subject}
              </h3>
              <button
                onClick={() => setShowContactDetail(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="sr-only">Kapat</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Gönderen Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gönderen Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">İsim:</span> {selectedContact.name}</p>
                    <p><span className="font-medium">E-posta:</span> {selectedContact.email}</p>
                    {selectedContact.phone && (
                      <p><span className="font-medium">Telefon:</span> {selectedContact.phone}</p>
                    )}
                    {selectedContact.company && (
                      <p><span className="font-medium">Şirket:</span> {selectedContact.company}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Teknik Bilgiler</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">IP Adresi:</span> {selectedContact.ipAddress || 'Bilinmiyor'}</p>
                    <p><span className="font-medium">Tarih:</span> {new Date(selectedContact.createdAt).toLocaleString('tr-TR')}</p>
                    <p><span className="font-medium">Durum:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedContact.status)}`}>
                        {selectedContact.status === 'new' && 'Yeni'}
                        {selectedContact.status === 'read' && 'Okundu'}
                        {selectedContact.status === 'replied' && 'Yanıtlandı'}
                        {selectedContact.status === 'archived' && 'Arşivlendi'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Mesaj İçeriği */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mesaj</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              {/* Admin Notları */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Notları</h4>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Bu mesaj hakkında notlarınızı buraya yazın..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleAddNotes(selectedContact._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Notları Kaydet
                  </button>
                  <button
                    onClick={() => setShowContactDetail(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}