"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminVideoListPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/video", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.ok) setVideos(data.items);
        else setError(data.error || "Veriler yüklenemedi");
      } catch (e) {
        setError("Veriler yüklenemedi");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Bu videoyu silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/video/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setVideos(videos => videos.filter(v => v._id !== id));
      } else {
        alert(data.error || "Silinemedi");
      }
    } catch {
      alert("Silme işlemi başarısız oldu");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Videolar</h1>
        <Link href="/admin/basin-yayin/video/yeni" className="px-4 py-2 rounded bg-red-600 text-white">+ Yeni Video</Link>
      </div>
      {loading && <div>Yükleniyor...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && videos.length === 0 && (
        <div className="text-gray-500">Henüz video eklenmemiş.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">{item.title}</h3>
            {item.videoUrl && (
              <video src={item.videoUrl} controls className="w-full rounded-xl mb-2" />
            )}
            <div className="flex gap-2 mt-2">
              <Link href={`/admin/basin-yayin/video/${item._id}/duzenle`} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Düzenle</Link>
              <button onClick={() => handleDelete(item._id)} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Sil</button>
            </div>
            <div className="text-xs text-gray-500 mt-2">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("tr-TR") : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
