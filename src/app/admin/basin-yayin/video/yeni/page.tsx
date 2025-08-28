"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VideoYeni() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // YouTube URL'sinden video ID'sini çıkar
  function extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  // YouTube embed URL'si oluştur
  function createEmbedUrl(youtubeId: string): string {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!title.trim() || !youtubeUrl.trim()) {
        setError("Başlık ve YouTube URL'si zorunlu.");
        setLoading(false);
        return;
      }

      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        setError("Geçersiz YouTube URL'si. Lütfen doğru YouTube linkini girin.");
        setLoading(false);
        return;
      }

      const embedUrl = createEmbedUrl(videoId);
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      const payload = {
        title: title.trim(),
        videoUrl: embedUrl,
        thumbnailUrl: thumbnailUrl,
        youtubeId: videoId,
        originalUrl: youtubeUrl.trim(),
      };

      console.log("Sending video payload:", payload);

      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseText = await res.text();
      console.log("Raw response:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", responseText);
        setError("Sunucudan geçersiz yanıt alındı");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data?.error || "Video kaydedilemedi");
        setLoading(false);
        return;
      }

      alert("Video başarıyla eklendi!");
      router.push("/admin/basin-yayin/video");
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err?.message || "Video eklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Yeni Video Ekle
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          YouTube videolarını URL ile ekleyin ve sitede oynatın
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
            Video Başlığı *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="Video başlığını girin"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
            YouTube URL'si *
          </label>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            YouTube video sayfasından URL'yi kopyalayıp yapıştırın
          </p>
        </div>

        {youtubeUrl && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Video Önizlemesi:
            </h3>
            {extractYouTubeId(youtubeUrl) ? (
              <div className="aspect-video w-full">
                <iframe
                  src={createEmbedUrl(extractYouTubeId(youtubeUrl)!)}
                  title="Video önizleme"
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <p className="text-red-600 dark:text-red-400">
                Geçersiz YouTube URL'si
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Video Ekleniyor...
              </div>
            ) : (
              "Video Ekle"
            )}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/basin-yayin/video")}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
