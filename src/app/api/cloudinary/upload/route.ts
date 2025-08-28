import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Body size limitini tamamen kaldır - büyük video dosyaları için
export const maxDuration = 300; // 5 dakika

export async function POST(req: Request) {
  try {
    console.log('Starting video upload...');
    
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ ok:false, error:'file missing' }, { status:400 });

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Büyük dosyalar için streaming upload
    if (file.size > 100 * 1024 * 1024) { // 100MB üstü
      console.log('Large file detected, using streaming upload...');
      
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'uploads';
      
      const result: any = await new Promise((resolve, reject) => {
        const uploadOptions: any = { 
          folder,
          resource_type: 'video',
          chunk_size: 10000000, // 10MB chunk size
          timeout: 300000, // 5 dakika timeout
          eager: [
            { width: 1280, height: 720, crop: 'scale' },
            { width: 854, height: 480, crop: 'scale' }
          ],
          eager_async: true,
          eager_notification_url: undefined,
        };
        
        console.log('Upload options:', uploadOptions);
        
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
          if (err) {
            console.error('Cloudinary upload error:', err);
            reject(err);
          } else {
            console.log('Upload successful:', res?.public_id);
            resolve(res);
          }
        });
        
        // Buffer'ı parça parça yaz
        const chunkSize = 10000000; // 10MB chunks
        for (let i = 0; i < buffer.length; i += chunkSize) {
          const chunk = buffer.slice(i, i + chunkSize);
          stream.write(chunk);
        }
        stream.end();
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
    } else {
      // Normal upload için mevcut kod
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

      const result: any = await new Promise((resolve, reject) => {
        const uploadOptions: any = { 
          folder,
          resource_type: resourceType,
          allowed_formats: resourceType === 'raw' ? ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'] : undefined
        };
        
        // Video dosyaları için özel ayarlar
        if (resourceType === 'video') {
          uploadOptions.chunk_size = 6000000; // 6MB chunk size
          uploadOptions.eager = [
            { width: 1280, height: 720, crop: 'scale' },
            { width: 854, height: 480, crop: 'scale' }
          ];
          uploadOptions.eager_async = true;
          uploadOptions.eager_notification_url = undefined;
        }
        
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
          if (err) reject(err); else resolve(res);
        });
        stream.end(buffer);
      });
      
      console.log('Upload successful:', result.public_id);
      
      return NextResponse.json({
        ok: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
      });
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
