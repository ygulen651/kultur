"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BrosurYeni() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadToCloudinary(file: File) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cloudinary/upload", { method: "POST", body: fd });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Upload error response:", errorText);
        throw new Error("Yükleme başarısız");
      }
      
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Yükleme başarısız");
      
      return data.url || "";
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error("Görsel yüklenirken hata oluştu");
    }
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
      
      // 2. Broşür kaydını veritabanına yaz
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        imageUrl: coverUrl,
      };

      console.log("Sending payload:", payload);

      const res = await fetch("/api/brosur", {
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
        setError(data?.error || "Kayıt eklenemedi");
        setLoading(false);
        return;
      }

      // başarı: mesaj göster ya da ilgili listeye git
      alert("Broşür başarıyla eklendi!");
      router.push("/admin/basin-yayin/brosur");
      
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err?.message || "Kayıt eklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Yeni Broşür Ekle</h1>
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
            rows={3}
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
          {coverFile && (
            <p className="text-sm text-gray-600 mt-1">
              Seçilen dosya: {coverFile.name}
            </p>
          )}
        </div>
        {error && (
          <div className="text-red-600 font-semibold p-3 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-50 hover:bg-red-700 transition-colors"
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}



