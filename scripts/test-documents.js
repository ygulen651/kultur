const fs = require('fs');
const path = require('path');

// Test edilecek dosya yolları
const testFiles = [
  '/uploads/1754912116203-NEDEN KÜLTÜR SANATİŞ YAZISI 2017.docx',
  '/documents/Kültür-Sanat-İş-Üyelik-Formu.pdf',
  '/uploads/BAKANLIK_TALEPLER__1755594332190.docx'
];

console.log('📁 Belge dosyaları test ediliyor...\n');

testFiles.forEach((filePath, index) => {
  const fullPath = path.join(__dirname, '..', 'public', filePath);
  
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    console.log(`✅ ${index + 1}. ${filePath}`);
    console.log(`   Boyut: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Son değişiklik: ${stats.mtime.toLocaleDateString('tr-TR')}`);
  } else {
    console.log(`❌ ${index + 1}. ${filePath} - DOSYA BULUNAMADI!`);
  }
  console.log('');
});

// Public klasörlerini kontrol et
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
const documentsDir = path.join(__dirname, '..', 'public', 'documents');

console.log('📂 Klasör durumları:');
console.log(`uploads: ${fs.existsSync(uploadsDir) ? '✅ Mevcut' : '❌ Yok'} (${fs.readdirSync(uploadsDir).length} dosya)`);
console.log(`documents: ${fs.existsSync(documentsDir) ? '✅ Mevcut' : '❌ Yok'} (${fs.readdirSync(documentsDir).length} dosya)`);

console.log('\n🔍 Test tamamlandı!');
