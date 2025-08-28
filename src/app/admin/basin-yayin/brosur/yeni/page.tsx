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
      console.log('Starting Cloudinary upload for file:', file.name, file.size, file.type);
      
      const fd = new FormData();
      fd.append("file", file);
      
      console.log('FormData created, sending to API...');
      
      const res = await fetch("/api/cloudinary/upload", { 
        method: "POST", 
        body: fd 
      });
      
      console.log('API response status:', res.status);
      console.log('API response headers:', Object.fromEntries(res.headers.entries()));
      
      // Response text'ini al
      const responseText = await res.text();
      console.log('Raw response text:', responseText);
      
      if (!res.ok) {
        console.error("Upload error response:", responseText);
        throw new Error(`Upload failed: ${res.status} - ${responseText}`);
      }
      
      // JSON parse etmeye çalış
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", responseText);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      }
      
      console.log('API response data:', data);
      
      if (!data.ok) {
        throw new Error(data.error || "Upload failed");
      }
      
      console.log('Upload successful, URL:', data.url);
      return data.url || "";
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(`Görsel yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
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
      
      console.log('Form validation passed, starting upload...');
      console.log('File details:', coverFile.name, coverFile.size, coverFile.type);
      
      // 1. Görseli Cloudinary'ye yükle
      const coverUrl = await uploadToCloudinary(coverFile);
      
      console.log('Upload completed, coverUrl:', coverUrl);
      
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.size, file.type);
      setCoverFile(file);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Yeni Broşür Ekle</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Başlık *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Broşür başlığı"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kısa Metin
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Broşür açıklaması"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Görsel Dosya *
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          {coverFile && (
            <p className="mt-2 text-sm text-gray-600">
              Seçilen dosya: {coverFile.name} ({(coverFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Yükleniyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  );
}



