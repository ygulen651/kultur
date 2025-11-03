import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Management } from '@/models/Management'

export async function GET() {
  try {
    console.log('🔄 MongoDB bağlantısı kuruluyor...')
    await connectDB()
    console.log('✅ MongoDB bağlantısı başarılı')
    
    // Yönetim kurulu üyelerini getir
    console.log('🔍 Yönetim kurulu üyeleri aranıyor...')
    const members = await Management.find({ group: 'yonetim-kurulu' })
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
      data: members
    })
  } catch (error) {
    console.error('❌ Yönetim kurulu verileri getirilemedi:', error)
    return NextResponse.json(
      { success: false, message: 'Veriler getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, position, bio, photo, email, phone, experience, education, order } = body
    
    console.log('📝 Yeni üye verisi:', { name, position, bio, photo, email, phone, experience, education, order })
    
    // Yeni yönetim kurulu üyesi oluştur
    const newMember = new Management({
      group: 'yonetim-kurulu',
      name: name || '',
      position: position || '',
      bio: bio || '',
      photo: photo || '',
      email: email || '',
      phone: phone || '',
      experience: experience || '',
      education: education || '',
      order: order || 999 // Son sıraya ekle
    })
    
    await newMember.save()
    console.log('✅ Yeni üye kaydedildi:', newMember)
    
    return NextResponse.json({
      success: true,
      message: 'Yönetim kurulu üyesi eklendi',
      data: newMember
    })
  } catch (error) {
    console.error('Yönetim kurulu üyesi eklenemedi:', error)
    return NextResponse.json(
      { success: false, message: 'Üye eklenemedi' },
      { status: 500 }
    )
  }
}

