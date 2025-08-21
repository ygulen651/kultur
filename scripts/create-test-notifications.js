const { MongoClient } = require('mongodb')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kultur-sanat-is'

async function createTestNotifications() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    console.log('MongoDB\'ye bağlandı')
    
    const db = client.db()
    const notificationsCollection = db.collection('notifications')
    
    // Test bildirimleri
    const testNotifications = [
      {
        title: 'Hoş Geldiniz!',
        message: 'Kültür Sanat İş Sendikası\'na hoş geldiniz. Bu bir test bildirimidir.',
        type: 'info',
        recipients: 'all',
        channels: ['web'],
        priority: 'normal',
        status: 'sent',
        createdAt: new Date(),
        sentAt: new Date(),
        recipientCount: 150,
        openRate: 85
      },
      {
        title: 'Yeni Etkinlik',
        message: 'Bu hafta sonu yeni bir etkinlik düzenlenecektir. Detaylar için takipte kalın.',
        type: 'success',
        recipients: 'members',
        channels: ['web', 'email'],
        priority: 'high',
        status: 'scheduled',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 gün sonra
        createdAt: new Date(),
        emailSubject: 'Yeni Etkinlik Duyurusu',
        emailTemplate: '<h2>Yeni Etkinlik</h2><p>Bu hafta sonu yeni bir etkinlik düzenlenecektir.</p>'
      },
      {
        title: 'Sistem Bakımı',
        message: 'Yarın saat 02:00-04:00 arasında sistem bakımı yapılacaktır.',
        type: 'warning',
        recipients: 'all',
        channels: ['web', 'email', 'sms'],
        priority: 'urgent',
        status: 'draft',
        createdAt: new Date(),
        emailSubject: 'Sistem Bakım Uyarısı'
      }
    ]
    
    // Mevcut bildirimleri temizle
    await notificationsCollection.deleteMany({})
    console.log('Mevcut test bildirimleri temizlendi')
    
    // Yeni test bildirimleri ekle
    const result = await notificationsCollection.insertMany(testNotifications)
    console.log(`${result.insertedCount} test bildirimi eklendi`)
    
    // Eklenen bildirimleri listele
    const allNotifications = await notificationsCollection.find({}).toArray()
    console.log('Eklenen bildirimler:')
    allNotifications.forEach(notification => {
      console.log(`- ${notification.title} (${notification.status})`)
    })
    
  } catch (error) {
    console.error('Hata:', error)
  } finally {
    await client.close()
    console.log('MongoDB bağlantısı kapatıldı')
  }
}

createTestNotifications()
