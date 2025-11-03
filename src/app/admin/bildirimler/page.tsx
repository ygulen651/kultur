'use client'

import { useState, useEffect } from 'react'
import { 
  Bell, Send, Users, Eye, Clock, CheckCircle, X, Plus, 
  Mail, MessageSquare, Smartphone, Filter, Search, Trash2, Edit, Globe
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  recipients: 'all' | 'members' | 'admins' | 'custom'
  channels: string[]
  scheduledFor?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  createdAt: string
  sentAt?: string
  recipientCount?: number
  openRate?: number
}

export default function NotificationsPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewNotification, setShowNewNotification] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    recipients: 'all' as string,
    channels: ['web'] as string[],
    scheduledFor: '',
    priority: 'normal' as const,
    emailSubject: '',
    emailRecipients: '',
    emailTemplate: '',
    sendEmail: false
  })

  // Bildirimleri yükle
  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      // API'den bildirimleri yükle
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
      } else {
        console.error('API hatası:', response.status, response.statusText)
        // Hata durumunda boş array kullan
        setNotifications([])
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error)
      // Hata durumunda boş array kullan
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const notificationData = {
        ...newNotification,
        status: newNotification.scheduledFor ? 'scheduled' : 'draft',
        createdAt: new Date().toISOString(),
        channels: newNotification.sendEmail ? [...newNotification.channels, 'email'] : newNotification.channels
      }

      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      })

      if (response.ok) {
        await loadNotifications()
        setNewNotification({
          title: '',
          message: '',
          type: 'info',
          recipients: 'all',
          channels: ['web'],
          scheduledFor: '',
          priority: 'normal',
          emailSubject: '',
          emailRecipients: '',
          emailTemplate: '',
          sendEmail: false
        })
        setShowNewNotification(false)
      }
    } catch (error) {
      console.error('Bildirim oluşturulurken hata:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bu bildirimi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/admin/notifications/${id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadNotifications()
        }
      } catch (error) {
        console.error('Bildirim silinirken hata:', error)
      }
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await loadNotifications()
      }
    } catch (error) {
      console.error('Bildirim durumu güncellenirken hata:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewNotification(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleChannelChange = (channel: string, checked: boolean) => {
    setNewNotification(prev => ({
      ...prev,
      channels: checked 
        ? [...prev.channels, channel]
        : prev.channels.filter(c => c !== channel)
    }))
  }

  const handleRecipientsChange = (recipients: string) => {
    setNewNotification(prev => ({
      ...prev,
      recipients: recipients,
      emailRecipients: recipients === 'custom' ? prev.emailRecipients : ''
    }))
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = selectedTab === 'all' || notification.status === selectedTab
    
    return matchesSearch && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'scheduled': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
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
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent').length,
    scheduled: notifications.filter(n => n.status === 'scheduled').length,
    failed: notifications.filter(n => n.status === 'failed').length
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bildirimler</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Tüm bildirim türlerini yönetin</p>
        </div>
        
        <button
          onClick={() => setShowNewNotification(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Yeni Bildirim</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Toplam Bildirim</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.sent}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Gönderildi</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Zamanlandı</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
              <X className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failed}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Başarısız</p>
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
                { key: 'sent', label: 'Gönderildi' },
                { key: 'scheduled', label: 'Zamanlandı' },
                { key: 'draft', label: 'Taslak' },
                { key: 'failed', label: 'Başarısız' }
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
              placeholder="Bildirimlerde ara..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Bildirimler ({filteredNotifications.length})
          </h3>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Henüz bildirim bulunmuyor</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Yeni bildirim oluşturmak için yukarıdaki "Yeni Bildirim" butonunu kullanın
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.status)}`}>
                        {notification.status === 'sent' && 'Gönderildi'}
                        {notification.status === 'scheduled' && 'Zamanlandı'}
                        {notification.status === 'draft' && 'Taslak'}
                        {notification.status === 'failed' && 'Başarısız'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority === 'urgent' && 'Acil'}
                        {notification.priority === 'high' && 'Yüksek'}
                        {notification.priority === 'normal' && 'Normal'}
                        {notification.priority === 'low' && 'Düşük'}
                      </span>
                    </div>
                    
                    {/* Kanal Bilgileri */}
                    <div className="flex items-center space-x-2 mb-2">
                      {notification.channels.includes('web') && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          <Globe className="h-3 w-3 mr-1" />
                          Web
                        </span>
                      )}
                      {notification.channels.includes('email') && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          <Mail className="h-3 w-3 mr-1" />
                          E-posta
                        </span>
                      )}
                      {notification.channels.includes('sms') && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          <Smartphone className="h-3 w-3 mr-1" />
                          SMS
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Oluşturulma: {new Date(notification.createdAt).toLocaleDateString('tr-TR')}</span>
                      {notification.scheduledFor && (
                        <span>Zamanlanan: {new Date(notification.scheduledFor).toLocaleDateString('tr-TR')}</span>
                      )}
                      {notification.sentAt && (
                        <span>Gönderilme: {new Date(notification.sentAt).toLocaleDateString('tr-TR')}</span>
                      )}
                      {notification.recipientCount && (
                        <span>Alıcı: {notification.recipientCount}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.status === 'draft' && (
                      <button
                        onClick={() => handleStatusChange(notification.id, 'sent')}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-lg"
                        title="Gönder"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(notification.id)}
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

      {/* New Notification Modal */}
      {showNewNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Yeni Bildirim</h3>
              <button
                onClick={() => setShowNewNotification(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Başlık *
                </label>
                <input
                  type="text"
                  name="title"
                  value={newNotification.title}
                  onChange={handleChange}
                  placeholder="Bildirim başlığı..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mesaj *
                </label>
                <textarea
                  name="message"
                  value={newNotification.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Bildirim mesajı..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tip
                  </label>
                  <select
                    name="type"
                    value={newNotification.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="info">Bilgi</option>
                    <option value="success">Başarı</option>
                    <option value="warning">Uyarı</option>
                    <option value="error">Hata</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Öncelik
                  </label>
                  <select
                    name="priority"
                    value={newNotification.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="low">Düşük</option>
                    <option value="normal">Normal</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
              </div>

              {/* Kanal Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bildirim Kanalları
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newNotification.channels.includes('web')}
                      onChange={(e) => handleChannelChange('web', e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Web Bildirimi</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newNotification.channels.includes('email')}
                      onChange={(e) => handleChannelChange('email', e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">E-posta</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newNotification.channels.includes('sms')}
                      onChange={(e) => handleChannelChange('sms', e.target.checked)}
                      className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">SMS</span>
                  </label>
                </div>
              </div>

              {/* Alıcı Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alıcılar
                </label>
                <select
                  name="recipients"
                  value={newNotification.recipients}
                  onChange={(e) => handleRecipientsChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">Tüm Üyeler</option>
                  <option value="members">Aktif Üyeler</option>
                  <option value="admins">Yöneticiler</option>
                  <option value="custom">Özel Alıcılar</option>
                </select>
              </div>

              {/* Özel Alıcılar */}
              {newNotification.recipients === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-posta Adresleri (virgülle ayırın)
                  </label>
                  <textarea
                    name="emailRecipients"
                    value={newNotification.emailRecipients}
                    onChange={handleChange}
                    rows={3}
                    placeholder="ornek@email.com, diger@email.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              {/* E-posta Özellikleri */}
              {newNotification.channels.includes('email') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      E-posta Konusu *
                    </label>
                    <input
                      type="text"
                      name="emailSubject"
                      value={newNotification.emailSubject}
                      onChange={handleChange}
                      placeholder="E-posta konusu..."
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      E-posta Şablonu
                    </label>
                    <textarea
                      name="emailTemplate"
                      value={newNotification.emailTemplate}
                      onChange={handleChange}
                      rows={6}
                      placeholder="E-posta şablonu (HTML desteklenir)..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Boş bırakırsanız standart şablon kullanılır. HTML etiketleri kullanabilirsiniz.
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Zamanlanan Tarih (Opsiyonel)
                </label>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  value={newNotification.scheduledFor}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </form>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowNewNotification(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={!newNotification.title || !newNotification.message}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Oluştur</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
