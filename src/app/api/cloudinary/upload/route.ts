import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Body size limitini tamamen kaldır - büyük video dosyaları için
export const maxDuration = 300; // 5 dakika

export async function POST(req: Request) {
  try {
    console.log('Starting file upload...');
    
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) {
      console.error('No file provided');
      return NextResponse.json({ ok: false, error: 'file missing' }, { status: 400 });
    }

    console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Dosya boyutu kontrolü
    if (file.size === 0) {
      console.error('File is empty');
      return NextResponse.json({ ok: false, error: 'File is empty' }, { status: 400 });
    }

    // Dosya türü kontrolü
    if (!file.type) {
      console.error('File type not detected');
      return NextResponse.json({ ok: false, error: 'File type not detected' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'uploads';
    
    console.log('Buffer size:', buffer.length, 'Folder:', folder);

    // Dosya türüne göre resource_type belirle
    let resourceType: 'auto' | 'raw' | 'image' | 'video' = 'auto';
    if (file.type.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.type.startsWith('video/')) {
      resourceType = 'video';
    } else if (file.type.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary audio için video kullanır
    } else if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text')) {
      resourceType = 'raw';
    } else {
      resourceType = 'auto';
    }

    console.log('Resource type:', resourceType);

    // Büyük dosyalar için streaming upload
    if (file.size > 100 * 1024 * 1024) { // 100MB üstü
      console.log('Large file detected, using streaming upload...');
      
      const result: any = await new Promise((resolve, reject) => {
        const uploadOptions: any = { 
          folder,
          resource_type: resourceType,
          chunk_size: 10000000, // 10MB chunk size
          timeout: 300000, // 5 dakika timeout
        };
        
        if (resourceType === 'video') {
          uploadOptions.eager = [
            { width: 1280, height: 720, crop: 'scale' },
            { width: 854, height: 480, crop: 'scale' }
          ];
          uploadOptions.eager_async = true;
        }
        
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
      
      const response = {
        ok: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
      };
      
      console.log('Sending response:', response);
      return NextResponse.json(response);
    } else {
      // Normal upload için
      console.log('Using normal upload...');
      
      const result: any = await new Promise((resolve, reject) => {
        const uploadOptions: any = { 
          folder,
          resource_type: resourceType,
        };
        
        // Raw dosyalar için format kısıtlaması
        if (resourceType === 'raw') {
          uploadOptions.allowed_formats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
        }
        
        // Video dosyaları için özel ayarlar
        if (resourceType === 'video') {
          uploadOptions.chunk_size = 6000000; // 6MB chunk size
          uploadOptions.eager = [
            { width: 1280, height: 720, crop: 'scale' },
            { width: 854, height: 480, crop: 'scale' }
          ];
          uploadOptions.eager_async = true;
        }
        
        console.log('Upload options:', uploadOptions);
        
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
          if (err) {
            console.error('Cloudinary upload stream error:', err);
            reject(err);
          } else {
            console.log('Upload successful:', res?.public_id);
            resolve(res);
          }
        });
        
        stream.end(buffer);
      });
      
      console.log('Upload successful:', result.public_id);
      
      const response = {
        ok: true,
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
      };
      
      console.log('Sending response:', response);
      return NextResponse.json(response);
    }
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    
    // Hata detaylarını logla
    if (error.http_code) {
      console.error('Cloudinary HTTP error:', error.http_code, error.message);
    }
    if (error.response) {
      console.error('Cloudinary response error:', error.response);
    }
    
    const errorResponse = {
      ok: false, 
      error: error?.message || 'Upload failed',
      details: error?.toString(),
      httpCode: error?.http_code,
      response: error?.response
    };
    
    console.log('Sending error response:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
