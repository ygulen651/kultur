# Vercel Deployment Sorunları ve Çözümleri

## Sorun
Vercel build sırasında aşağıdaki hatalar oluşuyordu:

```
Module not found: Can't resolve '@/components/AnnouncementCard'
Module not found: Can't resolve '@/components/ui/button'
Module not found: Can't resolve '@/components/ui/input'
Module not found: Can't resolve '@/components/ui/textarea'
Module not found: Can't resolve '@/components/ui/label'
```

## Çözümler

### 1. Çoklu Next.js Config Dosyaları Temizlendi
- `next.config.js` silindi
- `next.config.mjs` silindi
- Sadece `next.config.ts` kullanılıyor

### 2. Path Alias Çözümleme Düzeltildi
- `tsconfig.json` güncellendi
- `jsconfig.json` eklendi
- `next.config.ts`'de webpack alias ayarları eklendi

### 3. Next.js 15 Uyumluluğu
- TypeScript ayarları optimize edildi
- Webpack konfigürasyonu güncellendi
- Build optimizasyonları eklendi

## Güncellenen Dosyalar

### next.config.ts
```typescript
webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': require('path').resolve(__dirname, 'src'),
  };
  return config;
},
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true,
    // ... diğer ayarlar
  }
}
```

### jsconfig.json (Yeni)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Deployment Öncesi Kontrol Listesi

- [ ] `npm run build` local'de çalışıyor
- [ ] Tüm import'lar doğru çözümleniyor
- [ ] TypeScript hataları yok
- [ ] Environment variables doğru ayarlandı

## Vercel Environment Variables

Vercel dashboard'da aşağıdaki environment variables'ları ayarlayın:

```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.kultursanatis.com.tr
NEXT_PUBLIC_API_URL=https://www.kultursanatis.com.tr
```

## Build Komutu

```bash
npm run build
```

## Sorun Devam Ederse

1. Vercel cache'i temizleyin
2. Repository'yi yeniden deploy edin
3. Build loglarını kontrol edin
4. Local build'i test edin
