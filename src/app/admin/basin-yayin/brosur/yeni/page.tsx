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
        throw new Error(`Sunucudan geçersiz yanıt alındı: ${responseText.substring(0, 100)}...`);
      }
      
      console.log('API response data:', data);
      
      if (!data.url) {
        throw new Error("Upload başarılı ama URL döndürülmedi");
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
      
      if (!coverUrl) {
        setError("Görsel yüklenemedi. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }
      
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
        setError("Sunucudan geçersiz yanıt alındı. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data?.error || "Kayıt eklenemedi. Lütfen tekrar deneyin.");
        setLoading(false);
        return;
      }

      // başarı: mesaj göster ya da ilgili listeye git
      alert("Broşür başarıyla eklendi!");
      router.push("/admin/basin-yayin/brosur");
      
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err?.message || "Kayıt eklenirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError("Dosya boyutu çok büyük. Maksimum 100MB olmalı.");
        setCoverFile(null);
        return;
      }
      
      // Dosya türü kontrolü
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && 
          !file.type.includes('pdf') && !file.type.includes('document')) {
        setError("Sadece resim, video ve belge dosyaları kabul edilir.");
        setCoverFile(null);
        return;
      }
      
      setCoverFile(file);
      setError(""); // Önceki hataları temizle
      console.log('File selected:', file.name, file.size, file.type);
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
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
          {coverFile && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-700 text-sm font-medium">
                ✅ Seçilen dosya: {coverFile.name}
              </p>
              <p className="text-green-600 text-xs mt-1">
                Boyut: {(coverFile.size / 1024 / 1024).toFixed(2)} MB | Tür: {coverFile.type}
              </p>
            </div>
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
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Yükleniyor...
            </span>
          ) : (
            'Kaydet'
          )}
        </button>
      </form>
    </div>
  );
}



