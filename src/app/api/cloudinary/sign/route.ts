import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'uploads';

  // İmzada sadece güvenli parametreleri kullan
  const paramsToSign: Record<string, any> = {
    timestamp,
    folder,
  };

  // opsiyonel: eager transformations vb. eklenebilir
  const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
