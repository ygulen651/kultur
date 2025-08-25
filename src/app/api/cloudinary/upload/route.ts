import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ ok:false, error:'file missing' }, { status:400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'uploads';
  
  // Dosya türüne göre resource_type belirle
  let resourceType: 'auto' | 'raw' | 'image' | 'video' = 'auto';
  if (file.type.startsWith('image/')) {
    resourceType = 'image';
  } else if (file.type.startsWith('video/')) {
    resourceType = 'video';
  } else if (file.type.startsWith('audio/')) {
    resourceType = 'video'; // Cloudinary audio için video kullanır
  } else {
    resourceType = 'raw'; // PDF, DOC, vb. dosyalar için
  }

  try {
    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ 
        folder,
        resource_type: resourceType,
        allowed_formats: resourceType === 'raw' ? ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'] : undefined
      }, (err, res) => {
        if (err) reject(err); else resolve(res);
      });
      stream.end(buffer);
    });
    
    return NextResponse.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
