const mongoose = require('mongoose');
require('dotenv').config();

// Announcement modelini import et
const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  isFeatured: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  image: {
    url: { type: String, default: '' },
    publicId: { type: String, default: '' },
  },
}, { timestamps: true });

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);

async function checkAnnouncements() {
  try {
    // MongoDB'a bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sendika');
    console.log('✅ MongoDB bağlantısı başarılı');

    // Tüm duyuruları getir
    const allAnnouncements = await Announcement.find({}).sort({ createdAt: -1 });
    console.log(`\n📊 Toplam duyuru sayısı: ${allAnnouncements.length}`);

    if (allAnnouncements.length === 0) {
      console.log('❌ Hiç duyuru bulunamadı!');
      return;
    }

    console.log('\n📋 Duyuru Listesi:');
    console.log('='.repeat(80));

    allAnnouncements.forEach((ann, index) => {
      const status = ann.publishedAt ? '✅ Yayında' : '❌ Taslak';
      const publishDate = ann.publishedAt ? ann.publishedAt.toLocaleDateString('tr-TR') : 'Yayınlanmamış';
      const featured = ann.isFeatured ? '⭐ Öne Çıkan' : '';
      
      console.log(`${index + 1}. ${ann.title}`);
      console.log(`   Durum: ${status} ${featured}`);
      console.log(`   Yayın Tarihi: ${publishDate}`);
      console.log(`   Oluşturulma: ${ann.createdAt.toLocaleDateString('tr-TR')}`);
      console.log(`   ID: ${ann._id}`);
      console.log('-'.repeat(60));
    });

    // Yayında olan duyuruları say
    const publishedCount = allAnnouncements.filter(ann => ann.publishedAt).length;
    const draftCount = allAnnouncements.length - publishedCount;

    console.log('\n📈 Özet:');
    console.log(`   Yayında: ${publishedCount} duyuru`);
    console.log(`   Taslak: ${draftCount} duyuru`);
    console.log(`   Öne Çıkan: ${allAnnouncements.filter(ann => ann.isFeatured).length} duyuru`);

    if (publishedCount === 0) {
      console.log('\n⚠️  SORUN: Hiç yayınlanmış duyuru yok!');
      console.log('Ana sayfada duyuru görünmesi için publishedAt alanının dolu olması gerekiyor.');
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
if (require.main === module) {
  checkAnnouncements();
}

module.exports = { checkAnnouncements };
