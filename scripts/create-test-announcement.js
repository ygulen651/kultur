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

async function createTestAnnouncement() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB\'ye bağlandı');

    // Önce eski test duyurularını silelim
    await Announcement.deleteMany({ title: { $regex: /^Test Duyuru/ } });
    console.log('Eski test duyuruları silindi');

    const testAnnouncement = new Announcement({
      title: 'Test Duyuru - Ek Görseller ve Dosyalar',
      content: `
        <h2>Bu bir test duyurusudur</h2>
        <p>Bu duyuru, ek görseller ve dosyalar ile birlikte test amaçlı oluşturulmuştur.</p>
        <h3>Özellikler:</h3>
        <ul>
          <li>Ek görseller: 3 adet</li>
          <li>Ek dosyalar: 2 adet</li>
          <li>Slug: test-duyuru-ek-gorseller-ve-dosyalar</li>
          <li>Status: published</li>
        </ul>
        <p>Bu duyuru, duyuru sistemi testleri için kullanılmaktadır.</p>
      `,
      excerpt: 'Test duyurusu - ek görseller ve dosyalar ile birlikte',
      slug: 'test-duyuru-ek-gorseller-ve-dosyalar',
      status: 'published',
      category: 'Test',
      featured: true,
      featuredImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
      ],
      files: [
        {
          name: 'Test Dosyası 1.pdf',
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          type: 'application/pdf',
          size: 1024 * 1024 // 1MB
        },
        {
          name: 'Test Dosyası 2.docx',
          url: 'https://file-examples.com/storage/feaade38c1651bd01984236/2017/10/file-sample_150kB.doc',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 150 * 1024 // 150KB
        }
      ],
      publishDate: new Date(),
      author: 'Test Admin',
      views: 0,
      tags: ['test', 'duyuru', 'görsel', 'dosya']
    });

    const savedAnnouncement = await testAnnouncement.save();
    console.log('Test duyurusu oluşturuldu:', savedAnnouncement._id);
    console.log('Oluşturulan duyuru:', {
      title: savedAnnouncement.title,
      slug: savedAnnouncement.slug,
      images: savedAnnouncement.images.length,
      files: savedAnnouncement.files.length
    });

    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

createTestAnnouncement();
