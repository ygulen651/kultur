import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { toErrorLike } from '@/lib/errors';
import { uploadImageToBlob, toSafeImageFilename } from "@/lib/blobUpload";

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const items = await Announcement.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ ok: true, items, total: items.length })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('GET /api/admin/announcements error:', e);
    return NextResponse.json({ ok: false, error: e.message, code: e.code, meta: e.meta }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    // FormData olarak al (görsel yükleme için)
    const formData = await req.formData();
    
    const title = String(formData.get('title') || '').trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 })
    }

    // Görsel yükleme işlemi
    let imageData = { url: '', filename: '' };
    const imageFile = formData.get('image');
    
    if (imageFile && imageFile instanceof File) {
      try {
        console.log('Duyuru API - Görsel yükleniyor:', imageFile.name, imageFile.size);
        
        // Güvenli dosya adı oluştur
        const safeName = toSafeImageFilename(imageFile.name);
        
        // Vercel Blob'a yükle
        const uploadResult = await uploadImageToBlob(imageFile, safeName, "sendika/duyurular");
        
        imageData = {
          url: uploadResult.url,
          filename: safeName
        };
        
        console.log('Duyuru API - Görsel başarıyla yüklendi:', imageData);
      } catch (uploadError) {
        console.error('Duyuru API - Görsel yükleme hatası:', uploadError);
        console.error('🔍 Upload error details:', {
          message: uploadError instanceof Error ? uploadError.message : 'Unknown error',
          code: (uploadError as any)?.code,
          status: (uploadError as any)?.status,
          stack: uploadError instanceof Error ? uploadError.stack : 'No stack'
        });
        return NextResponse.json({ 
          ok: false, 
          error: 'Görsel yüklenemedi', 
          message: uploadError instanceof Error ? uploadError.message : "Bilinmeyen hata"
        }, { status: 500 });
      }
    }

    // Ek görseller yükleme
    const additionalImages: string[] = [];
    const imageFiles = formData.getAll('images');
    console.log('Duyuru API - Ek görseller sayısı:', imageFiles.length);
    
    for (const imgFile of imageFiles) {
      if (imgFile instanceof File) {
        try {
          console.log('Duyuru API - Ek görsel yükleniyor:', imgFile.name, imgFile.size);
          
          const safeName = toSafeImageFilename(imgFile.name);
          const uploadResult = await uploadImageToBlob(imgFile, safeName, "sendika/duyurular");
          
          additionalImages.push(uploadResult.url);
          console.log('Duyuru API - Ek görsel yüklendi:', uploadResult.url);
        } catch (uploadError) {
          console.error('Duyuru API - Ek görsel yükleme hatası:', uploadError);
          return NextResponse.json({ 
            ok: false, 
            error: 'Ek görsel yüklenemedi', 
            message: uploadError instanceof Error ? uploadError.message : "Bilinmeyen hata"
          }, { status: 500 });
        }
      }
    }

    // Ek dosyalar yükleme
    const additionalFiles: Array<{
      name: string;
      url: string;
      filename: string;
    }> = [];
    const fileFiles = formData.getAll('files');
    console.log('Duyuru API - Ek dosyalar sayısı:', fileFiles.length);
    
    for (const file of fileFiles) {
      if (file instanceof File) {
        try {
          console.log('Duyuru API - Ek dosya yükleniyor:', file.name, file.size);
          
          // Vercel Blob'a yükle
          const safeName = toSafeImageFilename(file.name);
          const uploadResult = await uploadImageToBlob(file, safeName, "sendika/duyurular");
          
          additionalFiles.push({
            name: file.name,
            url: uploadResult.url,
            filename: safeName
          });
          
          console.log('Duyuru API - Ek dosya yüklendi:', uploadResult.url);
        } catch (uploadError) {
          console.error('Duyuru API - Ek dosya yükleme hatası:', uploadError);
          return NextResponse.json({ 
            ok: false, 
            error: 'Ek dosya yüklenemedi', 
            message: uploadError instanceof Error ? uploadError.message : "Bilinmeyen hata"
          }, { status: 500 });
        }
      }
    }

    // JSON verilerini al
    const content = String(formData.get('content') || '');
    const excerpt = String(formData.get('excerpt') || '');
    const featured = formData.get('featured') === 'true';
    const status = String(formData.get('status') || 'draft');
    const publishDate = formData.get('publishDate') ? new Date(String(formData.get('publishDate'))) : new Date();
    const category = String(formData.get('category') || 'Genel');
    const author = String(formData.get('author') || 'Anonim');
    const tags = String(formData.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean);

    const created = await Announcement.create({
      title,
      content,
      excerpt,
      featured,
      status,
      publishDate,
      category,
      author,
      tags,
      featuredImageUrl: imageData.url,
      imageFilename: imageData.filename,
      images: additionalImages,
      files: additionalFiles,
      fields: {
        image: {
          url: imageData.url,
          filename: imageData.filename,
        },
      },
    })
    
    console.log('Duyuru API - Duyuru oluşturuldu:', created._id);
    return NextResponse.json({ ok: true, id: String(created._id), item: created })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('POST /api/admin/announcements error:', e);
    return NextResponse.json({ ok: false, error: e.message, code: e.code, meta: e.meta }, { status: 500 })
  }
}




