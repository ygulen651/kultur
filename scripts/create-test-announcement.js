const { MongoClient } = require('mongodb');

async function createTestAnnouncement() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kultur-sanat-is';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('MongoDB\'ye bağlandı');

    const db = client.db();
    const collection = db.collection('announcements');

    const testAnnouncement = {
      title: 'Test Duyuru - Ek Görseller ve Dosyalar',
      excerpt: 'Bu bir test duyurusudur. Ek görseller ve dosyalar ile birlikte gelir.',
      content: `
        <h2>Test Duyuru İçeriği</h2>
        <p>Bu duyuru, yeni eklenen özellikleri test etmek için oluşturulmuştur.</p>
        <ul>
          <li>Ek görseller desteği</li>
          <li>Ek dosyalar desteği</li>
          <li>Gelişmiş görüntüleme</li>
        </ul>
        <p>Duyuru içeriği HTML formatında yazılabilir ve zengin içerik desteği sunar.</p>
      `,
      category: 'genel',
      tags: ['test', 'yeni-özellik', 'görsel', 'dosya'],
      status: 'published',
      featured: true,
      publishDate: new Date(),
      author: 'Admin',
      // Test görselleri
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop'
      ],
      // Test dosyaları
      files: [
        {
          name: 'Test-Dokuman.pdf',
          url: '/documents/test-document.pdf',
          type: 'application/pdf',
          size: 1024000 // 1MB
        },
        {
          name: 'Sunum.pptx',
          url: '/documents/presentation.pptx',
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          size: 2048000 // 2MB
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(testAnnouncement);
    console.log('Test duyurusu oluşturuldu:', result.insertedId);

    // Oluşturulan duyuruyu kontrol et
    const created = await collection.findOne({ _id: result.insertedId });
    console.log('Oluşturulan duyuru:', {
      title: created.title,
      images: created.images?.length || 0,
      files: created.files?.length || 0
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await client.close();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

createTestAnnouncement();
