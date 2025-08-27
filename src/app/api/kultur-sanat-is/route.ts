import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Post from '@/models/Post'
import { uploadImage, uploadPdf } from '@/lib/uploaders'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('c')
    const search = searchParams.get('q')
    const tag = searchParams.get('t')
    const featured = searchParams.get('featured')
    
    const query: any = {}
    
    if (status) query.status = status
    if (category && category !== 'all') query.category = category
    if (tag && tag !== 'all') query.tags = tag
    if (featured === 'true') query.featured = true
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    const items = await Post.find(query)
      .sort({ featured: -1, publishAt: -1, createdAt: -1 })
      .select('_id title slug excerpt category tags cover publishAt author featured')
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
    const coverImageFile = formData.get('cover') as File
    const galleryFiles = formData.getAll('gallery') as File[]
    const pdfFile = formData.get('pdf') as File
    const author = formData.get('author') as string
    const featured = formData.get('featured') === 'true'
    const publishAt = formData.get('publishAt') ? new Date(formData.get('publishAt') as string) : undefined
    
    if (!title || !content || !author) {
      return NextResponse.json({
        success: false,
        message: 'Gerekli alanlar eksik: title, content, author'
      }, { status: 400 })
    }
    
    // Kapak görseli işleme
    let cover: any = undefined
    
    if (coverImageFile && coverImageFile.size > 0) {
      try {
        cover = await uploadImage(coverImageFile, 'sendika/covers')
      } catch (uploadError) {
        console.error('Kapak görseli yükleme hatası:', uploadError)
        return NextResponse.json({
          success: false,
          message: 'Kapak görseli yüklenemedi'
        }, { status: 500 })
      }
    }
    
    // Galeri görselleri işleme
    const gallery: any[] = []
    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        try {
          const up = await uploadImage(file, 'sendika/gallery')
          gallery.push(up)
        } catch (uploadError) {
          console.error('Galeri görseli yükleme hatası:', uploadError)
        }
      }
    }
    
    // PDF dosyası işleme
    let attachmentPdf: any = undefined
    if (pdfFile && pdfFile.size > 0) {
      try {
        attachmentPdf = await uploadPdf(pdfFile, 'sendika/uploads')
      } catch (uploadError) {
        console.error('PDF yükleme hatası:', uploadError)
      }
    }
    
    // Slug oluşturma
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    // Slug benzersizlik kontrolü
    const existingSlug = await Post.findOne({ slug: finalSlug })
    if (existingSlug) {
      return NextResponse.json({
        success: false,
        message: 'Bu slug zaten kullanılıyor'
      }, { status: 400 })
    }
    
    // Tags işleme
    const processedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
    
    const newItem = new Post({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      category: category || 'Genel',
      tags: processedTags,
      cover,
      gallery,
      attachmentPdf,
      author: author.trim(),
      featured,
      publishAt
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
