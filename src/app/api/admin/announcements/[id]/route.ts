import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { toErrorLike } from '@/lib/errors';
import { uploadImageToBlob, toSafeImageFilename } from "@/lib/blobUpload";

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const doc = await Announcement.findById(id)
  if (!doc) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true, item: doc })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    // FormData olarak al (görsel yükleme için)
    const formData = await req.formData();
    const { id } = await params;
    
    const doc = await Announcement.findById(id)
    if (!doc) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })

    // Görsel yükleme işlemi
    const imageFile = formData.get('image');
    if (imageFile && imageFile instanceof File) {
      try {
        console.log('Duyuru Düzenleme API - Görsel yükleniyor:', imageFile.name, imageFile.size);
        
        // Güvenli dosya adı oluştur
        const safeName = toSafeImageFilename(imageFile.name);
        
        // Vercel Blob'a yükle
        const uploadResult = await uploadImageToBlob(imageFile, safeName, "sendika/duyurular");
        
        // Görsel bilgilerini güncelle
        doc.featuredImageUrl = uploadResult.url;
        doc.imageFilename = safeName;
        
        // fields undefined kontrolü
        if (!doc.fields) {
          doc.fields = {};
        }
        doc.fields.image = {
          url: uploadResult.url,
          filename: safeName,
        };
        
        console.log('Duyuru Düzenleme API - Görsel başarıyla yüklendi:', uploadResult.url);
      } catch (uploadError) {
        console.error('Duyuru Düzenleme API - Görsel yükleme hatası:', uploadError);
        return NextResponse.json({ 
          ok: false, 
          error: 'Görsel yüklenemedi', 
          message: uploadError instanceof Error ? uploadError.message : "Bilinmeyen hata"
        }, { status: 500 });
      }
    }

    // Diğer alanları güncelle
    if (typeof formData.get('title') === 'string') doc.title = String(formData.get('title')).trim()
    if (typeof formData.get('content') === 'string') doc.content = String(formData.get('content'))
    if (typeof formData.get('excerpt') === 'string') doc.excerpt = String(formData.get('excerpt'))
    if (formData.get('featured') !== null) doc.featured = formData.get('featured') === 'true'
    if (formData.get('publishDate') !== null) doc.publishDate = formData.get('publishDate') ? new Date(String(formData.get('publishDate'))) : undefined
    if (typeof formData.get('status') === 'string') {
      const status = String(formData.get('status'));
      if (['draft', 'published', 'archived'].includes(status)) {
        doc.status = status as 'draft' | 'published' | 'archived';
      }
    }
    if (typeof formData.get('category') === 'string') doc.category = String(formData.get('category'))
    if (typeof formData.get('author') === 'string') doc.author = String(formData.get('author'))
    if (formData.get('tags') !== null) {
      const tags = String(formData.get('tags')).split(',').map(t => t.trim()).filter(Boolean);
      doc.tags = tags;
    }

    await doc.save()
    console.log('Duyuru Düzenleme API - Duyuru güncellendi:', doc._id);
    return NextResponse.json({ ok: true, id: String(doc._id), item: doc })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('PUT /api/admin/announcements/[id] error:', e);
    return NextResponse.json({ ok: false, error: e.message, code: e.code, meta: e.meta }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const doc = await Announcement.findById(id)
    if (!doc) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
    await doc.deleteOne()
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('DELETE /api/admin/announcements/[id] error:', e);
    return NextResponse.json({ ok: false, error: e.message, code: e.code, meta: e.meta }, { status: 500 })
  }
}




