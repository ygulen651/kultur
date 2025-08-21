import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Notification } from '@/models/Notification'

// GET - Tüm bildirimleri getir
export async function GET() {
  try {
    await connectDB()
    
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      notifications: notifications
    })
  } catch (error) {
    console.error('Bildirimler getirilirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Bildirimler yüklenemedi' },
      { status: 500 }
    )
  }
}

// POST - Yeni bildirim oluştur
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const notificationData = {
      title: body.title,
      message: body.message,
      type: body.type || 'info',
      recipients: body.recipients || 'all',
      channels: body.channels || ['web'],
      scheduledFor: body.scheduledFor || null,
      priority: body.priority || 'normal',
      status: body.status || 'draft',
      createdAt: body.createdAt || new Date(),
      emailSubject: body.emailSubject || '',
      emailTemplate: body.emailTemplate || '',
      emailRecipients: body.emailRecipients || ''
    }

    const notification = new Notification(notificationData)
    await notification.save()

    return NextResponse.json({
      success: true,
      notification: notification
    }, { status: 201 })
  } catch (error) {
    console.error('Bildirim oluşturulurken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Bildirim oluşturulamadı' },
      { status: 500 }
    )
  }
}
