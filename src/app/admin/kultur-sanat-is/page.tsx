"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Post {
  _id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  featured: boolean;
  publishAt?: string;
  createdAt: string;
  attachmentPdf?: {
    filename: string;
  };
}

export default function KulturSanatIsAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/kultur-sanat-is");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("İçerikler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(id: string) {
    if (!confirm("Bu içeriği silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/kultur-sanat-is/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("İçerik başarıyla silindi!");
        fetchPosts(); // Listeyi yenile
      } else {
        const error = await res.json();
        alert("Silme hatası: " + (error.message || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silme sırasında hata oluştu");
    }
  }

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Kültür Sanat-İş İçerikleri</h1>
        <Link 
          href="/admin/kultur-sanat-is/yeni" 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Yeni İçerik
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Henüz içerik bulunmuyor. İlk içeriği oluşturmak için "Yeni İçerik" butonuna tıklayın.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Yazar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PDF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.title}</div>
                    <div className="text-sm text-gray-500">{post.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {post.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {post.attachmentPdf ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ PDF
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {post.featured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                        Öne Çıkan
                      </span>
                    )}
                    {post.publishAt ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Yayında
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Taslak
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/kultur-sanat-is/${post.slug}/duzenle`}
                        className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-300 hover:border-blue-500"
                      >
                        Düzenle
                      </Link>
                      <button
                        onClick={() => deletePost(post._id)}
                        className="text-red-600 hover:text-red-900 px-2 py-1 rounded border border-red-300 hover:border-red-500"
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
