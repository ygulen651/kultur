"use client";
import { useEffect, useState } from "react";
import ImageModal from "@/components/ImageModal";

interface Brosur {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  category: string;
  tags: string[];
  createdAt: string;
}

export default function PublicBrosurListPage() {
  const [brosurler, setBrosurler] = useState<Brosur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImageIndex(null);
  };

  useEffect(() => {
    async function loadBrosurler() {
      try {
        setLoading(true);
        setError("");
        
        let url = "/api/brosur";
        if (selectedCategory !== "all") {
          url += `?category=${encodeURIComponent(selectedCategory)}`;
        }
        
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        
        if (data.ok) {
          setBrosurler(data.items);
        } else {
          setError(data.error || "Broşürler yüklenemedi");
        }
      } catch (error) {
        console.error("Broşür yükleme hatası:", error);
        setError("Broşürler yüklenirken bir hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    loadBrosurler();
  }, [selectedCategory]);

  // Filtreleme
  const filteredBrosurler = brosurler.filter(brosur => {
    const matchesSearch = brosur.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (brosur.description && brosur.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         brosur.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  // Kategorileri al
  const categories = ["all", ...Array.from(new Set(brosurler.map(b => b.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Broşürler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Hata Oluştu</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-red-600 to-red-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm uppercase tracking-widest text-red-200 font-medium mb-4">• Broşürler</p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kültür Sanat İş Broşürleri
            </h1>
            <p className="text-xl text-red-100 max-w-3xl mx-auto leading-relaxed">
              Sendikamızın yayınları, bilgilendirme materyalleri ve tanıtım broşürleri. 
              Üyelerimiz için hazırlanan değerli kaynaklar.
            </p>
            <div className="mt-8 h-1 w-32 rounded bg-white mx-auto" />
          </div>
        </div>

        {/* Filtreler */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Arama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arama
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Broşür adı, açıklama veya etiket ara..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Kategori Filtresi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === "all" ? "Tüm Kategoriler" : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Broşür Listesi */}
          {!filteredBrosurler.length ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Broşür Bulunamadı
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm || selectedCategory !== "all" 
                  ? "Arama kriterlerinize uygun broşür bulunamadı. Farklı kelimeler deneyin."
                  : "Henüz broşür eklenmemiş. Sendikamızın yayınları yakında burada görünecek."
                }
              </p>
            </div>
          ) : (
            <>
              {/* Sonuç Sayısı */}
              <div className="mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{filteredBrosurler.length}</span> broşür bulundu
                  {searchTerm && ` "${searchTerm}" için`}
                  {selectedCategory !== "all" && ` "${selectedCategory}" kategorisinde`}
                </p>
              </div>

              {/* Broşür Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredBrosurler.map((brosur, index) => (
                  <div key={brosur._id} className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
                    {/* Broşür Görseli */}
                    <div 
                      className="relative aspect-[3/4] overflow-hidden cursor-pointer bg-gray-100"
                      onClick={() => openModal(index)}
                    >
                      <img 
                        src={brosur.imageUrl} 
                        alt={brosur.imageAlt || brosur.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.jpg'; // Fallback görsel
                        }}
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>

                      {/* Kategori Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {brosur.category}
                        </span>
                      </div>
                    </div>
                    
                    {/* Broşür Bilgileri */}
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {brosur.title}
                      </h3>
                      
                      {brosur.description && (
                        <p className="text-gray-600 text-base mb-4 line-clamp-3">
                          {brosur.description}
                        </p>
                      )}
                      
                      {/* Etiketler */}
                      {brosur.tags && brosur.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {brosur.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {brosur.tags.length > 3 && (
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs">
                              +{brosur.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Tarih */}
                      <div className="text-sm text-gray-500">
                        {new Date(brosur.createdAt).toLocaleDateString("tr-TR", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* İstatistikler */}
          {brosurler.length > 0 && (
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-8 bg-white rounded-full px-8 py-4 shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{brosurler.length}</div>
                  <div className="text-sm text-gray-600">Toplam Broşür</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {Array.from(new Set(brosurler.map(b => b.category))).length}
                  </div>
                  <div className="text-sm text-gray-600">Kategori</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {brosurler.filter(b => b.tags && b.tags.length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Etiketli</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && selectedImageIndex !== null && (
        <ImageModal
          images={filteredBrosurler.map(brosur => brosur.imageUrl).filter(Boolean)}
          initialIndex={selectedImageIndex}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </>
  );
}
