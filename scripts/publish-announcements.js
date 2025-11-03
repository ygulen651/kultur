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

async function publishAllAnnouncements() {
  try {
    // MongoDB'a bağlan
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sendika');
    console.log('✅ MongoDB bağlantısı başarılı');

    // publishedAt alanı null olan duyuruları bul
    const unpublishedAnnouncements = await Announcement.find({ publishedAt: null });
    
    if (unpublishedAnnouncements.length === 0) {
      console.log('✅ Tüm duyurular zaten yayında!');
      return;
    }

    console.log(`📝 ${unpublishedAnnouncements.length} yayınlanmamış duyuru bulundu:`);
    
    // Her birini yayınla
    for (const announcement of unpublishedAnnouncements) {
      await Announcement.findByIdAndUpdate(
        announcement._id,
        { publishedAt: new Date() },
        { new: true }
      );
      console.log(`✅ Yayınlandı: ${announcement.title}`);
    }

    console.log(`\n🎉 ${unpublishedAnnouncements.length} duyuru başarıyla yayınlandı!`);
    console.log('Artık ana sayfada görünecekler.');

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB bağlantısı kapatıldı');
  }
}

// Sadece belirli duyuruları yayınlamak için
async function publishSpecificAnnouncements(titles) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sendika');
    console.log('✅ MongoDB bağlantısı başarılı');

    for (const title of titles) {
      const announcement = await Announcement.findOneAndUpdate(
        { title: { $regex: title, $options: 'i' }, publishedAt: null },
        { publishedAt: new Date() },
        { new: true }
      );
      
      if (announcement) {
        console.log(`✅ Yayınlandı: ${announcement.title}`);
      } else {
        console.log(`❌ Bulunamadı veya zaten yayında: ${title}`);
      }
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Script'i çalıştır
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Belirli duyuruları yayınla
    publishSpecificAnnouncements(args);
  } else {
    // Tüm duyuruları yayınla
    publishAllAnnouncements();
  }
}

module.exports = { publishAllAnnouncements, publishSpecificAnnouncements };
