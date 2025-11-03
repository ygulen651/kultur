const mongoose = require('mongoose');
require('dotenv').config();

const AnnouncementSchema = new mongoose.Schema({
  title: String,
  content: String,
  excerpt: String,
  slug: String,
  status: String,
  category: String,
  featured: Boolean,
  featuredImage: String,
  images: [String],
  files: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  publishDate: Date,
  author: String,
  views: Number,
  tags: [String]
}, { timestamps: true });

const Announcement = mongoose.model('Announcement', AnnouncementSchema);

async function updateAnnouncementsImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB\'ye bağlandı');

    // Mevcut duyuruları bul
    const announcements = await Announcement.find({});
    console.log(`Toplam ${announcements.length} duyuru bulundu`);

    // Her duyuruya featuredImage ekle
    for (const announcement of announcements) {
      if (!announcement.featuredImage) {
        // Eğer images array'i varsa ilk görseli featuredImage olarak kullan
        if (announcement.images && announcement.images.length > 0) {
          announcement.featuredImage = announcement.images[0];
          console.log(`✅ ${announcement.title}: featuredImage eklendi`);
        } else {
          // Varsayılan görsel ekle
          announcement.featuredImage = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop';
          console.log(`✅ ${announcement.title}: Varsayılan featuredImage eklendi`);
        }
        
        await announcement.save();
      } else {
        console.log(`ℹ️ ${announcement.title}: featuredImage zaten var`);
      }
    }

    console.log('Tüm duyurular güncellendi!');
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

updateAnnouncementsImages();
