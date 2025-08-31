import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Slider } from '@/models/Slider'
import { toErrorLike } from '@/lib/errors'
import { uploadImageToBlob, toSafeImageFilename } from "@/lib/blobUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    const normalized = sliders.map(row => {
      const imageUrl = row.imageUrl || row.image || "";
      return { ...row.toObject(), imageUrl };
    });
    return NextResponse.json({
      ok: true,
      items: normalized,
      total: normalized.length
    }, { status: 200 });
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error("GET /api/sliders error:", e);
    return NextResponse.json({
      ok: false,
      error: 'Sliderlar yüklenemedi.',
      details: e.message,
      code: e.code,
      meta: e.meta
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await connectDB();
  try {
    // FormData olarak al (görsel yükleme için)
    const formData = await request.formData();
    
    const title = String(formData.get('title') || '').trim();
    if (!title) {
      return NextResponse.json({
        ok: false,
        error: 'Başlık gereklidir.'
      }, { status: 400 });
    }

    // Görsel yükleme işlemi
    let imageUrl = '';
    let imageFilename = '';
    const imageFile = formData.get('image');
    
    if (imageFile && imageFile instanceof File) {
      try {
        console.log('Slider API - Görsel yükleniyor:', imageFile.name, imageFile.size);
        
        // Güvenli dosya adı oluştur
        const safeName = toSafeImageFilename(imageFile.name);
        
        // Vercel Blob'a yükle
        const uploadResult = await uploadImageToBlob(imageFile, safeName, "sendika/sliders");
        
        imageUrl = uploadResult.url;
        imageFilename = safeName;
        
        console.log('Slider API - Görsel başarıyla yüklendi:', { imageUrl, imageFilename });
      } catch (uploadError) {
        console.error('Slider API - Görsel yükleme hatası:', uploadError);
        return NextResponse.json({ 
          ok: false, 
          error: 'Görsel yüklenemedi', 
          message: uploadError instanceof Error ? uploadError.message : "Bilinmeyen hata"
        }, { status: 500 });
      }
    } else {
      // Manuel URL girişi
      imageUrl = String(formData.get('imageUrl') || '');
      if (!imageUrl) {
        return NextResponse.json({
          ok: false,
          error: 'Görsel gereklidir.'
        }, { status: 400 });
      }
    }

    const slider = await Slider.create({
      title,
      subtitle: String(formData.get('subtitle') || ''),
      description: String(formData.get('description') || ''),
      link: String(formData.get('link') || ''),
      buttonText: String(formData.get('buttonText') || ''),
      buttonLink: String(formData.get('buttonLink') || ''),
      order: parseInt(String(formData.get('order') || '0')),
      isActive: formData.get('isActive') === 'true',
      backgroundColor: String(formData.get('backgroundColor') || '#000000'),
      textColor: String(formData.get('textColor') || '#ffffff'),
      imageUrl,
      imageFilename
    });
    
    return NextResponse.json({
      ok: true,
      item: slider
    }, { status: 200 });
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error("POST /api/sliders error:", e);
    return NextResponse.json({
      ok: false,
      error: 'Slider eklenemedi.',
      details: e.message,
      code: e.code,
      meta: e.meta
    }, { status: 400 });
  }
}
