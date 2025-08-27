"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AfisYeni() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadToCloudinary(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/cloudinary/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Yükleme başarısız");
    return data.url || "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (!title.trim() || !coverFile) {
        setError("Başlık ve görsel zorunlu.");
        setLoading(false);
        return;
      }
      
      // 1. Görseli Cloudinary'ye yükle
      const coverUrl = await uploadToCloudinary(coverFile);
      
      // 2. Afiş kaydını veritabanına yaz
      const formData = new FormData();
      formData.append('title', title);
      formData.append('summary', summary);
      formData.append('imageUrl', coverUrl);

      console.log("AFIŞ FORM - Sending FormData:", { title, summary, imageUrl: coverUrl });

      const res = await fetch("/api/afis", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Kayıt eklenemedi");
        return;
      }

      // başarı: mesaj göster ya da ilgili listeye git
      alert("Afiş başarıyla eklendi!");
      router.push("/admin/basin-yayin/afis");
      
    } catch (err: any) {
      setError(err?.message || "Kayıt eklenemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Yeni Afiş Ekle</h1>
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
          <label className="block font-medium mb-1">Kısa Metin</label>
          <textarea
            className="border rounded p-2 w-full"
            value={summary}
            onChange={e => setSummary(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Görsel Dosya *</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setCoverFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
