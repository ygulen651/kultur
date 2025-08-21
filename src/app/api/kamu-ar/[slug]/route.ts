import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { KamuAr } from '@/models/KamuAr'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB()
    
    const { slug } = await params
    
    // Draft içerikleri de göster (geliştirme için)
    const item = await KamuAr.findOne({ 
      slug: slug, 
      isActive: true 
    }).lean()
    
    if (!item) {
      return NextResponse.json({
        success: false,
        message: 'İçerik bulunamadı'
      }, { status: 404 })
    }
    
    // Görüntülenme sayısını artır
    if (Array.isArray(item)) {
      if (item.length > 0) {
        await KamuAr.findByIdAndUpdate(item[0]._id, { $inc: { viewCount: 1 } })
      }
    } else {
      await KamuAr.findByIdAndUpdate(item._id, { $inc: { viewCount: 1 } })
    }
    
    return NextResponse.json({
      success: true,
      data: item
    })
  } catch (error) {
    console.error('Kamu-AR getirme hatası:', error)
    return NextResponse.json({
      success: false,
      message: 'Veri getirilemedi'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB()
    
    const { slug } = await params
    
    // FormData olarak gelen veriyi işle
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const newSlug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const featured = formData.get('featured') === 'true'
    const publishDate = formData.get('publishDate') as string
    
    if (!title || !excerpt || !content) {
      return NextResponse.json({
        success: false,
        message: 'Gerekli alanlar eksik: title, excerpt, content'
      }, { status: 400 })
    }
    
    // Mevcut içeriği al
    const existingItem = await KamuAr.findOne({ slug: slug })
    if (!existingItem) {
      return NextResponse.json({
        success: false,
        message: 'İçerik bulunamadı'
      }, { status: 404 })
    }
    
    // Yeni eklenen görseller işleme
    const newImageFiles = formData.getAll('newImages') as File[]
    const uploadedImages: string[] = []
    
    for (const imageFile of newImageFiles) {
      if (imageFile && imageFile.size > 0) {
        try {
          const arrayBuffer = await imageFile.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          const { uploadToCloudinary } = await import('@/lib/cloudinary')
          const uploadResult: any = await uploadToCloudinary(buffer, {
            folder: 'kamu-ar/images',
            public_id: `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            transformation: [
              { width: 800, height: 600, crop: 'fill' },
              { quality: 'auto' }
            ]
          })
          
          uploadedImages.push(uploadResult.secure_url)
        } catch (uploadError) {
          console.error('Ek görsel yükleme hatası:', uploadError)
        }
      }
    }
    
    // Yeni eklenen dosya işleme
    const newFileFile = formData.get('newFile') as File
    let newFileUrl = existingItem.file
    let newFileName = existingItem.fileName
    let newFileType = existingItem.fileType
    
    if (newFileFile && newFileFile.size > 0) {
      try {
        const arrayBuffer = await newFileFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        const { uploadToCloudinary } = await import('@/lib/cloudinary')
        const uploadResult: any = await uploadToCloudinary(buffer, {
          folder: 'kamu-ar/files',
          public_id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          resource_type: 'raw'
        })
        
        newFileUrl = uploadResult.secure_url
        newFileName = newFileFile.name
        newFileType = newFileFile.type
      } catch (uploadError) {
        console.error('Ek dosya yükleme hatası:', uploadError)
      }
    }
    
    // Slug değişikliği varsa benzersizlik kontrolü
    if (newSlug && newSlug !== slug) {
      const existingSlug = await KamuAr.findOne({ slug: newSlug.trim().toLowerCase() })
      if (existingSlug) {
        return NextResponse.json({
          success: false,
          message: 'Bu slug zaten kullanılıyor'
        }, { status: 400 })
      }
    }
    
    // Tags işleme
    const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : existingItem.tags
    
    // Güncelleme verisi
    const updateData: any = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category || 'Genel',
      tags: processedTags,
      isFeatured: featured,
      file: newFileUrl,
      fileName: newFileName,
      fileType: newFileType
    }
    
    if (newSlug) {
      updateData.slug = newSlug.trim().toLowerCase()
    }
    
    if (publishDate) {
      updateData.publishDate = new Date(publishDate)
    }
    
    // Yeni görseller varsa mevcut görsellere ekle
    if (uploadedImages.length > 0) {
      updateData.images = [...(existingItem.images || []), ...uploadedImages]
    }
    
    const updatedItem = await KamuAr.findOneAndUpdate(
      { slug: slug },
      updateData,
      { new: true, runValidators: true }
    )
    
    return NextResponse.json({
      success: true,
      message: 'Kamu-AR içeriği güncellendi',
      data: updatedItem
    })
  } catch (error) {
    console.error('Kamu-AR güncelleme hatası:', error)
    return NextResponse.json({
      success: false,
      message: 'İçerik güncellenemedi'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await connectDB()
    
    const { slug } = await params
    
    const deletedItem = await KamuAr.findOneAndDelete({ slug: slug })
    
    if (!deletedItem) {
      return NextResponse.json({
        success: false,
        message: 'İçerik bulunamadı'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Kamu-AR içeriği silindi',
      data: deletedItem
    })
  } catch (error) {
    console.error('Kamu-AR silme hatası:', error)
    return NextResponse.json({
      success: false,
      message: 'İçerik silinemedi'
    }, { status: 500 })
  }
}


