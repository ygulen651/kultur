"use client";

import { useEffect, useState } from "react";

type Item = {
  _id: string;
  url: string;
  src: string;
  filename: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Galeri kayıtlarını yükle
  async function load() {
    setErr(null);
    const res = await fetch("/api/gallery/items", { cache: "no-store" });
    const data = await res.json();
    if (!data.ok) {
      setErr(data.error || "Liste alınamadı");
      return;
    }
    setItems(data.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  // Dosya yükleme fonksiyonu
  async function onUpload() {
    if (!file) return;
    setLoading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/gallery/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Yükleme başarısız");
      await load();
      setFile(null);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Silme fonksiyonu
  async function onDelete(id: string) {
    if (!confirm("Silinsin mi?")) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/gallery/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Silme başarısız");
      await load();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Galeri Yönetimi
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fotoğraf ve video ekleyerek galeriyi zenginleştirin
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border">
        <h2 className="text-lg font-semibold mb-4">Yeni Medya Ekle</h2>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            onClick={onUpload}
            disabled={!file || loading}
            className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Yükleniyor..." : "Yükle"}
          </button>
        </div>
        {err && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <span className="text-red-600 dark:text-red-400">{err}</span>
          </div>
        )}
        {file && (
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <span className="text-blue-600 dark:text-blue-400">
              Seçilen dosya: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border">
        <h2 className="text-lg font-semibold mb-4">Mevcut Medya ({items.length})</h2>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6l.586-.586a2 2 0 012.828 0L20 8m-6-6l-.586.586a2 2 0 00-2.828 0L8 2m-6 6l.586.586a2 2 0 002.828 0L2 8m6 6l-.586.586a2 2 0 00-2.828 0L2 14m6 6l.586.586a2 2 0 002.828 0L14 20m6-6l.586.586a2 2 0 002.828 0L20 14m-6 6l.586.586a2 2 0 002.828 0L14 20" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Henüz medya yüklenmemiş
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              İlk fotoğraf veya videoyu yükleyerek galeriyi başlatın
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((it) => (
              <div key={it._id} className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border">
                {/* Media Preview */}
                <div className="relative aspect-square overflow-hidden">
                  {it.format === "video" ? (
                    <video src={it.url} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={it.url} alt={it.filename} className="w-full h-full object-cover" />
                  )}
                  {/* Format Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 text-xs font-medium bg-black/70 text-white rounded-full">
                      {it.format.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {/* Media Info */}
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                      {it.filename}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{it.width} × {it.height}</span>
                      <span>{(it.bytes / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(it.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => onDelete(it._id)}
                      className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
