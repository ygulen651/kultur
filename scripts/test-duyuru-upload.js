const fs = require('fs');
const path = require('path');

console.log('Duyuru Görsel Yükleme Test Scripti');
console.log('==================================');

// Environment değişkenlerini kontrol et
console.log('Environment Variables:');
console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '***' : 'NOT SET');

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN environment variable bulunamadı!');
  console.log('\nÇözüm:');
  console.log('1. Vercel Dashboard -> Storage -> Blob -> Create Database');
  console.log('2. Token\'ı kopyalayın');
  console.log('3. Environment variable olarak ekleyin: BLOB_READ_WRITE_TOKEN');
  process.exit(1);
}

console.log('✅ BLOB_READ_WRITE_TOKEN mevcut');

// Test görseli oluştur (basit bir SVG)
const testSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#ff6b6b"/>
  <text x="50" y="55" text-anchor="middle" fill="white" font-family="Arial" font-size="14">TEST</text>
</svg>`;

const testImagePath = path.join(__dirname, 'test-image.svg');
fs.writeFileSync(testImagePath, testSvg);

console.log('\n📁 Test görseli oluşturuldu:', testImagePath);

// API test fonksiyonu
async function testDuyuruUpload() {
  try {
    console.log('\n🚀 Duyuru API test ediliyor...');
    
    // FormData oluştur
    const FormData = require('form-data');
    const form = new FormData();
    
    // Test verileri ekle
    form.append('title', 'Test Duyuru - Vercel Blob');
    form.append('content', 'Bu bir test duyurusudur. Vercel Blob ile görsel yükleme test ediliyor.');
    form.append('excerpt', 'Vercel Blob test duyurusu');
    form.append('category', 'Test');
    form.append('author', 'Test Kullanıcı');
    form.append('tags', 'test,vercel,blob');
    form.append('featured', 'false');
    form.append('status', 'draft');
    
    // Test görseli ekle
    const imageStream = fs.createReadStream(testImagePath);
    form.append('image', imageStream, {
      filename: 'test-image.svg',
      contentType: 'image/svg+xml'
    });
    
    // API'ye gönder
    const response = await fetch('http://localhost:3000/api/admin/announcements', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders()
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Duyuru başarıyla oluşturuldu!');
      console.log('ID:', result.id);
      console.log('Görsel URL:', result.item.featuredImageUrl);
      console.log('Görsel Dosya Adı:', result.item.imageFilename);
    } else {
      console.error('❌ Duyuru oluşturulamadı:', result.error);
      console.error('Detay:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test hatası:', error.message);
  } finally {
    // Test dosyasını temizle
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log('\n🧹 Test dosyası temizlendi');
    }
  }
}

// Test çalıştır
testDuyuruUpload();
