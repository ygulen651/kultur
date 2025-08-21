import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Contact } from '@/models/Contact'
import { toErrorLike } from '@/lib/errors'

// GET - Tek iletişim mesajı getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const contact = await Contact.findById(id).lean()
    
    if (!contact) {
      return NextResponse.json(
        { success: false, error: 'İletişim mesajı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      contact: contact
    })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('İletişim mesajı getirilirken hata:', e);
    return NextResponse.json(
      { 
        success: false, 
        error: 'İletişim mesajı yüklenemedi',
        details: e.message,
        code: e.code,
        meta: e.meta
      },
      { status: 500 }
    )
  }
}

// PATCH - İletişim mesajı güncelle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const body = await request.json()
    
    const updatedContact = await Contact.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedContact) {
      return NextResponse.json(
        { success: false, error: 'İletişim mesajı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      contact: updatedContact
    })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('İletişim mesajı güncellenirken hata:', e);
    return NextResponse.json(
      { 
        success: false, 
        error: 'İletişim mesajı güncellenemedi',
        details: e.message,
        code: e.code,
        meta: e.meta
      },
      { status: 500 }
    )
  }
}

// DELETE - İletişim mesajı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const deletedContact = await Contact.findByIdAndDelete(id)
    
    if (!deletedContact) {
      return NextResponse.json(
        { success: false, error: 'İletişim mesajı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'İletişim mesajı başarıyla silindi'
    })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('İletişim mesajı silinirken hata:', e);
    return NextResponse.json(
      { 
        success: false, 
        error: 'İletişim mesajı silinemedi',
        details: e.message,
        code: e.code,
        meta: e.meta
      },
      { status: 500 }
    )
  }
}
