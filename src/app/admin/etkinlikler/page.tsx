'use client'

import { useEffect, useState } from 'react'
import { 
  Plus, 
  Search, 
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  Eye,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setErr("")
        const params = new URLSearchParams()
        if (selectedStatus !== 'all') params.set('status', selectedStatus)
        const res = await fetch(`/api/events?${params.toString()}`, { cache: 'no-store' })
        const json = await res.json()
        if (res.ok && json.ok) setItems(Array.isArray(json.items) ? json.items : [])
        else throw new Error(json?.error || `HTTP_${res.status}`)
      } catch (e: any) {
        setErr(e?.message || String(e))
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedStatus])

  const filteredEvents = items.filter(event => {
    const matchesSearch = (event.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || (event.status || '') === selectedStatus
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = () => {
    if (selectedItems.length === filteredEvents.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredEvents.map(item => item._id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return;
    setDeletingId(id);
    setDeleteError('');
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP_${res.status}`);
      setItems(prev => prev.filter(ev => ev._id !== id));
    } catch (e: any) {
      setDeleteError(e?.message || 'Silme işlemi başarısız oldu.');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <div className="p-6">Yükleniyor…</div>
  if (err) return <div className="p-6 text-red-600">Hata: {err}</div>
  if (!filteredEvents.length) return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Etkinlik bulunamadı
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {searchTerm || selectedStatus !== 'all' 
          ? 'Arama kriterlerinize uygun etkinlik bulunamadı.'
          : 'Henüz hiç etkinlik eklenmemiş.'}
      </p>
      <Link
        href="/admin/etkinlikler/yeni"
        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4 mr-2" />
        İlk Etkinliği Ekle
      </Link>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Etkinlikler</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tüm etkinlikleri yönetin ve düzenleyin
          </p>
        </div>
        <Link 
          href="/admin/etkinlikler/yeni"
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Etkinlik
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Etkinlik ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="upcoming">Yaklaşan</option>
              <option value="ongoing">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
        </div>
      </div>

      {deleteError && (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {deleteError}
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const cover = event.computedCover || "";
          return (
            <div key={event._id} className="relative overflow-hidden rounded-2xl border bg-white/80 dark:bg-slate-900/80 hover:shadow-lg transition-shadow" style={{ minHeight: 220 }}>
              {/* Arka plan görsel (tam dolgu) */}
              {cover ? (
                <Image
                  src={cover}
                  alt={event.title}
                  fill
                  className="object-cover opacity-35"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={false}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800" />
              )}
              {/* Üst renkli overlay (şeffaf, renkler kalsın) */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-blue-600/15 to-purple-600/20" />
              {/* İçerik */}
              <div className="relative p-5">
                <div className="text-xs mb-1 text-slate-700 dark:text-slate-300">
                  {event.startAt ? new Date(event.startAt).toLocaleString("tr-TR") : "-"} — {event.location || "Konum yok"}
                </div>
                <h3 className="text-lg font-bold">{event.title}</h3>
                {event.excerpt && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{event.excerpt}</p>}
                <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                  {event.isFeatured ? "Öne çıkan" : "—"} · {event.publishedAt ? new Date(event.publishedAt).toLocaleDateString("tr-TR") : "—"}
                </div>
                <button
                  className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Sil"
                  disabled={deletingId === event._id}
                  onClick={() => handleDelete(event._id)}
                >
                  {deletingId === event._id ? (
                    <span className="animate-spin"><Trash2 className="h-4 w-4" /></span>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}
