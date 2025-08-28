"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminVideoListPage() {
  const [videolar, setVideolar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideolar = async () => {
      try {
        const res = await fetch("/api/video", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setVideolar(data.items || []);
        } else {
          setError("Videolar yüklenemedi");
        }
      } catch (err) {
        console.error("Video fetch error:", err);
        setError("Videolar yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    fetchVideolar();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Video Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            YouTube videolarını yönetin ve sitede oynatın
          </p>
        </div>
        <Link
          href="/admin/basin-yayin/video/yeni"
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          + Yeni Video Ekle
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
        </div>
      )}

      {!loading && !error && videolar.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Henüz video eklenmemiş
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            İlk YouTube video URL'sini ekleyerek başlayın
          </p>
          <Link
            href="/admin/basin-yayin/video/yeni"
            className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            + İlk Video Ekle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videolar.map((video) => (
            <div key={video._id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
              {/* Video Thumbnail */}
              {video.thumbnailUrl && (
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {video.title}
                </h3>
                
                {video.youtubeId && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube Video
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>
                    {video.createdAt ? new Date(video.createdAt).toLocaleDateString('tr-TR') : 'Tarih yok'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    video.status === 'published' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {video.status === 'published' ? 'Yayında' : 'Taslak'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/basin-yayin/video/${video.slug}`}
                    target="_blank"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
                  >
                    Görüntüle
                  </Link>
                  <Link
                    href={`/admin/basin-yayin/video/${video._id}/duzenle`}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Düzenle
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Statistics */}
      {videolar.length > 0 && (
        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Video İstatistikleri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{videolar.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Toplam Video</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {videolar.filter(v => v.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Yayında</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {videolar.filter(v => v.youtubeId).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">YouTube</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
