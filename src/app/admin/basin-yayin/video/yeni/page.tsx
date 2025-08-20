"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VideoYeni() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadToCloudinary(file: File, folder: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload/video", {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Yükleme başarısız");
    return data.item?.secure_url || data.url || "";
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
      // 1. Videoyu Cloudinary'ye yükle
      const videoUrl = await uploadToCloudinary(videoFile, "sendika/videos");
      // 2. Video kaydını veritabanına yaz
      const res = await fetch("/api/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          videoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Kayıt eklenemedi");
      alert("Video başarıyla eklendi!");
      router.push("/admin/basin-yayin/video");
    } catch (err: any) {
      setError(err?.message || "Kayıt eklenemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Yeni Video Ekle</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Başlık *</label>
          <input
            className="border rounded p-2 w-full"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Video Dosyası *</label>
          <input
            type="file"
            accept="video/*"
            onChange={e => setVideoFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-red-600 text-white"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
