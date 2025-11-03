"use client";
import { useState, useEffect } from "react";
import ImageModal from "@/components/ImageModal";

type GalleryItem = {
  _id: string;
  url: string;
  src: string;
  filename: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string | Date;
};

export default function GaleriPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImageIndex(null);
  };

  // Client-side'da veri çekme
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch("/api/gallery/items", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data?.items) ? data.items : [];
          setItems(items.map((it: any) => ({
            _id: String(it._id ?? crypto.randomUUID()),
            url: it.url ?? it.src ?? "",
            src: it.src ?? it.url ?? "",
            filename: it.filename ?? "galeri",
            width: Number(it.width ?? 0),
            height: Number(it.height ?? 0),
            format: it.format ?? "image",
            bytes: Number(it.bytes ?? 0),
            createdAt: it.createdAt ?? new Date(),
          })));
        }
      } catch (err) {
        console.error("Gallery fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="text-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Galeri yükleniyor...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-10">
        {/* Hero Section */}
        <header className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-red-600 font-medium">• Galeri</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Kültür Sanat İş Galerisi
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Sendikamızın etkinliklerinden, toplantılarından ve faaliyetlerinden unutulmaz anlar
          </p>

          <div className="mt-6 h-1 w-24 rounded bg-gradient-to-r from-red-600 to-red-800 mx-auto" />
        </header>

        {/* Galeri İçeriği */}
        {!items.length ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6l.586-.586a2 2 0 012.828 0L20 8m-6-6l-.586.586a2 2 0 00-2.828 0L8 2m-6 6l.586.586a2 2 0 002.828 0L2 8m6 6l-.586.586a2 2 0 00-2.828 0L2 14m6 6l.586.586a2 2 0 002.828 0L14 20m6-6l.586.586a2 2 0 002.828 0L20 14m-6 6l.586.586a2 2 0 002.828 0L14 20" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Galeri Henüz Boş
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Galeriye fotoğraf ve video eklemek için yönetim panelini kullanın. 
              Etkinliklerden kareler yakında burada görünecek.
            </p>
          </div>
        ) : (
          <>
            {/* Galeri Grid */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {items.map((it, index) => {
                const src = it.url || it.src || "";
                const alt = it.filename || "galeri görseli";
                return (
                  <div
                    key={it._id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 cursor-pointer"
                    onClick={() => openModal(index)}
                  >
                    {/* Görsel */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={src}
                        alt={alt}
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
                    
                    {/* Alt Bilgi */}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-2 mb-3">
                        {alt}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{it.width} × {it.height}</span>
                        <span className="font-medium">{it.createdAt ? new Date(it.createdAt).toLocaleDateString('tr-TR') : ''}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Galeri İstatistikleri */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-8 bg-white dark:bg-gray-800 rounded-full px-8 py-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{items.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Görsel</div>
                </div>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {items.filter(item => item.format === 'video').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Video</div>
                </div>
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {items.filter(item => item.format === 'image').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Fotoğraf</div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Image Modal */}
      {isModalOpen && selectedImageIndex !== null && (
        <ImageModal
          images={items.map(item => item.url || item.src).filter(Boolean)}
          initialIndex={selectedImageIndex}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}
