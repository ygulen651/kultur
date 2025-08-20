# Press Kategorileri Migration

Bu doküman, Press koleksiyonundaki mevcut kayıtları yeni kategori sistemine migrate etme sürecini açıklar.

## Öncesi Durum

- Press kayıtlarında `category` alanı yok veya boş
- Slug'lar sadece title'dan üretiliyor (çakışma riski)
- Tek bir slug index'i var

## Sonrası Durum

- Her Press kaydında zorunlu `category` alanı: `"afis" | "brosur" | "basin"`
- Slug'lar `category + title` kombinasyonundan üretiliyor
- Compound index: `{ category: 1, slug: 1 }` (unique, partial)

## Migration Adımları

### 1. Script Çalıştır

```bash
npm run migrate:press
```

### 2. Script Ne Yapar?

1. **Kategorisiz kayıtları bulur** (`category: null`, `category: ""`, `category: { $exists: false }`)
2. **Geçici olarak "basin" kategorisine atar**
3. **Slug'ları yeniden üretir** (`category + title` formatında)
4. **Çakışan slug'ları çözer** (numara ekleyerek)
5. **Eski index'leri kaldırır**
6. **Yeni compound index oluşturur**

### 3. Sonrası Kontrol

Script çalıştıktan sonra:

```bash
# MongoDB'de kontrol
db.presses.find({}, {title: 1, category: 1, slug: 1})

# Kategori sayılarını gör
db.presses.aggregate([
  { $group: { _id: "$category", count: { $sum: 1 } } }
])
```

## Manuel Düzenleme

Migration sonrası bazı kayıtları manuel olarak doğru kategorilere atamak gerekebilir:

### Admin Panel'den

1. `/admin/basin-yayin` - Basın haberleri
2. `/admin/basin-yayin/afis` - Afişler  
3. `/admin/basin-yayin/brosur` - Broşürler

### API ile

```bash
# Bir kaydı "afis" kategorisine taşı
curl -X PATCH /api/press/{id} \
  -H "Content-Type: application/json" \
  -d '{"category": "afis"}'
```

## Güvenlik

- Migration sadece bir kez çalıştırılmalı
- Öncesi veritabanı yedeği alınmalı
- Production'da test edilmeden çalıştırılmamalı

## Hata Durumları

### Duplicate Key Error

Eğer migration sonrası duplicate key hatası alınırsa:

1. Index'leri kontrol et: `db.presses.getIndexes()`
2. Çakışan slug'ları bul: `db.presses.find({slug: "problematic-slug"})`
3. Manuel olarak slug'ları düzelt

### Kategori Eksik

Eğer hala kategorisiz kayıt varsa:

1. `db.presses.find({category: {$exists: false}})`
2. Manuel olarak kategori ata
3. Slug'ları yeniden üret

## Test

Migration sonrası:

1. Yeni kayıt ekle (her kategoriden)
2. Slug çakışması test et
3. Liste sayfalarını kontrol et
4. Cache invalidation test et

## Rollback

Gerekirse eski duruma dönmek için:

```bash
# Index'leri kaldır
db.presses.dropIndex("category_1_slug_1")

# Kategori alanını kaldır
db.presses.updateMany({}, {$unset: {category: 1}})

# Eski slug index'i geri kur
db.presses.createIndex({slug: 1}, {unique: true, partialFilterExpression: {slug: {$type: "string", $ne: ""}}})
```



