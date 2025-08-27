import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('id');
    const fileName = searchParams.get('name') || 'document.pdf';

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID gerekli' }, { status: 400 });
    }

    // Cloudinary'den PDF'i stream olarak al
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'raw',
      type: 'upload'
    });

    if (!result.secure_url) {
      return NextResponse.json({ error: 'PDF bulunamadı' }, { status: 404 });
    }

    // PDF'i fetch et
    const pdfResponse = await fetch(result.secure_url);
    
    if (!pdfResponse.ok) {
      return NextResponse.json({ error: 'PDF yüklenemedi' }, { status: 500 });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // PDF'i response olarak döndür
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('PDF indirme hatası:', error);
    return NextResponse.json({ 
      error: 'PDF indirilemedi', 
      message: error instanceof Error ? error.message : 'Bilinmeyen hata' 
    }, { status: 500 });
  }
}
