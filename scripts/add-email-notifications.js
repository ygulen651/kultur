const { MongoClient } = require('mongodb');

// MongoDB bağlantı bilgileri
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kultur-sanat-is';
const client = new MongoClient(uri);

async function addEmailNotifications() {
  try {
    await client.connect();
    console.log('MongoDB\'ye bağlandı');

    const db = client.db();
    const collection = db.collection('emailnotifications');

    // Örnek e-posta bildirimleri
    const emailNotifications = [
      {
        title: 'Yeni Üyelik Başvurusu',
        message: 'Ahmet Yılmaz adlı kişiden yeni üyelik başvurusu alındı. Lütfen inceleyin.',
        emailSubject: 'Yeni Üyelik Başvurusu - Kültür Sanat İş',
        emailRecipients: ['admin@kultursanatis.org', 'uyelik@kultursanatis.org'],
        type: 'info',
        priority: 'normal',
        status: 'sent',
        recipients: 2,
        opened: 2,
        clicked: 1,
        sentAt: new Date('2024-01-08T10:31:00Z'),
        createdAt: new Date('2024-01-08T10:30:00Z'),
        createdBy: 'Sistem',
        template: 'uyelik-basvuru'
      },
      {
        title: 'Etkinlik Hatırlatması',
        message: 'Yarın saat 19:00\'te "Sanat ve Kültür" söyleşisi gerçekleşecek. Katılımcılara hatırlatma gönderildi.',
        emailSubject: 'Etkinlik Hatırlatması: Sanat ve Kültür Söyleşisi',
        emailRecipients: ['etkinlik@kultursanatis.org', 'katilimcilar@kultursanatis.org'],
        type: 'info',
        priority: 'normal',
        status: 'sent',
        recipients: 89,
        opened: 67,
        clicked: 34,
        sentAt: new Date('2024-01-08T09:16:00Z'),
        createdAt: new Date('2024-01-08T09:15:00Z'),
        createdBy: 'Etkinlik Yöneticisi',
        template: 'etkinlik-hatirlatma'
      },
      {
        title: 'Haftalık Bülten',
        message: 'Bu haftaki etkinlikler, duyurular ve güncel gelişmeler hakkında haftalık bülten gönderildi.',
        emailSubject: 'Kültür Sanat İş Haftalık Bülteni - 8-14 Ocak 2024',
        emailRecipients: ['bulten@kultursanatis.org', 'uyeler@kultursanatis.org'],
        type: 'info',
        priority: 'low',
        status: 'sent',
        recipients: 1247,
        opened: 892,
        clicked: 156,
        sentAt: new Date('2024-01-08T08:01:00Z'),
        createdAt: new Date('2024-01-08T08:00:00Z'),
        createdBy: 'İletişim Sorumlusu',
        template: 'haftalik-bulten'
      },
      {
        title: 'Şifre Sıfırlama Talebi',
        message: 'Kullanıcı şifre sıfırlama talebinde bulundu. Güvenlik için e-posta gönderildi.',
        emailSubject: 'Şifre Sıfırlama Talebi - Kültür Sanat İş',
        emailRecipients: ['guvenlik@kultursanatis.org'],
        type: 'warning',
        priority: 'high',
        status: 'sent',
        recipients: 1,
        opened: 1,
        clicked: 1,
        sentAt: new Date('2024-01-08T07:46:00Z'),
        createdAt: new Date('2024-01-08T07:45:00Z'),
        createdBy: 'Sistem',
        template: 'sifre-sifirlama'
      },
      {
        title: 'Yeni İletişim Formu Mesajı',
        message: 'İletişim formundan yeni mesaj alındı. Lütfen yanıtlayın.',
        emailSubject: 'Yeni İletişim Formu Mesajı - Kültür Sanat İş',
        emailRecipients: ['iletisim@kultursanatis.org', 'admin@kultursanatis.org'],
        type: 'info',
        priority: 'normal',
        status: 'sent',
        recipients: 2,
        opened: 2,
        clicked: 1,
        sentAt: new Date('2024-01-08T07:31:00Z'),
        createdAt: new Date('2024-01-08T07:30:00Z'),
        createdBy: 'Sistem',
        template: 'iletisim-formu'
      },
      {
        title: 'Sistem Bakım Bildirimi',
        message: 'Pazar günü saat 02:00-04:00 arasında sistem bakımı yapılacaktır. Hizmet kesintisi yaşanabilir.',
        emailSubject: 'Sistem Bakım Bildirimi - 14 Ocak 2024',
        emailRecipients: ['bakim@kultursanatis.org', 'teknik@kultursanatis.org'],
        type: 'warning',
        priority: 'high',
        status: 'scheduled',
        recipients: 1247,
        opened: 0,
        clicked: 0,
        scheduledFor: new Date('2024-01-09T18:00:00Z'),
        createdAt: new Date('2024-01-08T06:00:00Z'),
        createdBy: 'Sistem Yöneticisi',
        template: 'sistem-bakim'
      },
      {
        title: 'Yeni Duyuru Yayınlandı',
        message: 'Yeni toplu sözleşme hakkında önemli duyuru yayınlandı. Tüm üyeler bilgilendirildi.',
        emailSubject: 'Önemli Duyuru: Yeni Toplu Sözleşme',
        emailRecipients: ['duyurular@kultursanatis.org', 'uyeler@kultursanatis.org'],
        type: 'info',
        priority: 'high',
        status: 'sent',
        recipients: 1247,
        opened: 1100,
        clicked: 450,
        sentAt: new Date('2024-01-07T16:30:00Z'),
        createdAt: new Date('2024-01-07T16:25:00Z'),
        createdBy: 'Genel Sekreter',
        template: 'onemli-duyuru'
      },
      {
        title: 'Eğitim Semineri Daveti',
        message: 'Gelecek hafta "Kültür Sanat Çalışanlarının Hakları" konulu eğitim semineri düzenlenecektir.',
        emailSubject: 'Eğitim Semineri Daveti: Kültür Sanat Çalışanlarının Hakları',
        emailRecipients: ['egitim@kultursanatis.org', 'uyeler@kultursanatis.org'],
        type: 'info',
        priority: 'normal',
        status: 'sent',
        recipients: 1247,
        opened: 890,
        clicked: 320,
        sentAt: new Date('2024-01-07T14:15:00Z'),
        createdAt: new Date('2024-01-07T14:10:00Z'),
        createdBy: 'Eğitim Sorumlusu',
        template: 'egitim-davet'
      },
      {
        title: 'Yılbaşı Mesajı',
        message: 'Tüm üyelerimize mutlu yıllar dileriz. Yeni yılda birlikte daha güçlü olacağız.',
        emailSubject: 'Mutlu Yıllar - Kültür Sanat İş',
        emailRecipients: ['yilbasi@kultursanatis.org', 'uyeler@kultursanatis.org'],
        type: 'success',
        priority: 'low',
        status: 'sent',
        recipients: 1247,
        opened: 1200,
        clicked: 200,
        sentAt: new Date('2024-01-01T00:01:00Z'),
        createdAt: new Date('2024-01-01T00:00:00Z'),
        createdBy: 'Başkan',
        template: 'yilbasi-mesaji'
      },
      {
        title: '1 Mayıs Kutlaması',
        message: '1 Mayıs İşçi Bayramı kutlaması için tüm üyelerimizi davet ediyoruz.',
        emailSubject: '1 Mayıs İşçi Bayramı Kutlaması Daveti',
        emailRecipients: ['etkinlik@kultursanatis.org', 'uyeler@kultursanatis.org'],
        type: 'info',
        priority: 'normal',
        status: 'draft',
        recipients: 0,
        opened: 0,
        clicked: 0,
        createdAt: new Date('2024-01-08T12:00:00Z'),
        createdBy: 'Etkinlik Yöneticisi',
        template: '1-mayis-davet'
      }
    ];

    // Mevcut verileri temizle
    await collection.deleteMany({});
    console.log('Mevcut e-posta bildirimleri temizlendi');

    // Yeni verileri ekle
    const result = await collection.insertMany(emailNotifications);
    console.log(`${result.insertedCount} adet e-posta bildirimi eklendi`);

    // Eklenen verileri listele
    const addedNotifications = await collection.find({}).toArray();
    console.log('\nEklenen e-posta bildirimleri:');
    addedNotifications.forEach((notification, index) => {
      console.log(`${index + 1}. ${notification.title} - ${notification.status}`);
    });

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await client.close();
    console.log('MongoDB bağlantısı kapatıldı');
  }
}

// Scripti çalıştır
addEmailNotifications();
