import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { DocumentModel } from '@/models/Document'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const showPrivate = searchParams.get('showPrivate') === 'true'
    
    // Filtreleme kriterleri
    const filter: any = { isActive: true }
    
    if (category && category !== 'Tümü') {
      filter.category = category
    }
    
    if (status && status !== 'all') {
      filter.status = status
    }
    
    if (!showPrivate) {
      filter.isPrivate = false
    }
    
    // Text search
    if (search) {
      filter.$text = { $search: search }
    }
    
    const documents = await DocumentModel.find(filter)
      .select('_id title description category tags fileUrl fileName fileSize fileType mimeType status isPrivate isActive downloadCount uploadedBy order createdAt updatedAt')
      .sort({ order: 1, createdAt: -1 })
      .lean()
    
    return NextResponse.json({
      success: true,
      data: documents
    })
  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Belgeler getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const status = formData.get('status') as string
    const isPrivate = formData.get('isPrivate') === 'true'
    const uploadedBy = formData.get('uploadedBy') as string
    const file = formData.get('file') as File
    
    // Validation
    if (!title || !category || !file || !uploadedBy) {
      return NextResponse.json(
        { success: false, message: 'Başlık, kategori, dosya ve yükleyen bilgisi zorunludur' },
        { status: 400 }
      )
    }
    
    // Dosya bilgilerini al
    const fileName = file.name
    const fileSize = file.size
    const fileType = fileName.split('.').pop()?.toLowerCase() || 'unknown'
    const mimeType = file.type || 'application/octet-stream'
    
    // Dosyayı kaydet (gerçek uygulamada cloud storage kullanılır)
    // Şimdilik dosya bilgilerini kaydediyoruz
    const fileUrl = `/uploads/${Date.now()}-${fileName}` // Bu kısım gerçek dosya yükleme ile değiştirilmeli
    
    // Yeni belge oluştur
    const newDocument = new DocumentModel({
      title: title.trim(),
      description: description || '',
      category,
      tags: tags && tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      fileUrl,
      fileName,
      fileSize,
      fileType,
      mimeType,
      status: status || 'published',
      isPrivate: isPrivate || false,
      isActive: true,
      downloadCount: 0,
      uploadedBy: uploadedBy.trim(),
      order: 999
    })
    
    await newDocument.save()
    
    return NextResponse.json({
      success: true,
      message: 'Belge başarıyla eklendi',
      data: newDocument
    })
  } catch (error) {
    console.error('Document creation error:', error)
    return NextResponse.json(
      { success: false, message: 'Belge eklenemedi' },
      { status: 500 }
    )
  }
}
