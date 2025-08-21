import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Slider } from '@/models/Slider'
import { toErrorLike } from '@/lib/errors'

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  await connectDB();
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    const normalized = sliders.map(row => {
      const imageFilename = row.imageFilename || row.image?.filename || row.filename || "";
      return { ...row.toObject(), imageFilename };
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
    const body = await request.json();
    const imageFilename = body.imageFilename || body.filename || body.image?.filename || "";
    const slider = await Slider.create({
      title: body.title,
      link: body.link,
      order: body.order,
      isActive: body.isActive,
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
