"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ImageModal from "@/components/ImageModal";

export default function AdminBrosurListPage() {
  const [brosurler, setBrosurler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImageIndex(null);
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Yeni ayrı broşür API'sini kullan
        const res = await fetch("/api/brosur", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.ok) setBrosurler(data.items);
        else setError(data.error || "Veriler yüklenemedi");
      } catch (e) {
        setError("Veriler yüklenemedi");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Bu broşürü silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/brosur/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setBrosurler(brosurler => brosurler.filter(b => b._id !== id));
      } else {
        alert(data.error || "Silinemedi");
      }
    } catch {
      alert("Silme işlemi başarısız oldu");
      }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Broşürler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Broşür Yönetimi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Sendika broşürlerini yönetin</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/basin-yayin/brosur/yeni" className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
            + Yeni Broşür
          </Link>
          <Link href="/admin/basin-yayin" className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors">
            ← Geri
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!loading && !error && brosurler.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Henüz Broşür Eklenmemiş
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
            İlk broşürünüzü eklemek için "Yeni Broşür" butonuna tıklayın.
          </p>
          <Link href="/admin/basin-yayin/brosur/yeni" className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors">
            + İlk Broşürü Ekle
          </Link>
        </div>
      )}

      {brosurler.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brosurler.map((item, index) => (
            <div key={item._id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
               {/* Broşür Görseli - Tam Boyut */}
               {item.imageUrl && (
                 <div 
                   className="relative aspect-[3/4] overflow-hidden cursor-pointer"
                   onClick={() => openModal(index)}
                 >
                   <img 
                     src={item.imageUrl} 
                     alt={item.title} 
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                     loading="lazy"
                   />
                   {/* Hover Overlay */}
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                     <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                       <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                       </svg>
                     </div>
                   </div>
                 </div>
               )}
              
              {/* Broşür Bilgileri */}
              <div className="p-6">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                    {item.summary}
                  </p>
                )}
                
                {/* Tarih Bilgisi */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString("tr-TR") : ""}
                </div>
                
                {/* Aksiyon Butonları */}
                <div className="flex gap-2">
                  <Link 
                    href={`/admin/basin-yayin/brosur/${item._id}/duzenle`} 
                    className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium text-center transition-colors"
                  >
                    Düzenle
                  </Link>
                  <button 
                    onClick={() => handleDelete(item._id)} 
                    className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Broşür İstatistikleri */}
      {brosurler.length > 0 && (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 bg-white dark:bg-gray-800 rounded-full px-8 py-4 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{brosurler.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Broşür</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {brosurler.filter(item => item.imageUrl).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Görseli Olan</div>
            </div>
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {brosurler.filter(item => item.summary).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Açıklamalı</div>
            </div>
          </div>
        </div>
      )}

      {selectedImageIndex !== null && (
        <ImageModal
          images={brosurler.map(item => item.imageUrl)}
          initialIndex={selectedImageIndex}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
