const { MongoClient } = require('mongodb');

async function addTestImages() {
  // MongoDB bağlantı URI'si - bu değeri .env dosyanızdan alın
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kultur-sanat-is';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('MongoDB\'ye bağlandı');

    const db = client.db();
    const collection = db.collection('kultursanatises');

    // Test görselleri
    const testImages = [
      'https://res.cloudinary.com/dcuzvxaip/image/upload/v1755773622/kultur-sanat-is/test1.jpg',
      'https://res.cloudinary.com/dcuzvxaip/image/upload/v1755773622/kultur-sanat-is/test2.jpg',
      'https://res.cloudinary.com/dcuzvxaip/image/upload/v1755773622/kultur-sanat-is/test3.jpg'
    ];

    // Mevcut içeriği bul ve güncelle
    const result = await collection.updateOne(
      { slug: 'awdsasdasd' }, // Konsol çıktısındaki slug
      { 
        $set: { 
          images: testImages,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount > 0) {
      console.log('İçerik güncellendi, ek görseller eklendi');
      
      // Güncellenmiş içeriği kontrol et
      const updatedItem = await collection.findOne({ slug: 'awdsasdasd' });
      console.log('Güncellenmiş içerik:');
      console.log(`Başlık: ${updatedItem.title}`);
      console.log(`Ek Görseller: ${updatedItem.images ? updatedItem.images.length : 0} adet`);
      if (updatedItem.images) {
        updatedItem.images.forEach((img, i) => console.log(`  ${i + 1}. ${img}`));
      }
    } else {
      console.log('İçerik bulunamadı');
    }

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await client.close();
  }
}

// Eğer MONGODB_URI environment variable'ı yoksa, manuel olarak girin
if (!process.env.MONGODB_URI) {
  console.log('MONGODB_URI environment variable bulunamadı.');
  console.log('Lütfen .env dosyanızda MONGODB_URI değerini ayarlayın veya manuel olarak girin.');
  console.log('Örnek: MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/database"');
  process.exit(1);
}

addTestImages();
