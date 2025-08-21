import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Management } from '@/models/Management'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const member = await Management.findById(id).lean()
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Üye bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      member: member
    })
  } catch (error) {
    console.error('Üye getirilirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Üye yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const body = await request.json()
    
    const updatedMember = await Management.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedMember) {
      return NextResponse.json(
        { success: false, error: 'Üye bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      member: updatedMember
    })
  } catch (error) {
    console.error('Üye güncellenirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Üye güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const deletedMember = await Management.findByIdAndDelete(id)
    
    if (!deletedMember) {
      return NextResponse.json(
        { success: false, error: 'Üye bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Üye başarıyla silindi'
    })
  } catch (error) {
    console.error('Üye silinirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Üye silinemedi' },
      { status: 500 }
    )
  }
}
