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

async function createTestEvent() {
  try {
    console.log('🔌 MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Test etkinliği oluştur
    const testEvent = new Event({
      title: 'Test Etkinlik',
      excerpt: 'Bu bir test etkinliğidir',
      content: 'Test etkinlik içeriği burada yer alacak',
      location: 'Test Lokasyon',
      slug: 'test-etkinlik',
      status: 'published',
      featured: false,
      category: 'Test',
      publishedAt: new Date(),
      createdBy: 'Test Script'
    });

    const savedEvent = await testEvent.save();
    console.log('✅ Test etkinliği oluşturuldu:', savedEvent._id);
    console.log('📝 Etkinlik detayları:', {
      title: savedEvent.title,
      slug: savedEvent.slug,
      status: savedEvent.status
    });

  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 MongoDB bağlantısı kapatıldı');
  }
}

// Script'i çalıştır
createTestEvent();
