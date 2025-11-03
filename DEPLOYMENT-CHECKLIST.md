# 🚀 Production Deployment Checklist

## ✅ Önceden Tamamlananlar

- [x] Çoklu next.config dosyaları temizlendi
- [x] Path alias çözümleme düzeltildi (`@/components/` sorunu çözüldü)
- [x] Next.js 15 uyumluluğu sağlandı
- [x] Webpack alias ayarları eklendi
- [x] TypeScript konfigürasyonu optimize edildi
- [x] Site domain adresleri güncellendi

## 🔧 Konfigürasyon Dosyaları

### next.config.ts ✅
- `output: 'standalone'` (Vercel için)
- Domain ayarları: `www.kultursanatis.com.tr`, `kultursanatis.com.tr`
- Webpack alias: `@` → `src/`

### tsconfig.json ✅
- Path mapping: `@/*` → `src/*`
- Next.js 15 uyumlu ayarlar

### jsconfig.json ✅
- Path alias desteği

### vercel.json ✅
- Build komutları
- Environment variables
- Domain ayarları

## 🌐 Domain Konfigürasyonu

**Production URLs:**
- `NEXT_PUBLIC_SITE_URL=https://www.kultursanatis.com.tr`
- `NEXT_PUBLIC_API_URL=https://www.kultursanatis.com.tr`
- `NEXTAUTH_URL=https://www.kultursanatis.com.tr`

**Image Domains:**
- `res.cloudinary.com`
- `www.kultursanatis.com.tr`
- `kultursanatis.com.tr`

## 📋 Deployment Öncesi Kontrol

### 1. Local Build Test
```bash
npm run build
```

### 2. Environment Variables
Vercel dashboard'da şunları kontrol edin:
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_SITE_URL=https://www.kultursanatis.com.tr`
- [ ] `NEXT_PUBLIC_API_URL=https://www.kultursanatis.com.tr`
- [ ] `NEXTAUTH_URL=https://www.kultursanatis.com.tr`

### 3. Import Kontrolü
Aşağıdaki import'lar çalışıyor olmalı:
- [ ] `@/components/AnnouncementCard`
- [ ] `@/components/ui/button`
- [ ] `@/components/ui/input`
- [ ] `@/components/ui/textarea`
- [ ] `@/components/ui/label`

## 🚀 Deployment Komutları

### Manuel Deployment
```bash
# 1. Build test
npm run build

# 2. Vercel deploy
vercel --prod
```

### Script ile Deployment
```bash
# Vercel token'ı ayarlayın
export VERCEL_TOKEN="your_token_here"

# Deployment script'ini çalıştırın
node scripts/deploy-vercel-fixed.js
```

## 🔍 Sorun Giderme

### Build Hatası
```
Module not found: Can't resolve '@/components/...'
```
**Çözüm:** Path alias ayarları kontrol edildi, webpack konfigürasyonu eklendi.

### Domain Hatası
```
Invalid hostname for images
```
**Çözüm:** `next.config.ts`'de domain'ler eklendi.

### TypeScript Hatası
```
Type error in component
```
**Çözüm:** `tsconfig.json` optimize edildi, strict mode aktif.

## 📞 Destek

Sorun devam ederse:
1. Vercel build loglarını kontrol edin
2. Local build'i test edin
3. Environment variables'ları kontrol edin
4. Cache'i temizleyin

## 🎯 Sonraki Adımlar

- [ ] Vercel'e deploy et
- [ ] Domain DNS ayarlarını kontrol et
- [ ] SSL sertifikasını doğrula
- [ ] Site performansını test et
- [ ] Monitoring ayarla
