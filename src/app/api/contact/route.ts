import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Contact } from '@/models/Contact'
import { toErrorLike } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basit validasyon
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json({
        ok: false,
        message: 'Gerekli alanlar eksik'
      }, { status: 400 });
    }
    
    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({
        ok: false,
        message: 'Geçersiz e-posta adresi'
      }, { status: 400 });
    }

    // Veritabanına bağlan
    await connectDB()
    
    // IP adresi ve User-Agent bilgilerini al
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Mesajı veritabanına kaydet
    const contactData = {
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      phone: body.phone || '',
      company: body.company || '',
      status: 'new' as const,
      priority: 'normal' as const,
      ipAddress: ip,
      userAgent: userAgent
    }

    const contact = new Contact(contactData)
    await contact.save()
    
    // Burada gerçek e-posta gönderimi yapılabilir
    // Şimdilik sadece başarılı response döndürüyoruz
    
    return NextResponse.json({
      ok: true,
      message: 'İletişim formu başarıyla alındı. En kısa sürede size dönüş yapacağız.',
      id: contact._id
    }, { status: 200 });
    
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('Contact form error:', e);
    return NextResponse.json({
      ok: false,
      message: 'Form işlenirken bir hata oluştu. Lütfen tekrar deneyin.',
      details: e.message,
      code: e.code,
      meta: e.meta
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Admin paneli için tüm mesajları getir
    await connectDB()
    
    const contacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .select('name email subject status priority createdAt')
      .lean()
    
    return NextResponse.json({
      ok: true,
      data: contacts
    }, { status: 200 });
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('Contact list error:', e);
    return NextResponse.json({
      ok: false,
      data: [],
      details: e.message,
      code: e.code,
      meta: e.meta
    }, { status: 500 });
  }
}
