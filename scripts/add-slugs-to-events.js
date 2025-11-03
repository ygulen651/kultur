const mongoose = require('mongoose');

// MongoDB bağlantı string'i
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sendika';

// Event model'i
const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: String,
  content: String,
  location: String,
  slug: String,
  date: Date,
  startDate: Date,
  endDate: Date,
  time: String,
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  featured: { type: Boolean, default: false },
  category: String,
  cover: String,
  image: {
    url: String,
    publicId: String,
    filename: String,
  },
  publishedAt: Date,
  createdBy: String,
}, { timestamps: true });

const Event = mongoose.model('Event', EventSchema);

async function addSlugsToEvents() {
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Slug'ı olmayan etkinlikleri bul
    const eventsWithoutSlug = await Event.find({ slug: { $exists: false } });
    console.log(`📊 Slug'ı olmayan ${eventsWithoutSlug.length} etkinlik bulundu`);

    if (eventsWithoutSlug.length === 0) {
      console.log('✅ Tüm etkinliklerde zaten slug var');
      return;
    }

    // Her etkinliğe slug ekle
    for (const event of eventsWithoutSlug) {
      const slug = event.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Sadece harf, rakam, boşluk ve tire
        .replace(/\s+/g, '-') // Boşlukları tire ile değiştir
        .replace(/-+/g, '-') // Birden fazla tireyi tek tire yap
        .replace(/^-+|-+$/g, ''); // Başta ve sonda tire varsa kaldır

      console.log(`📝 "${event.title}" -> "${slug}"`);

      // Slug'ı güncelle
      await Event.updateOne(
        { _id: event._id },
        { $set: { slug: slug } }
      );
    }

    console.log('✅ Tüm etkinliklere slug eklendi');

    // Sonuçları kontrol et
    const updatedEvents = await Event.find({});
    console.log(`📊 Toplam ${updatedEvents.length} etkinlik`);
    
    updatedEvents.forEach(event => {
      console.log(`  - ${event.title}: ${event.slug}`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
addSlugsToEvents();
