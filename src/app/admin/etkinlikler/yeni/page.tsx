"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CloudinaryResp = {
  url?: string;
  secure_url?: string;
  public_id?: string;
  original_filename?: string;
};

export default function AdminNewEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [startAt, setStartAt] = useState<string>("");
  const [endAt, setEndAt] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [publishedAt, setPublishedAt] = useState<string>("");

  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      // Projendeki mevcut Cloudinary route:
      const res = await fetch("/api/cloudinary/upload", { method: "POST", body: fd });
      const data: any = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url && !data?.secure_url) {
        const msg = data?.error || `UPLOAD_HTTP_${res.status}`;
        throw new Error(msg);
      }
      const url = (data as CloudinaryResp).secure_url || (data as CloudinaryResp).url || "";
      setImageUrl(url);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) return setError("Başlık zorunlu.");
    if (!startAt)     return setError("Başlangıç tarihi zorunlu.");

    setSaving(true);
    try {
      const payload = {
        title,
        excerpt,
        content,
        location,
        startAt,                     // ISO string kabul ediyoruz; API Date'e çeviriyor
        endAt: endAt || undefined,
        publishedAt: publishedAt || undefined,
        isFeatured,
        image: { url: imageUrl || "" },
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data: any = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        const msg = data?.error || `HTTP_${res.status}`;
        throw new Error(msg);
      }

      // başarı → listeye dön
      router.push("/admin/etkinlikler");
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Yeni Etkinlik</h1>

      {error && (
        <div className="rounded border border-red-300 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Başlık *</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Etkinlik başlığı"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Başlangıç *</label>
            <input
              type="datetime-local"
              className="w-full rounded border px-3 py-2"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Bitiş</label>
            <input
              type="datetime-local"
              className="w-full rounded border px-3 py-2"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Yayın Tarihi</label>
          <input
            type="date"
            className="w-full rounded border px-3 py-2"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Konum</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="İl/İlçe veya mekan"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Özet</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Kısa açıklama"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">İçerik</label>
          <textarea
            className="w-full rounded border px-3 py-2 min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Detaylı açıklama"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="isFeatured"
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          <label htmlFor="isFeatured" className="select-none">Öne çıkan</label>
        </div>

        <div className="space-y-2">
          <label className="block mb-1 font-medium">Görsel</label>
          <input type="file" accept="image/*" onChange={onUploadFile} />
          {uploading && <div className="text-sm text-gray-500">Yükleniyor…</div>}
          {imageUrl && (
            <div className="text-sm">
              <span className="text-green-700">Yüklendi:</span> {imageUrl}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-60"
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
