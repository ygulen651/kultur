"use client";

import { useEffect, useState } from "react";

type Item = {
  _id: string;
  type: "image" | "video";
  url: string;
  publicId?: string;
  title?: string;
  alt?: string;
  category?: string;
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Galeri Yönetimi</h1>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <button
          onClick={onUpload}
          disabled={!file || loading}
          className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "Yükle"}
        </button>
        {err && <span className="text-red-600">{err}</span>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it._id} className="border rounded p-2 space-y-2">
            {it.type === "image" ? (
              <img src={it.url} className="w-full h-40 object-cover rounded" />
            ) : (
              <video src={it.url} className="w-full h-40 object-cover rounded" controls />
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm truncate">{it.title || it.publicId || it._id}</span>
              <button
                onClick={() => onDelete(it._id)}
                className="text-sm text-white bg-gray-800 px-2 py-1 rounded"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>

      {!items.length && <div className="text-gray-500">Henüz medya yüklenmemiş.</div>}
    </div>
  );
}
