"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VideoYeni() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadToCloudinary(file: File) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      
      console.log("Uploading video file:", file.name, file.size, file.type);
      
      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: fd,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Upload error response:", errorText);
        throw new Error("Video yükleme başarısız");
      }
      
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Video yükleme başarısız");
      
      console.log("Upload successful:", data);
      return data.url || "";
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Video yüklenirken hata oluştu");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (!title.trim() || !videoFile) {
        setError("Başlık ve video dosyası zorunlu.");
        setLoading(false);
        return;
      }
      
      // Dosya boyutu kontrolü (100MB limit)
      if (videoFile.size > 100 * 1024 * 1024) {
        setError("Video dosyası 100MB'dan büyük olamaz.");
        setLoading(false);
        return;
      }
      
      // 1. Videoyu Cloudinary'ye yükle
      const videoUrl = await uploadToCloudinary(videoFile);
      
      // 2. Video kaydını veritabanına yaz
      const payload = {
        title: title.trim(),
        videoUrl,
      };

      console.log("Sending video payload:", payload);

      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Önce response text'ini al
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Yeni Video Ekle</h1>
        <p className="text-gray-600 dark:text-gray-400">Sendika videolarını yükleyin ve yönetin</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
            Başlık *
          </label>
          <input
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Video başlığını girin"
            required
          />
        </div>
        
        <div>
          <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
            Video Dosyası *
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={e => setVideoFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
          {videoFile && (
            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Seçilen dosya:</strong> {videoFile.name}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Boyut: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Desteklenen formatlar: MP4, AVI, MOV, WMV. Maksimum boyut: 100MB
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="text-red-700 dark:text-red-300 font-medium">
              {error}
            </div>
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
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Yükleniyor...
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
