import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db';
import Slider from '@/models/Slider';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  return NextResponse.json({})
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  return NextResponse.json({})
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
