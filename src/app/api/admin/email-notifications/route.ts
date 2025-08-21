import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { EmailNotification } from '@/models/EmailNotification'
import { authenticate, requireAdmin } from '@/lib/auth'

// GET - Tüm e-posta bildirimlerini getir
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/admin/email-notifications başlatıldı')
    
    const user = await authenticate(request)
    console.log('Auth sonucu:', user ? 'Başarılı' : 'Başarısız')
    
    if (!user || !requireAdmin(user)) {
      console.log('Yetkisiz erişim denemesi')
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    console.log('MongoDB bağlantısı başlatılıyor...')
    await connectDB()
    console.log('MongoDB bağlantısı başarılı')
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    console.log('Filtre parametreleri:', { status, type, page, limit })
    
    const filter: any = {}
    if (status) filter.status = status
    if (type) filter.type = type
    
    const skip = (page - 1) * limit
    
    console.log('Veritabanı sorgusu başlatılıyor...')
    const [notifications, total] = await Promise.all([
      EmailNotification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailNotification.countDocuments(filter)
    ])
    
    console.log(`${notifications.length} bildirim bulundu, toplam: ${total}`)
    
    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('E-posta bildirimleri getirme hatası:', error)
    return NextResponse.json(
      { 
        error: 'E-posta bildirimleri getirilemedi',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}

// POST - Yeni e-posta bildirimi oluştur
export async function POST(request: NextRequest) {
  try {
    const user = await authenticate(request)
    if (!user || !requireAdmin(user)) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    await connectDB()
    
    const body = await request.json()
    const {
      title,
      message,
      emailSubject,
      emailRecipients,
      type,
      priority,
      scheduledFor,
      template,
      attachments
    } = body
    
    // Validasyon
    if (!title || !message || !emailSubject || !emailRecipients) {
      return NextResponse.json(
        { error: 'Gerekli alanlar eksik' },
        { status: 400 }
      )
    }
    
    // E-posta alıcılarını array'e çevir
    const recipients = Array.isArray(emailRecipients) 
      ? emailRecipients 
      : emailRecipients.split(',').map((email: string) => email.trim())
    
    const notification = new EmailNotification({
      title,
      message,
      emailSubject,
      emailRecipients: recipients,
      type: type || 'info',
      priority: priority || 'normal',
      status: scheduledFor ? 'scheduled' : 'draft',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      recipients: recipients.length,
      createdBy: user.email || 'Admin',
      template,
      attachments
    })
    
    await notification.save()
    
    return NextResponse.json({
      success: true,
      data: notification,
      message: 'E-posta bildirimi başarıyla oluşturuldu'
    })
  } catch (error) {
    console.error('E-posta bildirimi oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'E-posta bildirimi oluşturulamadı' },
      { status: 500 }
    )
  }
}
