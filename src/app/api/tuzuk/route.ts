import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Tuzuk } from '@/models/Tuzuk'

export async function GET() {
  try {
    await connectDB()
    
    // Aktif ve yayınlanmış tüzüğü getir
    const tuzuk = await Tuzuk.findOne({ 
      status: 'published', 
      isActive: true 
    }).sort({ createdAt: -1 }).lean()
    
    if (!tuzuk) {
      return NextResponse.json({
        success: false,
        message: 'Aktif tüzük bulunamadı',
        data: null
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tüzük başarıyla getirildi',
      data: tuzuk
    })
  } catch (error) {
    console.error('Tüzük getirme hatası:', error)
    return NextResponse.json({
      success: false,
      message: 'Tüzük getirilemedi'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { title, content, version, status, lastModifiedBy } = body
    
    // Validation
    if (!title || !content || !lastModifiedBy) {
      return NextResponse.json({
        success: false,
        message: 'Başlık, içerik ve düzenleyen bilgisi zorunludur'
      }, { status: 400 })
    }
    
    // Yeni tüzük oluştur
    const newTuzuk = new Tuzuk({
      title: title.trim(),
      content: content.trim(),
      version: version || '1.0.0',
      status: status || 'published',
      isActive: true,
      lastModifiedBy: lastModifiedBy.trim()
    })
    
    await newTuzuk.save()
    
    return NextResponse.json({
      success: true,
      message: 'Tüzük başarıyla oluşturuldu',
      data: newTuzuk
    })
  } catch (error) {
    console.error('Tüzük oluşturma hatası:', error)
    return NextResponse.json({
      success: false,
      message: 'Tüzük oluşturulamadı'
    }, { status: 500 })
  }
}
