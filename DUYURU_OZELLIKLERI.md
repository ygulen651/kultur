# Duyuru Sistemi Özellikleri

## Genel Bakış
Duyuru sistemi, sendika üyelerine ve ziyaretçilere önemli bilgileri iletmek için tasarlanmıştır. Sistem, zengin içerik desteği, görsel yönetimi ve dosya paylaşımı özellikleri sunar.

## Ana Özellikler

### 1. Duyuru Oluşturma ve Düzenleme
- **Başlık**: Duyuru başlığı (zorunlu)
- **Özet**: Kısa açıklama (zorunlu)
- **İçerik**: Detaylı içerik (HTML desteği ile)
- **Kategori**: Duyuru kategorisi seçimi
- **Etiketler**: Virgülle ayrılmış etiketler
- **Durum**: Taslak, Yayında, Arşiv
- **Yayın Tarihi**: Duyuru yayın tarihi
- **Öne Çıkan**: Öne çıkan duyuru olarak işaretleme

### 2. Görsel Yönetimi

#### Öne Çıkan Görsel
- URL ile görsel ekleme
- Dosya yükleme ile görsel ekleme
- Cloudinary entegrasyonu
- Yerel upload fallback desteği

#### Ek Görseller
- **Maksimum**: 8 adet ek görsel
- **Desteklenen formatlar**: JPG, PNG, GIF, WebP
- **Özellikler**:
  - Çoklu seçim
  - Önizleme
  - Kaldırma
  - Responsive grid görünümü

### 3. Dosya Yönetimi

#### Desteklenen Dosya Türleri
- **PDF**: Dokümanlar
- **Video**: MP4, AVI, MOV, WebM
- **Ses**: MP3, WAV, AAC
- **Görsel**: JPG, PNG, GIF
- **Office**: DOC, DOCX, XLS, XLSX, PPT, PPTX

#### Özellikler
- **Maksimum**: 5 adet dosya
- **Dosya boyutu**: Sunucu limitleri dahilinde
- **Güvenlik**: Dosya türü kontrolü
- **İndirme**: Ziyaretçiler için indirme linki

### 4. Kullanıcı Arayüzü

#### Admin Paneli
- **Duyuru Oluşturma**: Form tabanlı oluşturma
- **Düzenleme**: Mevcut duyuruları düzenleme
- **Görsel Yönetimi**: Sürükle-bırak görsel ekleme
- **Dosya Yönetimi**: Çoklu dosya yükleme
- **Önizleme**: Duyuru önizleme

#### Ziyaretçi Arayüzü
- **Duyuru Listesi**: Grid görünümü
- **Detay Sayfası**: Tam içerik görüntüleme
- **Görsel Galerisi**: Lightbox ile görsel görüntüleme
- **Dosya İndirme**: Güvenli dosya indirme
- **Responsive Tasarım**: Mobil uyumlu

### 5. Teknik Özellikler

#### Veritabanı
- **Model**: Mongoose Schema
- **Alanlar**: Tüm duyuru bilgileri
- **İndeksler**: Performans optimizasyonu
- **İlişkiler**: Kategori ve etiket desteği

#### API Endpoints
- **GET /api/announcements**: Duyuru listesi
- **POST /api/announcements**: Yeni duyuru
- **PUT /api/announcements/[id]**: Duyuru güncelleme
- **DELETE /api/announcements/[id]**: Duyuru silme

#### Upload Sistemi
- **Cloudinary**: Ana görsel servisi
- **Yerel Upload**: Fallback sistem
- **Güvenlik**: Dosya türü ve boyut kontrolü
- **Optimizasyon**: Görsel sıkıştırma

## Kullanım Örnekleri

### 1. Yeni Duyuru Oluşturma
```javascript
// Admin panelinde duyuru oluşturma
const newAnnouncement = {
  title: "Yeni Toplu Sözleşme",
  excerpt: "2024 yılı toplu sözleşme görüşmeleri başladı",
  content: "<h2>Detaylar</h2><p>Görüşme detayları...</p>",
  category: "toplu-sozlesme",
  tags: ["sözleşme", "2024", "görüşme"],
  status: "published",
  featured: true,
  images: ["url1", "url2"],
  files: [{ name: "sozlesme.pdf", url: "url", type: "pdf" }]
};
```

### 2. Görsel Ekleme
```javascript
// Çoklu görsel yükleme
const handleImagesUpload = async (files) => {
  const uploadedUrls = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/cloudinary/upload", {
      method: "POST",
      body: formData
    });
    const result = await response.json();
    if (result.ok) {
      uploadedUrls.push(result.url);
    }
  }
  return uploadedUrls;
};
```

### 3. Dosya Ekleme
```javascript
// Dosya yükleme
const handleFilesUpload = async (files) => {
  const uploadedFiles = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    const result = await response.json();
    if (result.ok) {
      uploadedFiles.push({
        name: file.name,
        url: result.url,
        type: file.type,
        size: file.size
      });
    }
  }
  return uploadedFiles;
};
```

## Güvenlik Önlemleri

### 1. Dosya Güvenliği
- Dosya türü kontrolü
- Dosya boyutu limiti
- Güvenli dosya adlandırma
- Upload dizini izolasyonu

### 2. Yetkilendirme
- Admin token kontrolü
- API endpoint koruması
- Kullanıcı rol kontrolü

### 3. Veri Doğrulama
- Input sanitization
- HTML içerik kontrolü
- XSS koruması

## Performans Optimizasyonları

### 1. Görsel Optimizasyonu
- Lazy loading
- Responsive images
- WebP format desteği
- CDN kullanımı

### 2. Veritabanı
- İndeksleme
- Sorgu optimizasyonu
- Connection pooling

### 3. Caching
- API response caching
- Görsel caching
- CDN caching

## Gelecek Geliştirmeler

### 1. Planlanan Özellikler
- **Bildirim Sistemi**: Email ve push bildirimleri
- **Analytics**: Duyuru görüntüleme istatistikleri
- **SEO**: Gelişmiş SEO optimizasyonu
- **Çoklu Dil**: İngilizce desteği

### 2. Teknik İyileştirmeler
- **Real-time**: WebSocket entegrasyonu
- **Search**: Elasticsearch entegrasyonu
- **CDN**: Gelişmiş CDN yapılandırması
- **Monitoring**: APM ve loglama

## Sorun Giderme

### 1. Yaygın Sorunlar
- **Görsel yüklenmiyor**: Cloudinary API key kontrolü
- **Dosya yüklenmiyor**: Upload dizini izinleri
- **API hatası**: Token süresi kontrolü

### 2. Log Kontrolü
```bash
# API logları
tail -f logs/api.log

# Upload logları
tail -f logs/upload.log

# Veritabanı logları
tail -f logs/db.log
```

## Destek

Herhangi bir sorun yaşadığınızda:
1. Log dosyalarını kontrol edin
2. API endpoint'lerini test edin
3. Veritabanı bağlantısını kontrol edin
4. Geliştirici ekibi ile iletişime geçin

---

**Son Güncelleme**: 2024
**Versiyon**: 2.0.0
**Geliştirici**: Kültür Sanat İş Sendikası
