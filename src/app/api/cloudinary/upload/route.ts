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

  try {
    const result: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder }, (err, res) => {
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
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Upload failed' }, { status: 500 });
  }
}
