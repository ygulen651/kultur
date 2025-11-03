'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, Send, Users, Eye, Clock, CheckCircle, X, Plus, 
  Filter, Search, Calendar, AlertCircle, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface EmailNotification {
  _id: string
  title: string
  message: string
  emailSubject: string
  emailRecipients: string[]
  type: 'info' | 'success' | 'warning' | 'error'
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  recipients: number
  opened: number
  clicked: number
  scheduledFor?: string
  sentAt?: string
  failedAt?: string
  createdAt: string
  createdBy: string
  template?: string
  attachments?: string[]
}

export default function EmailNotificationsPage() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewForm, setShowNewForm] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    scheduled: 0,
    draft: 0,
    failed: 0
  })

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    emailSubject: '',
    emailRecipients: '',
    type: 'info' as const,
    priority: 'normal' as const,
    scheduledFor: '',
    template: '',
    attachments: ''
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      // Auth token'ı al
      const token = localStorage.getItem('auth-token') || 
                   document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1]
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      // Token varsa Authorization header'ına ekle
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/admin/email-notifications', {
        headers
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Yetkisiz erişim. Lütfen admin paneline giriş yapın.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.data)
        calculateStats(data.data)
      } else {
        console.error('API hatası:', data.error)
        alert('E-posta bildirimleri yüklenirken hata oluştu: ' + (data.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      console.error('E-posta bildirimleri getirilemedi:', error)
      alert('E-posta bildirimleri yüklenirken hata oluştu: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: EmailNotification[]) => {
    const stats = {
      total: data.length,
      sent: data.filter(n => n.status === 'sent').length,
      scheduled: data.filter(n => n.status === 'scheduled').length,
      draft: data.filter(n => n.status === 'draft').length,
      failed: data.filter(n => n.status === 'failed').length
    }
    setStats(stats)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Auth token'ı al
      const token = localStorage.getItem('auth-token') || 
                   document.cookie.split('; ').find(row => row.startsWith('auth-token='))?.split('=')[1]
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      
      // Token varsa Authorization header'ına ekle
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      const response = await fetch('/api/admin/email-notifications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...newNotification,
          emailRecipients: newNotification.emailRecipients.split(',').map(email => email.trim())
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('E-posta bildirimi başarıyla oluşturuldu!')
        setShowNewForm(false)
        setNewNotification({
          title: '',
          message: '',
          emailSubject: '',
          emailRecipients: '',
          type: 'info',
          priority: 'normal',
          scheduledFor: '',
          template: '',
          attachments: ''
        })
        fetchNotifications()
      } else {
        alert('Hata: ' + result.error)
      }
    } catch (error) {
      console.error('Gönderim hatası:', error)
      alert('Gönderim sırasında hata oluştu')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      sent: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    
    const labels = {
      sent: 'Gönderildi',
      scheduled: 'Zamanlandı',
      draft: 'Taslak',
      failed: 'Başarısız'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    
    const labels = {
      low: 'Düşük',
      normal: 'Normal',
      high: 'Yüksek',
      urgent: 'Acil'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[priority as keyof typeof badges]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    )
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.emailSubject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = selectedTab === 'all' || notification.status === selectedTab
    
    return matchesSearch && matchesTab
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">E-posta Bildirimleri</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">E-posta bildirimlerini yönetin ve takip edin</p>
        </div>
        
        <Button
          onClick={() => setShowNewForm(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni E-posta Bildirimi
        </Button>
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
              <p className="text-gray-600 dark:text-gray-400 text-sm">Toplam</p>
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
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Zamanlandı</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Clock className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.draft}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Taslak</p>
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
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="E-posta bildirimlerinde ara..."
              className="pl-10 pr-4 py-2 w-64"
            />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            E-posta Bildirimleri ({filteredNotifications.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredNotifications.map((notification) => (
            <div key={notification._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        {notification.title}
                      </h4>
                      {getStatusBadge(notification.status)}
                      {getPriorityBadge(notification.priority)}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {notification.message}
                    </p>
                    
                    {/* E-posta detayları */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-2">
                        <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                            <span className="font-medium">Konu:</span> {notification.emailSubject}
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            <span className="font-medium">Alıcılar:</span> {notification.emailRecipients.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {notification.recipients} alıcı
                      </div>
                      
                      {notification.status === 'sent' && (
                        <>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {notification.opened} açılma
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {notification.clicked} tıklama
                          </div>
                        </>
                      )}
                      
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {notification.sentAt || notification.scheduledFor || notification.createdAt}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <p>{notification.createdBy}</p>
                  <p className="mt-1">
                    {notification.status === 'sent' && `${((notification.opened / notification.recipients) * 100).toFixed(1)}% açılma`}
                    {notification.status === 'scheduled' && 'Beklemede'}
                    {notification.status === 'failed' && 'Hata'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">E-posta bildirimi bulunamadı</p>
          </div>
        )}
      </div>

      {/* New Email Notification Modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Yeni E-posta Bildirimi</h3>
              <button
                onClick={() => setShowNewForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Bildirim başlığı..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="emailSubject">E-posta Konusu *</Label>
                <Input
                  id="emailSubject"
                  value={newNotification.emailSubject}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, emailSubject: e.target.value }))}
                  placeholder="E-posta konusu..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Mesaj *</Label>
                <Textarea
                  id="message"
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  placeholder="E-posta mesajı..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="emailRecipients">E-posta Alıcıları *</Label>
                <Input
                  id="emailRecipients"
                  value={newNotification.emailRecipients}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, emailRecipients: e.target.value }))}
                  placeholder="ornek@email.com, diger@email.com"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Birden fazla e-posta adresini virgülle ayırın
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tip</Label>
                  <select
                    id="type"
                    value={newNotification.type}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="info">Bilgi</option>
                    <option value="success">Başarı</option>
                    <option value="warning">Uyarı</option>
                    <option value="error">Hata</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority">Öncelik</Label>
                  <select
                    id="priority"
                    value={newNotification.priority}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="low">Düşük</option>
                    <option value="normal">Normal</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="scheduledFor">Zamanlama (İsteğe bağlı)</Label>
                <Input
                  type="datetime-local"
                  id="scheduledFor"
                  value={newNotification.scheduledFor}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, scheduledFor: e.target.value }))}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Boş bırakırsanız hemen gönderilir
                </p>
              </div>

              <div>
                <Label htmlFor="template">E-posta Şablonu (İsteğe bağlı)</Label>
                <Input
                  id="template"
                  value={newNotification.template}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, template: e.target.value }))}
                  placeholder="Şablon adı..."
                />
              </div>
            </form>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => setShowNewForm(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!newNotification.title || !newNotification.message || !newNotification.emailSubject || !newNotification.emailRecipients}
                className="bg-red-600 hover:bg-red-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {newNotification.scheduledFor ? 'Zamanla' : 'Gönder'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
