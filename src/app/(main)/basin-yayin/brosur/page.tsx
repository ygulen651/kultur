"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import ImageModal from "@/components/ImageModal";

export default function PublicBrosurListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    async function loadData() {
      try {
        // Yeni ayrı broşür API'sini kullan
        const res = await fetch("/api/brosur", { 
          cache: "no-store" 
        });
        const data = await res.json();
        if (data.ok) {
          setItems(data.items);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Broşürler yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-red-600 font-medium">• Broşürler</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Kültür Sanat İş Broşürleri
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sendikamızın yayınları, bilgilendirme materyalleri ve tanıtım broşürleri
          </p>
          <div className="mt-6 h-1 w-24 rounded bg-gradient-to-r from-red-600 to-red-800 mx-auto" />
        </header>

        {!items.length ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Henüz Broşür Eklenmemiş
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Broşürler yakında burada görünecek. Sendikamızın yayınları ve bilgilendirme materyalleri için takipte kalın.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item, index) => (
              <div key={item._id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700">
                {/* Broşür Görseli - Tam Boyut ve Tıklanabilir */}
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
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Broşür Bilgileri */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  {item.summary && (
                    <p className="text-gray-600 dark:text-gray-300 text-base mb-4 line-clamp-3">
                      {item.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("tr-TR") : ""}
                    </span>
                    <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">
                      Broşür
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Broşür İstatistikleri */}
        {items.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-8 bg-white dark:bg-gray-800 rounded-full px-8 py-4 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{items.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Broşür</div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {items.filter(item => item.imageUrl).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Görseli Olan</div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {items.filter(item => item.summary).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Açıklamalı</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal - Broşür Fotoğraflarını Büyütmek İçin */}
      {isModalOpen && selectedImageIndex !== null && (
        <ImageModal
          images={items.map(item => item.imageUrl).filter(Boolean)}
          initialIndex={selectedImageIndex}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}
