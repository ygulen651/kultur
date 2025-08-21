import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Management } from '@/models/Management'

export async function GET() {
  try {
    await connectDB()

    const members = await Management.find({ group: 'merkez-disiplin-kurulu' })
      .select('_id group name position bio photo email phone experience education order isActive createdAt updatedAt')
      .sort({ order: 1, name: 1 })
      .lean()

    return NextResponse.json({
      success: true,
      message: 'Merkez disiplin kurulu verileri başarıyla getirildi',
      data: members
    })
  } catch (error) {
    console.error('❌ Merkez disiplin kurulu verileri getirilemedi:', error)
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

    if (!name || !position) {
      return NextResponse.json(
        { success: false, message: 'İsim ve pozisyon zorunludur' },
        { status: 400 }
      )
    }

    const newMember = new Management({
      group: 'merkez-disiplin-kurulu',
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

    await newMember.save()

    return NextResponse.json({
      success: true,
      message: 'Merkez disiplin kurulu üyesi eklendi',
      data: newMember
    })
  } catch (error) {
    console.error('❌ Merkez disiplin kurulu üyesi eklenemedi:', error)
    return NextResponse.json(
      { success: false, message: 'Üye eklenemedi' },
      { status: 500 }
    )
  }
}

