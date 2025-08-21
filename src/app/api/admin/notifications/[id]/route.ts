import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Notification } from '@/models/Notification'

// GET - Tek bildirim getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const notification = await Notification.findById(id).lean()
    
    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Bildirim bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      notification: notification
    })
  } catch (error) {
    console.error('Bildirim getirilirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Bildirim yüklenemedi' },
      { status: 500 }
    )
  }
}

// PATCH - Bildirim güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const body = await request.json()
    
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedNotification) {
      return NextResponse.json(
        { success: false, error: 'Bildirim bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      notification: updatedNotification
    })
  } catch (error) {
    console.error('Bildirim güncellenirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Bildirim güncellenemedi' },
      { status: 500 }
    )
  }
}

// DELETE - Bildirim sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const deletedNotification = await Notification.findByIdAndDelete(id)
    
    if (!deletedNotification) {
      return NextResponse.json(
        { success: false, error: 'Bildirim bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Bildirim başarıyla silindi'
    })
  } catch (error) {
    console.error('Bildirim silinirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Bildirim silinemedi' },
      { status: 500 }
    )
  }
}
