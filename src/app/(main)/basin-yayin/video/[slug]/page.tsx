"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function VideoDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Video slug'ı bulunamadı.");
      return;
    }

    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError("");
        console.log(`Video yükleniyor: /api/video?search=${slug}`);
        
        const res = await fetch(`/api/video?search=${encodeURIComponent(slug)}`, { cache: "no-store" });
        console.log("API response status for detail:", res.status);

        if (res.ok) {
          const data = await res.json();
          console.log("API response data for detail:", data);
          
          const foundVideo = data.items?.find((v: any) => v.slug === slug);
          if (foundVideo) {
            setVideo(foundVideo);
          } else {
            setError("Video bulunamadı.");
          }
        } else {
          const errorText = await res.text();
          console.error("API response error for detail:", errorText);
          setError(`Video yüklenirken hata oluştu: ${res.status}`);
        }
      } catch (err: any) {
        console.error("Video yükleme hatası:", err);
        setError(`Video yüklenirken bir hata oluştu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-lg">Video yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="text-red-500 text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">Hata Oluştu</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/basin-yayin/video" className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          ← Tüm Videolara Geri Dön
        </Link>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="text-gray-400 text-6xl mb-4">🎥</div>
        <h1 className="text-2xl font-bold text-gray-600 mb-4">Video Bulunamadı</h1>
        <p className="text-gray-500 mb-6">Aradığınız video bulunamadı veya kaldırılmış olabilir.</p>
        <Link href="/basin-yayin/video" className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
          ← Tüm Videolara Geri Dön
        </Link>
      </div>
    );
  }

  // YouTube URL'sinden video ID'sini çıkar
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    
    // YouTube embed URL'den ID çıkar
    if (url.includes('youtube.com/embed/')) {
      return url.split('youtube.com/embed/')[1]?.split('?')[0];
    }
    
    // Normal YouTube URL'den ID çıkar
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeVideoId(video.videoUrl || video.originalUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : null;

  console.log("Video data:", video);
  console.log("Video ID:", videoId);
  console.log("Embed URL:", embedUrl);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/basin-yayin/video" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tüm Videolara Geri Dön
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{video.title}</h1>
        
        {video.description && (
          <p className="text-lg text-gray-600 mb-6">{video.description}</p>
        )}
        
        {video.createdAt && (
          <div className="text-sm text-gray-500 mb-6">
            Yayın Tarihi: {new Date(video.createdAt).toLocaleDateString('tr-TR')}
          </div>
        )}
      </div>

      <div className="mb-8">
        {embedUrl ? (
          <div className="aspect-w-16 aspect-h-9 bg-black rounded-xl overflow-hidden shadow-2xl">
            <iframe
              className="w-full h-full"
              src={embedUrl}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">Video Oynatılamıyor</h3>
            <p className="text-red-600 mb-4">
              Video URL'si işlenemedi: {video.videoUrl || video.originalUrl || 'URL bulunamadı'}
            </p>
            <p className="text-sm text-red-500">
              Lütfen admin panelinden video URL'sini kontrol edin.
            </p>
          </div>
        )}
      </div>

      {video.thumbnailUrl && (
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 mb-2">Video Önizleme</p>
          <img 
            src={video.thumbnailUrl} 
            alt={video.title}
            className="max-w-md mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
