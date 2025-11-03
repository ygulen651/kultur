import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Tuzuk } from '@/models/Tuzuk'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    const { id } = await params
    const tuzuk = await Tuzuk.findById(id).lean()
    
    if (!tuzuk) {
      return NextResponse.json(
        { success: false, error: 'Tüzük bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      tuzuk: tuzuk
    })
  } catch (error) {
    console.error('Tüzük getirilirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Tüzük yüklenemedi' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    const { id } = await params
    const body = await request.json()
    
    const updatedTuzuk = await Tuzuk.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedTuzuk) {
      return NextResponse.json(
        { success: false, error: 'Tüzük bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      tuzuk: updatedTuzuk
    })
  } catch (error) {
    console.error('Tüzük güncellenirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Tüzük güncellenemedi' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    
    const { id } = await params
    const deletedTuzuk = await Tuzuk.findByIdAndDelete(id)
    
    if (!deletedTuzuk) {
      return NextResponse.json(
        { success: false, error: 'Tüzük bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Tüzük başarıyla silindi'
    })
  } catch (error) {
    console.error('Tüzük silinirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Tüzük silinemedi' },
      { status: 500 }
    )
  }
}
