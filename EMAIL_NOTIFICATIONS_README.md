# E-posta Bildirimleri Sistemi

Bu dokümantasyon, Kültür Sanat İş web sitesi için geliştirilen e-posta bildirimleri sistemini açıklamaktadır.

## Özellikler

### 1. Admin Panel Entegrasyonu
- **Ana Bildirimler Sayfası**: `/admin/bildirimler`
  - Tüm bildirim türlerini görüntüleme
  - E-posta bildirimleri için özel sekme
  - E-posta bildirimleri istatistikleri
  
- **E-posta Bildirimleri Sayfası**: `/admin/bildirimler/email`
  - Sadece e-posta bildirimlerini yönetme
  - Detaylı e-posta özellikleri
  - E-posta şablonları desteği

### 2. E-posta Bildirimi Özellikleri
- **Temel Bilgiler**:
  - Başlık ve mesaj
  - E-posta konusu
  - Alıcı listesi (virgülle ayrılmış)
  
- **Gelişmiş Özellikler**:
  - Bildirim tipi (bilgi, başarı, uyarı, hata)
  - Öncelik seviyesi (düşük, normal, yüksek, acil)
  - Zamanlama (hemen gönder veya zamanla)
  - E-posta şablonu desteği
  - Ek dosya ekleme imkanı

### 3. Durum Takibi
- **Bildirim Durumları**:
  - `draft`: Taslak
  - `scheduled`: Zamanlandı
  - `sent`: Gönderildi
  - `failed`: Başarısız

- **İstatistikler**:
  - Toplam alıcı sayısı
  - Açılma oranı
  - Tıklama sayısı
  - Gönderim zamanı

## Teknik Detaylar

### Veritabanı Modeli
```typescript
interface IEmailNotification {
  title: string
  message: string
  emailSubject: string
  emailRecipients: string[]
  type: 'info' | 'success' | 'warning' | 'error'
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  recipients: number
  opened: number
  clicked: number
  scheduledFor?: Date
  sentAt?: Date
  failedAt?: Date
  createdAt: Date
  createdBy: string
  template?: string
  attachments?: string[]
  metadata?: Record<string, any>
}
```

### API Endpoints
- **GET** `/api/admin/email-notifications` - E-posta bildirimlerini listele
- **POST** `/api/admin/email-notifications` - Yeni e-posta bildirimi oluştur

### Kullanım Örnekleri

#### 1. Yeni E-posta Bildirimi Oluşturma
```javascript
const notification = {
  title: 'Yeni Etkinlik Duyurusu',
  message: 'Yarın saat 14:00\'te genel kurul toplantısı yapılacaktır.',
  emailSubject: 'Genel Kurul Toplantısı Duyurusu',
  emailRecipients: 'admin@kultursanatis.org, uyeler@kultursanatis.org',
  type: 'info',
  priority: 'normal',
  scheduledFor: '2024-01-09T18:00:00Z' // İsteğe bağlı
}
```

#### 2. E-posta Bildirimlerini Filtreleme
```javascript
// Sadece gönderilmiş bildirimler
GET /api/admin/email-notifications?status=sent

// Belirli tipteki bildirimler
GET /api/admin/email-notifications?type=warning

// Sayfalama
GET /api/admin/email-notifications?page=1&limit=20
```

## Kurulum ve Çalıştırma

### 1. Gerekli Paketler
```bash
npm install mongodb mongoose next-auth
```

### 2. Veritabanı Bağlantısı
`.env.local` dosyasında MongoDB URI'yi tanımlayın:
```
MONGODB_URI=mongodb://localhost:27017/kultur-sanat-is
```

### 3. Örnek Verileri Ekleme
```bash
node scripts/add-email-notifications.js
```

### 4. Uygulamayı Başlatma
```bash
npm run dev
```

## Özellik Geliştirme

### Gelecek Özellikler
- [ ] E-posta şablon editörü
- [ ] Toplu e-posta gönderimi
- [ ] E-posta listesi yönetimi
- [ ] Otomatik e-posta gönderimi (cron jobs)
- [ ] E-posta açılma ve tıklama takibi
- [ ] A/B testi desteği

### Entegrasyon Önerileri
- **E-posta Servisleri**: SendGrid, Mailgun, AWS SES
- **Şablon Motorları**: Handlebars, EJS, MJML
- **Kuyruk Sistemi**: Redis, Bull, Agenda
- **Analitik**: Google Analytics, Mixpanel

## Güvenlik

### Yetkilendirme
- Sadece admin kullanıcılar e-posta bildirimleri oluşturabilir
- JWT token tabanlı kimlik doğrulama
- Rate limiting uygulanmalı

### Veri Doğrulama
- E-posta adresi formatı kontrolü
- XSS koruması
- SQL injection koruması

## Destek

Herhangi bir sorun veya öneri için:
- **E-posta**: admin@kultursanatis.org
- **Dokümantasyon**: Bu README dosyası
- **Kod**: GitHub repository

---

*Son güncelleme: 8 Ocak 2024*
