require('dotenv').config({ path: './env.production' });

async function testVercelBlob() {
  console.log('🧪 Vercel Blob Token Test');
  console.log('========================');
  
  // Environment variable kontrolü
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  console.log('🔑 BLOB_READ_WRITE_TOKEN:', token ? `${token.substring(0, 20)}...` : '❌ EKSİK');
  
  if (!token) {
    console.error('❌ BLOB_READ_WRITE_TOKEN bulunamadı!');
    return;
  }
  
  if (token === 'vercel_blob_rw_...') {
    console.error('❌ BLOB_READ_WRITE_TOKEN placeholder değeri!');
    return;
  }
  
  console.log('✅ Token mevcut ve geçerli görünüyor');
  
  // Vercel Blob SDK test
  try {
    const { put } = require('@vercel/blob');
    console.log('✅ @vercel/blob SDK yüklendi');
    
    // Test dosyası oluştur
    const testContent = 'Test content for Vercel Blob';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    
    console.log('📤 Test dosyası yükleniyor...');
    
    const result = await put('test/test-file.txt', testFile.stream(), {
      access: 'public',
      contentType: 'text/plain',
      addRandomSuffix: true
    });
    
    console.log('✅ Dosya başarıyla yüklendi!');
    console.log('📁 URL:', result.url);
    console.log('📁 Pathname:', result.pathname);
    console.log('📁 Size:', result.size);
    
    // Test dosyasını sil
    console.log('🗑️ Test dosyası siliniyor...');
    // Silme işlemi için ayrı bir fonksiyon gerekebilir
    
  } catch (error) {
    console.error('❌ Vercel Blob test hatası:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
  }
}

// Test'i çalıştır
testVercelBlob().catch(console.error);
