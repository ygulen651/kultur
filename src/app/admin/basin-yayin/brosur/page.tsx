"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Brosur {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  imageAlt?: string;
  category: string;
  tags: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function AdminBrosurListPage() {
  const router = useRouter();
  const [brosurler, setBrosurler] = useState<Brosur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    loadBrosurler();
  }, []);

  async function loadBrosurler() {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetch("/api/brosur", { cache: "no-store" });
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

  async function toggleBrosurStatus(brosurId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/brosur/${brosurId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        setBrosurler(prev => 
          prev.map(b => 
            b._id === brosurId 
              ? { ...b, isActive: !currentStatus }
              : b
          )
        );
      } else {
        alert("Durum güncellenemedi");
      }
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
      alert("Durum güncellenirken hata oluştu");
    }
  }

  async function deleteBrosur(brosurId: string) {
    if (!confirm("Bu broşürü silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      setDeleteLoading(brosurId);
      
      const res = await fetch(`/api/brosur/${brosurId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBrosurler(prev => prev.filter(b => b._id !== brosurId));
        alert("Broşür başarıyla silindi");
      } else {
        const data = await res.json();
        alert(data.error || "Broşür silinemedi");
      }
    } catch (error) {
      console.error("Broşür silme hatası:", error);
      alert("Broşür silinirken hata oluştu");
    } finally {
      setDeleteLoading(null);
    }
  }

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
            onClick={loadBrosurler} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Broşür Yönetimi</h1>
              <p className="mt-2 text-gray-600">Sendika broşürlerini yönetin ve düzenleyin</p>
            </div>
            <Link
              href="/admin/basin-yayin/brosur/yeni"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yeni Broşür Ekle
            </Link>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Toplam Broşür</p>
                <p className="text-2xl font-semibold text-gray-900">{brosurler.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aktif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {brosurler.filter(b => b.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pasif</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {brosurler.filter(b => !b.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kategoriler</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Array.from(new Set(brosurler.map(b => b.category))).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Broşür Listesi */}
        {!brosurler.length ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Henüz Broşür Eklenmemiş
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              İlk broşürünüzü ekleyerek başlayın. Sendika üyeleriniz için değerli bilgiler paylaşın.
            </p>
            <Link
              href="/admin/basin-yayin/brosur/yeni"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              İlk Broşürü Ekle
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Görsel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Başlık
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sıra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brosurler.map((brosur) => (
                    <tr key={brosur._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-16 w-12">
                          <img 
                            className="h-16 w-12 object-cover rounded-lg" 
                            src={brosur.imageUrl} 
                            alt={brosur.imageAlt || brosur.title}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {brosur.title}
                          </div>
                          {brosur.description && (
                            <div className="text-sm text-gray-500 truncate">
                              {brosur.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {brosur.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleBrosurStatus(brosur._id, brosur.isActive)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            brosur.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {brosur.isActive ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {brosur.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(brosur.createdAt).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/admin/basin-yayin/brosur/${brosur._id}/duzenle`}
                            className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50"
                          >
                            Düzenle
                          </Link>
                          <button
                            onClick={() => deleteBrosur(brosur._id)}
                            disabled={deleteLoading === brosur._id}
                            className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                          >
                            {deleteLoading === brosur._id ? 'Siliniyor...' : 'Sil'}
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
      </div>
    </div>
  );
}
