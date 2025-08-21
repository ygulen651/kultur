const { MongoClient } = require('mongodb');

// MongoDB bağlantı bilgileri
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kultur-sanat-is';
const client = new MongoClient(uri);

async function clearTestData() {
  try {
    await client.connect();
    console.log('✅ MongoDB bağlantısı başarılı');

    const db = client.db();
    const collection = db.collection('emailnotifications');

    // Tüm test verilerini sil
    const result = await collection.deleteMany({});
    console.log(`🗑️ ${result.deletedCount} adet test e-posta bildirimi silindi`);
    
    if (result.deletedCount > 0) {
      console.log('✨ Test verileri başarıyla temizlendi!');
      console.log('📧 E-posta bildirimleri sayfası artık boş görünecek');
    } else {
      console.log('ℹ️ Silinecek test veri bulunamadı');
    }

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
}

// Scripti çalıştır
clearTestData();
