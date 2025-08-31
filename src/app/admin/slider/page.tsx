'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
import { getSliders } from '@/lib/data'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRef } from 'react';

interface Slider {
  _id: string
  title: string
  subtitle?: string
  description?: string
  imageFilename: string
  link?: string
  buttonText?: string
  buttonLink?: string
  order: number
  isActive: boolean
  backgroundColor?: string
  textColor?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export default function SliderYonetimiPage() {
  const router = useRouter()
  const [sliders, setSliders] = useState<Slider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    file: null as File | null,
    link: '',
    order: 0,
    isActive: true,
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  // Düzenleme için ek state
  const [editModal, setEditModal] = useState<{ open: boolean; slider: Slider | null }>({ open: false, slider: null });

  // Eksik loadSliders fonksiyonu
  const loadSliders = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sliders", { cache: "no-store" });
      if (!res.ok) throw new Error("API hatası: " + res.status);
      const data = await res.json();
      setSliders(Array.isArray(data.items) ? data.items : []);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSliders();
  }, []);

  const toggleSliderStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        setSliders(prev => prev.map(slider => 
          slider._id === id ? { ...slider, isActive: !currentStatus } : slider
        ))
      } else {
        alert('Durum değiştirilemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const deleteSlider = async (id: string) => {
    if (!confirm('Bu slider\'ı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSliders(prev => prev.filter(s => s._id !== id))
      } else {
        alert('Slider silinemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    }
  }

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const token = localStorage.getItem('auth-token')
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order: newOrder })
      })

      if (response.ok) {
        loadSliders() // Yeniden yükle
      }
    } catch (error) {
      console.error('Order update error:', error)
    }
  }

  // Slider oluşturma helper
  async function createSlider(form: { title: string; file?: File | null; link?: string; order?: number; isActive?: boolean }) {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        alert('Yetkilendirme gerekli')
        return
      }

      let imageUrl = "";
      if (form.file) {
        // FormData ile görsel yükle
        const formData = new FormData()
        formData.append('title', form.title)
        formData.append('subtitle', '')
        formData.append('description', '')
        formData.append('buttonText', '')
        formData.append('buttonLink', '')
        formData.append('order', String(form.order || 0))
        formData.append('isActive', String(form.isActive || true))
        formData.append('backgroundColor', '#000000')
        formData.append('textColor', '#ffffff')
        formData.append('image', form.file)

        console.log('📤 FormData ile slider oluşturuluyor...')

        const response = await fetch("/api/sliders", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.text()
          console.error('❌ Slider oluşturma hatası:', errorData)
          throw new Error(`Slider oluşturulamadı: ${response.status}`)
        }

        const data = await response.json()
        if (!data?.ok) {
          throw new Error(data?.error || 'Bilinmeyen hata')
        }

        console.log('✅ Slider başarıyla oluşturuldu:', data.item)
        await loadSliders()
        return data.item
      } else {
        // Sadece URL ile slider oluştur
        const jsonData = {
          title: form.title,
          subtitle: '',
          description: '',
          buttonText: '',
          buttonLink: '',
          order: Number(form.order || 0),
          isActive: form.isActive || true,
          backgroundColor: '#000000',
          textColor: '#ffffff',
          imageUrl: form.link || '' // link alanını imageUrl olarak kullan
        }

        console.log('📤 JSON ile slider oluşturuluyor...')

        const response = await fetch("/api/sliders", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(jsonData)
        })

        if (!response.ok) {
          const errorData = await response.text()
          console.error('❌ Slider oluşturma hatası:', errorData)
          throw new Error(`Slider oluşturulamadı: ${response.status}`)
        }

        const data = await response.json()
        if (!data?.ok) {
          throw new Error(data?.error || 'Bilinmeyen hata')
        }

        console.log('✅ Slider başarıyla oluşturuldu:', data.item)
        await loadSliders()
        return data.item
      }
    } catch (error) {
      console.error('❌ createSlider error:', error)
      alert(`Slider oluşturulamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
      throw error
    }
  }

  // Düzenleme fonksiyonu (yalın, sadece başlık ve link güncellenebilir örnek)
  async function updateSlider(id: string, updates: { title?: string; link?: string; order?: number; isActive?: boolean }) {
    const token = localStorage.getItem('auth-token');
    const res = await fetch(`/api/sliders/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Güncelleme başarısız');
    await loadSliders();
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setForm((prev) => ({ ...prev, file: files && files[0] ? files[0] : null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleAddSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.file) {
      setFormError('Başlık ve görsel zorunlu!');
      return;
    }
    setFormLoading(true);
    try {
      await createSlider(form);
      setShowModal(false);
      setForm({ title: '', file: null, link: '', order: 0, isActive: true });
    } catch (err: any) {
      setFormError(err?.message || String(err));
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Slider Yönetimi</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Yeni Slider Ekle
        </Button>
      </div>
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Slider Ekle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSlider} className="space-y-4">
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input id="title" name="title" value={form.title} onChange={handleFormChange} required />
            </div>
            <div>
              <Label>Görsel Yükle *</Label>
              <Input type="file" accept="image/*" name="file" onChange={handleFormChange} />
              {form.file && (
                <img src={URL.createObjectURL(form.file)} alt="Önizleme" className="w-32 h-20 object-cover mt-2 rounded" />
              )}
            </div>
            <div>
              <Label htmlFor="link">Link</Label>
              <Input id="link" name="link" value={form.link} onChange={handleFormChange} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="order">Sıra</Label>
              <Input id="order" name="order" type="number" value={form.order} onChange={handleFormChange} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isActive" name="isActive" checked={form.isActive} onCheckedChange={(v) => setForm(f => ({ ...f, isActive: v }))} />
              <Label htmlFor="isActive">Aktif mi?</Label>
            </div>
            {formError && <div className="text-red-600 text-sm">{formError}</div>}
            <DialogFooter>
              <Button type="submit" disabled={formLoading || uploading}>{formLoading ? 'Kaydediliyor...' : 'Kaydet'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Liste veya durumlar */}
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Slider'lar yükleniyor...</div>
      ) : error ? (
        <div className="p-8 text-center text-red-600">Hata: {error}</div>
      ) : sliders.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Henüz slider yok</div>
      ) : (
        <ul className="divide-y">
          {sliders.map((item) => {
            const thumb = item.imageFilename ? `/uploads/${item.imageFilename}` : null;
            return (
              <li key={item._id} className="flex items-center gap-4 py-2">
                {thumb ? <img src={thumb} className="w-24 h-16 object-cover rounded" /> : <div className="w-24 h-16 bg-slate-200 rounded" />}
                <span className="flex-1">{item.title}</span>
                <span className={item.isActive ? "text-green-600" : "text-red-600"}>{item.isActive ? "Aktif" : "Pasif"}</span>
                <Button variant="ghost" size="icon" onClick={() => setEditModal({ open: true, slider: item })} title="Düzenle">
                  <Edit className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteSlider(item._id)} title="Sil">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {/* Edit modalı (örnek, sadece başlık ve link güncellenebilir) */}
      <Dialog open={editModal.open} onOpenChange={open => setEditModal({ open, slider: open ? editModal.slider : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Slider Düzenle</DialogTitle>
          </DialogHeader>
          {editModal.slider && (
            <form
              onSubmit={async e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget as HTMLFormElement);
                await updateSlider(editModal.slider!._id, {
                  title: formData.get('title') as string,
                  link: formData.get('link') as string,
                });
                setEditModal({ open: false, slider: null });
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="edit-title">Başlık</Label>
                <Input id="edit-title" name="title" defaultValue={editModal.slider.title} required />
              </div>
              <div>
                <Label htmlFor="edit-link">Link</Label>
                <Input id="edit-link" name="link" defaultValue={editModal.slider.link} />
              </div>
              <DialogFooter>
                <Button type="submit">Kaydet</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
