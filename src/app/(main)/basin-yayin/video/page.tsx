"use client";
import { useEffect, useState } from "react";

export default function PublicVideoListPage() {
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Videolar</h1>
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
            <div className="text-xs text-gray-500">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("tr-TR") : ""}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
