# 🌐 DNS Ayarları ve Domain Yönlendirme

## ❌ Mevcut Sorun
Site `www.kultursanatis.com.tr` adresine gidildiğinde eski hosting'e (cPanel) yönleniyor, Vercel'de açılmıyor.

## 🔍 Sorun Analizi
- **DNS A Record** eski hosting IP'sine işaret ediyor
- **CNAME Record** doğru ayarlanmamış
- **Vercel domain** henüz aktif değil

## 🚀 Çözüm Adımları

### 1. **Vercel Dashboard'da Domain Ekleme**
```
1. Vercel Dashboard → Settings → Domains
2. "Add Domain" → www.kultursanatis.com.tr
3. "Add Domain" → kultursanatis.com.tr
4. DNS ayarlarını not alın
```

### 2. **Hosting Sağlayıcıda DNS Ayarları**
Domain sağlayıcınızda (cPanel, Plesk, vb.) şu ayarları yapın:

#### A Record (Ana Domain)
```
Type: A
Name: @ (veya boş)
Value: 76.76.19.34
TTL: 3600 (1 saat)
```

#### CNAME Record (www)
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (1 saat)
```

#### CNAME Record (Ana Domain)
```
Type: CNAME
Name: @ (veya boş)
Value: cname.vercel-dns.com
TTL: 3600 (1 saat)
```

### 3. **Alternatif DNS Ayarları**
Eğer yukarıdaki çalışmazsa:

#### Vercel'in Önerdiği Ayarlar
```
Type: A
Name: @
Value: 76.76.19.34

Type: A
Name: www
Value: 76.76.19.34
```

## 📋 DNS Kontrol Komutları

### Local DNS Kontrolü
```bash
# DNS kontrol script'i
npm run check:dns

# Manuel kontrol
nslookup www.kultursanatis.com.tr
dig www.kultursanatis.com.tr
```

### Online DNS Kontrolü
- [whatsmydns.net](https://whatsmydns.net)
- [dnschecker.org](https://dnschecker.org)
- [mxtoolbox.com](https://mxtoolbox.com)

## ⏱️ DNS Yayılım Süresi
- **TTL 3600**: 1-2 saat
- **TTL 86400**: 24-48 saat
- **Önerilen**: TTL'yi 3600'e düşürün

## 🔧 Vercel Domain Ayarları

### Domain Ekleme
```
1. Vercel Dashboard → Settings → Domains
2. "Add Domain" butonuna tıklayın
3. Domain adını girin: www.kultursanatis.com.tr
4. "Add" butonuna tıklayın
5. DNS ayarlarını kontrol edin
```

### SSL Sertifikası
```
1. Domain eklendikten sonra SSL otomatik olarak aktif olur
2. "Provisioning" durumunu bekleyin
3. Genellikle 5-10 dakika sürer
```

## 🚨 Acil Durum Çözümleri

### 1. **Geçici Yönlendirme**
Eski hosting'de `.htaccess` dosyasına ekleyin:
```apache
RewriteEngine On
RewriteCond %{HTTP_HOST} ^(www\.)?kultursanatis\.com\.tr$ [NC]
RewriteRule ^(.*)$ https://kultur-9egzz60q6-yusuf7007.vercel.app/$1 [R=301,L]
```

### 2. **Vercel URL Kullanımı**
Geçici olarak şu URL'leri kullanın:
- `https://kultur-9egzz60q6-yusuf7007.vercel.app`
- `https://kultursanatis.vercel.app`

## 📞 Destek

### Vercel Support
- [Vercel Help](https://vercel.com/help)
- [Domain Configuration](https://vercel.com/docs/concepts/projects/domains)

### Hosting Sağlayıcı
- cPanel → DNS Zone Editor
- Plesk → DNS Settings
- DirectAdmin → DNS Management

## ✅ Kontrol Listesi

- [ ] Vercel'de domain eklendi
- [ ] A Record: 76.76.19.34
- [ ] CNAME: www → cname.vercel-dns.com
- [ ] DNS yayılımı tamamlandı (1-2 saat)
- [ ] SSL sertifikası aktif
- [ ] Site Vercel'de açılıyor

## 🎯 Sonraki Adımlar

1. **DNS ayarlarını yapın**
2. **1-2 saat bekleyin**
3. **Site'yi test edin**
4. **SSL sertifikasını kontrol edin**
5. **Monitoring ayarlayın**
