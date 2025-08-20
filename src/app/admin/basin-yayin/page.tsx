"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminBasinYayinListPage() {
  const [haberler, setHaberler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        // Yeni ayrı basın API'sini kullan
        const res = await fetch("/api/basin", { cache: "no-store" });
        const data = await res.json();
        if (res.ok && data.ok) setHaberler(data.items);
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
    if (!confirm("Bu haberi silmek istiyor musunuz?")) return;
    try {
      const res = await fetch(`/api/basin/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setHaberler(haberler => haberler.filter(h => h._id !== id));
      } else {
        alert(data.error || "Silinemedi");
      }
    } catch {
      alert("Silme işlemi başarısız oldu");
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Basın-Yayın Haberleri</h1>
        <div className="flex gap-2">
          <Link href="/admin/basin-yayin/yeni" className="px-4 py-2 rounded bg-red-600 text-white">+ Yeni Haber</Link>
          <Link href="/admin/basin-yayin/afis/yeni" className="px-4 py-2 rounded bg-blue-600 text-white">+ Yeni Afiş</Link>
          <Link href="/admin/basin-yayin/brosur/yeni" className="px-4 py-2 rounded bg-green-600 text-white">+ Yeni Broşür</Link>
          <Link href="/admin/basin-yayin/rapor/yeni" className="px-4 py-2 rounded bg-purple-600 text-white">+ Yeni Rapor</Link>
        </div>
      </div>
      
      {/* Kategori Navigasyonu */}
      <div className="flex gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <Link href="/admin/basin-yayin" className="px-4 py-2 rounded bg-red-100 text-red-800 font-medium">
          Basın Haberleri ({haberler.length})
        </Link>
        <Link href="/admin/basin-yayin/afis" className="px-4 py-2 rounded bg-blue-100 text-blue-800 font-medium">
          Afişler
        </Link>
        <Link href="/admin/basin-yayin/brosur" className="px-4 py-2 rounded bg-green-100 text-green-800 font-medium">
          Broşürler
        </Link>
      </div>

      {loading && <div>Yükleniyor...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && haberler.length === 0 && (
        <div className="text-gray-500">Henüz haber eklenmemiş.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {haberler.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow p-4">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover rounded mb-2" />
            )}
            <h3 className="font-semibold mb-2">{item.title}</h3>
            {item.summary && <div className="text-gray-700 text-sm mb-2">{item.summary}</div>}
            <div className="flex gap-2 mt-2">
              <Link href={`/admin/basin-yayin/${item._id}/duzenle`} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Düzenle</Link>
              <button onClick={() => handleDelete(item._id)} className="px-3 py-1 rounded bg-red-600 text-white text-sm">Sil</button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString("tr-TR") : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
