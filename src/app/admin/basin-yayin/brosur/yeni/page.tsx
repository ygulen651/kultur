"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BrosurYeni() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Genel",
    tags: "",
    isActive: true,
    order: 0
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form değişikliklerini handle et
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Görsel yükleme
  async function uploadToCloudinary(file: File) {
    try {
      console.log('Görsel yükleniyor:', file.name, file.size, file.type);
      
      const fd = new FormData();
      fd.append("file", file);
      
      const res = await fetch("/api/cloudinary/upload", { 
        method: "POST", 
        body: fd 
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Yükleme hatası: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      
      if (!data.ok || !data.url) {
        throw new Error(`Geçersiz yanıt: ${JSON.stringify(data)}`);
      }
      
      console.log('Görsel başarıyla yüklendi:', data.url);
      return data.url;
    } catch (error) {
      console.error("Görsel yükleme hatası:", error);
      throw new Error(`Görsel yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    }
  }

  // Form gönderimi
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setUploadProgress(0);
    
    try {
      if (!formData.title.trim() || !coverFile) {
        setError("Başlık ve görsel zorunlu.");
        return;
      }
      
      setUploadProgress(25);
      
      // 1. Görseli Cloudinary'ye yükle
      const imageUrl = await uploadToCloudinary(coverFile);
      setUploadProgress(75);
      
      // 2. Broşür verilerini hazırla
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        imageUrl: imageUrl,
        imageAlt: formData.title.trim(),
        category: formData.category.trim(),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        isActive: formData.isActive,
        order: parseInt(formData.order.toString()) || 0
      };

      console.log("Broşür verileri gönderiliyor:", payload);
      setUploadProgress(90);

      // 3. Broşürü veritabanına kaydet
      const res = await fetch("/api/brosur", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || "Broşür kaydedilemedi");
      }

      const data = await res.json();
      setUploadProgress(100);

      // Başarı: mesaj göster ve listeye git
      alert("Broşür başarıyla eklendi!");
      router.push("/admin/basin-yayin/brosur");
      
    } catch (err: any) {
      console.error("Form gönderim hatası:", err);
      setError(err?.message || "Broşür eklenirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  // Dosya seçimi
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
      if (!file.type.startsWith('image/')) {
        setError("Sadece resim dosyaları kabul edilir.");
        setCoverFile(null);
        return;
      }
      
      setCoverFile(file);
      setError("");
      console.log('Dosya seçildi:', file.name, file.size, file.type);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yeni Broşür Ekle</h1>
              <p className="mt-2 text-gray-600">Sendikamız için yeni bir broşür ekleyin</p>
            </div>
            <Link
              href="/admin/basin-yayin/brosur"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Geri Dön
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Başlık */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broşür Başlığı *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Örn: Sendika Üyelik Broşürü"
                required
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Broşür hakkında detaylı açıklama..."
              />
            </div>

            {/* Kategori ve Etiketler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="Genel">Genel</option>
                  <option value="Üyelik">Üyelik</option>
                  <option value="Haklar">Haklar</option>
                  <option value="Etkinlik">Etkinlik</option>
                  <option value="Bilgilendirme">Bilgilendirme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiketler
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Virgülle ayırarak yazın (örn: sendika, üyelik, haklar)"
                />
              </div>
            </div>

            {/* Sıralama ve Durum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sıralama
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Aktif (yayında göster)
                </label>
              </div>
            </div>

            {/* Görsel Yükleme */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Broşür Görseli *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-4 text-lg text-gray-600">
                    <span className="font-medium text-red-600 hover:text-red-500">Görsel seç</span> veya sürükle bırak
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG, JPEG dosyaları (max. 100MB)
                  </p>
                </label>
              </div>
              
              {coverFile && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-green-800 font-medium">
                        ✅ {coverFile.name}
                      </p>
                      <p className="text-green-600 text-sm mt-1">
                        Boyut: {(coverFile.size / 1024 / 1024).toFixed(2)} MB | Tür: {coverFile.type}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {loading && uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                İptal
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors ${
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
                    {uploadProgress < 100 ? 'Yükleniyor...' : 'Kaydediliyor...'}
                  </span>
                ) : (
                  'Broşürü Kaydet'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



