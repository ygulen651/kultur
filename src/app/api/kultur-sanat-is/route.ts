import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { KulturSanatIsModel } from '@/models/KulturSanatIs'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('c')
    const search = searchParams.get('q')
    const tag = searchParams.get('t')
    const featured = searchParams.get('featured')
    
    let query: any = { isActive: true }
    
    if (status) query.status = status
    if (category && category !== 'all') query.category = category
    if (tag && tag !== 'all') query.tags = tag
    if (featured === 'true') query.isFeatured = true
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    const items = await KulturSanatIsModel.find(query)
      .sort({ isFeatured: -1, publishDate: -1 })
      .select('_id title slug excerpt category tags coverImage publishDate author status isFeatured readTime viewCount')
      .lean()
    
    return NextResponse.json({
      success: true,
      data: items
    })
  } catch (error) {
    console.error('Kültür Sanat-İş getirme hatası:', error)
    return NextResponse.json({
      success: false,
      message: 'Veriler getirilemedi'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // FormData olarak gelen veriyi işle
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const content = formData.get('content') as string
    const category = formData.get('category') as string
    const tags = formData.get('tags') as string
    const coverImageUrl = formData.get('coverImageUrl') as string
    const coverImageFile = formData.get('coverImageFile') as File
    const author = formData.get('author') as string
    const status = formData.get('status') as string
    const featured = formData.get('featured') === 'true'
    const readTime = parseInt(formData.get('readTime') as string) || 5
    
    if (!title || !excerpt || !content || !author) {
      return NextResponse.json({
        success: false,
        message: 'Gerekli alanlar eksik: title, excerpt, content, author'
      }, { status: 400 })
    }
    
    // Kapak görseli işleme
    let coverImage = coverImageUrl
    
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        const arrayBuffer = await coverImageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        const uploadResult: any = await uploadToCloudinary(buffer, {
          folder: 'kultur-sanat-is',
          public_id: `cover_${Date.now()}`,
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        })
        
        coverImage = uploadResult.secure_url
      } catch (uploadError) {
        console.error('Kapak görseli yükleme hatası:', uploadError)
        return NextResponse.json({
          success: false,
          message: 'Kapak görseli yüklenemedi'
        }, { status: 500 })
      }
    }
    
    if (!coverImage) {
      return NextResponse.json({
        success: false,
        message: 'Kapak görseli gerekli'
      }, { status: 400 })
    }
    
    // Ek görseller işleme
    const imageFiles = formData.getAll('images') as File[]
    const uploadedImages: string[] = []
    
    for (const imageFile of imageFiles) {
      if (imageFile && imageFile.size > 0) {
        try {
          const arrayBuffer = await imageFile.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          const uploadResult: any = await uploadToCloudinary(buffer, {
            folder: 'kultur-sanat-is/images',
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
    
    // Ek dosya işleme
    const fileFile = formData.get('file') as File
    let fileUrl = ''
    let fileName = ''
    let fileType = ''
    
    if (fileFile && fileFile.size > 0) {
      try {
        const arrayBuffer = await fileFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        const uploadResult: any = await uploadToCloudinary(buffer, {
          folder: 'kultur-sanat-is/files',
          public_id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          resource_type: 'raw'
        })
        
        fileUrl = uploadResult.secure_url
        fileName = fileFile.name
        fileType = fileFile.type
      } catch (uploadError) {
        console.error('Ek dosya yükleme hatası:', uploadError)
      }
    }
    
    // Slug oluşturma
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    // Slug benzersizlik kontrolü
    const existingSlug = await KulturSanatIsModel.findOne({ slug: finalSlug })
    if (existingSlug) {
      return NextResponse.json({
        success: false,
        message: 'Bu slug zaten kullanılıyor'
      }, { status: 400 })
    }
    
    // Tags işleme
    const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    const newItem = new KulturSanatIsModel({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category || 'Genel',
      tags: processedTags,
      coverImage,
      images: uploadedImages,
      file: fileUrl,
      fileName,
      fileType,
      author: author.trim(),
      status: status || 'draft',
      isFeatured: featured,
      readTime,
      publishDate: new Date()
    })
    
    await newItem.save()
    
    return NextResponse.json({
      success: true,
      message: 'Kültür Sanat-İş içeriği oluşturuldu',
      data: newItem
    })
  } catch (error) {
    console.error('Kültür Sanat-İş oluşturma hatası:', error)
    return NextResponse.json({
      success: false,
      message: 'İçerik oluşturulamadı: ' + (error as Error).message
    }, { status: 500 })
  }
}
