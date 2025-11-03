import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Notification } from '@/models/Notification'
import { toErrorLike } from '@/lib/errors'

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
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('Bildirim getirilirken hata:', e);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Bildirim yüklenemedi',
        details: e.message,
        code: e.code,
        meta: e.meta
      },
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
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('Bildirim güncellenirken hata:', e);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Bildirim güncellenemedi',
        details: e.message,
        code: e.code,
        meta: e.meta
      },
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
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('Bildirim silinirken hata:', e);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Bildirim silinemedi',
        details: e.message,
        code: e.code,
        meta: e.meta
      },
      { status: 500 }
    )
  }
}
