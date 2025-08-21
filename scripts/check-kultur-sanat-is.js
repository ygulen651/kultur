const { MongoClient } = require('mongodb');

async function checkKulturSanatIs() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kultur-sanat-is';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('MongoDB\'ye bağlandı');

    const db = client.db();
    const collection = db.collection('kultursanatises');

    // Tüm içerikleri getir
    const items = await collection.find({}).toArray();
    console.log(`Toplam ${items.length} içerik bulundu:`);

    items.forEach((item, index) => {
      console.log(`\n--- İçerik ${index + 1} ---`);
      console.log(`ID: ${item._id}`);
      console.log(`Başlık: ${item.title}`);
      console.log(`Slug: ${item.slug}`);
      console.log(`Durum: ${item.status}`);
      console.log(`Kapak Görseli: ${item.coverImage ? 'Var' : 'Yok'}`);
      console.log(`Ek Görseller: ${item.images ? `${item.images.length} adet` : 'Yok'}`);
      if (item.images && item.images.length > 0) {
        console.log('Ek görsel URL\'leri:');
        item.images.forEach((img, i) => console.log(`  ${i + 1}. ${img}`));
      }
      console.log(`Ek Dosya: ${item.file ? 'Var' : 'Yok'}`);
      if (item.file) {
        console.log(`  Dosya Adı: ${item.fileName || 'Bilinmiyor'}`);
        console.log(`  Dosya Türü: ${item.fileType || 'Bilinmiyor'}`);
      }
      console.log(`Oluşturulma: ${item.createdAt}`);
      console.log(`Güncellenme: ${item.updatedAt}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await client.close();
  }
}

checkKulturSanatIs();
