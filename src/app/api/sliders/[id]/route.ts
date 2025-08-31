import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db';
import { Slider } from '@/models/Slider';
import { toErrorLike } from '@/lib/errors';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    
    const slider = await Slider.findById(id);
    if (!slider) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Slider bulunamadı' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      ok: true, 
      item: slider 
    });
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error("❌ GET /api/sliders/[id] error:", e);
    return NextResponse.json({ 
      ok: false, 
      error: 'Slider yüklenemedi.',
      details: e.message 
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    
    // Request detaylarını logla
    console.log('🔍 PUT /api/sliders/[id] - Request details:');
    console.log('  - Method:', req.method);
    console.log('  - URL:', req.url);
    console.log('  - ID:', id);
    console.log('  - Headers:');
    req.headers.forEach((value, key) => {
      console.log(`    ${key}: ${value}`);
    });
    
    // Content-Type kontrolü
    const contentType = req.headers.get('content-type') || '';
    console.log('🔍 PUT /api/sliders/[id] - Content-Type:', contentType);
    
    let updateData: any;
    
    if (contentType.includes('application/json')) {
      updateData = await req.json();
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      updateData = {};
      formData.forEach((value, key) => {
        updateData[key] = value;
      });
    } else {
      return NextResponse.json({
        ok: false,
        error: 'Geçersiz Content-Type. application/json bekleniyor.'
      }, { status: 400 });
    }
    
    console.log('📝 Update data:', updateData);
    
    const updatedSlider = await Slider.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!updatedSlider) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Slider bulunamadı' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      ok: true, 
      item: updatedSlider 
    });
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error("❌ PUT /api/sliders/[id] error:", e);
    return NextResponse.json({ 
      ok: false, 
      error: 'Slider güncellenemedi.',
      details: e.message 
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const deleted = await Slider.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ ok: false, error: 'Slider bulunamadı' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Silme hatası' }, { status: 500 });
  }
}
