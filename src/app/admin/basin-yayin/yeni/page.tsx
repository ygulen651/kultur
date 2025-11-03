"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminHaberYeni() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    summary: "",
    imageFile: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadToCloudinary(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || "Yükleme başarısız");
    return data.item?.secure_url || data.url || "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (!form.title.trim()) {
        setError("Başlık zorunlu.");
        setLoading(false);
        return;
      }
      
      let imageUrl = "";
      if (form.imageFile) {
        imageUrl = await uploadToCloudinary(form.imageFile);
      }
      
      const payload = {
        title: form.title,
        summary: form.summary,
        imageUrl: imageUrl,
      };

      console.log("BASIN FORM - Sending payload:", payload); // Debug log - BASIN FORM olduğunu belirt
      console.log("Current page:", window.location.pathname); // Hangi sayfada olduğumuzu göster

      const res = await fetch("/api/basin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      console.log("API response:", data); // Debug log

      if (!res.ok) {
        setError(data?.error || "Kayıt eklenemedi");
        if (data?.details) {
          console.error("Validation details:", data.details); // Debug log
        }
        return;
      }

      // başarı: mesaj göster ya da ilgili listeye git
      alert("Haber başarıyla eklendi!");
      router.push("/admin/basin-yayin");
      
    } catch (err: any) {
      console.error("Form error:", err); // Debug log
      setError(err?.message || "Kayıt eklenemedi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Yeni Haber Ekle</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Başlık *</label>
          <input
            className="border rounded p-2 w-full"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Özet</label>
          <textarea
            className="border rounded p-2 w-full"
            value={form.summary}
            onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Görsel (opsiyonel)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setForm(f => ({ ...f, imageFile: e.target.files?.[0] || null }))}
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
