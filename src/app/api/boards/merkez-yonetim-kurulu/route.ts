import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Management } from '@/models/Management'

export async function GET() {
  try {
    console.log('🔄 MongoDB bağlantısı kuruluyor...')
    await connectDB()
    console.log('✅ MongoDB bağlantısı başarılı')
    
    // Merkez yönetim kurulu üyelerini getir
    console.log('🔍 Merkez yönetim kurulu üyeleri aranıyor...')
    const members = await Management.find({ group: 'merkez-yonetim-kurulu' })
      .select('_id group name position bio photo email phone experience education order isActive createdAt updatedAt')
      .sort({ order: 1, name: 1 })
      .lean()
    
    console.log('📊 Bulunan üyeler:', members)
    console.log('📊 Üye sayısı:', members.length)
    
    // Her üye için detaylı log
    members.forEach((member: any, index: number) => {
      console.log(`👤 Üye ${index + 1}:`, {
        _id: member._id,
        name: member.name,
        position: member.position,
        bio: member.bio,
        photo: member.photo ? 'Var' : 'Yok',
        email: member.email,
        phone: member.phone,
        experience: member.experience,
        education: member.education,
        order: member.order,
        isActive: member.isActive
      })
    })
    
    return NextResponse.json({
      success: true,
      message: 'Merkez yönetim kurulu verileri başarıyla getirildi',
      data: members
    })
  } catch (error) {
    console.error('❌ Merkez yönetim kurulu verileri getirilemedi:', error)
    return NextResponse.json(
      { success: false, message: 'Veriler getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST isteği başladı')
    
    console.log('🔄 MongoDB bağlantısı kuruluyor...')
    await connectDB()
    console.log('✅ MongoDB bağlantısı başarılı')
    
    const body = await request.json()
    console.log('📝 Request body:', body)
    const { name, position, bio, photo, email, phone, experience, education, order } = body
    
    console.log('📝 Yeni merkez yönetim kurulu üyesi verisi:', { name, position, bio, photo, email, phone, experience, education, order })
    
    // Validation
    if (!name || !position) {
      console.log('❌ Validation hatası: name veya position eksik')
      return NextResponse.json(
        { success: false, message: 'İsim ve pozisyon zorunludur' },
        { status: 400 }
      )
    }
    
    // Yeni merkez yönetim kurulu üyesi oluştur
    const newMember = new Management({
      group: 'merkez-yonetim-kurulu',
      name: name || '',
      position: position || '',
      bio: bio || '',
      photo: photo || '',
      email: email || '',
      phone: phone || '',
      experience: experience || '',
      education: education || '',
      order: order || 999
    })
    
    console.log('📝 Oluşturulan member objesi:', newMember)
    
    await newMember.save()
    console.log('✅ Yeni merkez yönetim kurulu üyesi kaydedildi:', newMember)
    
    return NextResponse.json({
      success: true,
      message: 'Merkez yönetim kurulu üyesi eklendi',
      data: newMember
    })
  } catch (error) {
    console.error('❌ Merkez yönetim kurulu üyesi eklenirken hata:', error)
    
    // Error tipini cast et
    const errorObj = error as Error
    
    console.error('❌ Hata detayı:', {
      name: errorObj.name,
      message: errorObj.message,
      stack: errorObj.stack
    })
    
    // MongoDB bağlantı hatası kontrolü
    if (errorObj.name === 'MongoNetworkError' || errorObj.name === 'MongoServerSelectionError') {
      return NextResponse.json(
        { success: false, message: 'Veritabanı bağlantı hatası' },
        { status: 500 }
      )
    }
    
    // Validation hatası kontrolü
    if (errorObj.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, message: 'Veri doğrulama hatası: ' + errorObj.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: 'Üye eklenemedi: ' + errorObj.message },
      { status: 500 }
    )
  }
}

