import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Document } from '@/models/Document'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const { id } = await params
    const document = await Document.findById(id).lean()
    
    if (!document) {
      return NextResponse.json(
        { success: false, error: 'Doküman bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      document: document
    })
  } catch (error) {
    console.error('Doküman getirilirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Doküman yüklenemedi' },
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
    
    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedDocument) {
      return NextResponse.json(
        { success: false, error: 'Doküman bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument
    })
  } catch (error) {
    console.error('Doküman güncellenirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Doküman güncellenemedi' },
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
    const deletedDocument = await Document.findByIdAndDelete(id)
    
    if (!deletedDocument) {
      return NextResponse.json(
        { success: false, error: 'Doküman bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Doküman başarıyla silindi'
    })
  } catch (error) {
    console.error('Doküman silinirken hata:', error)
    return NextResponse.json(
      { success: false, error: 'Doküman silinemedi' },
      { status: 500 }
    )
  }
}


