import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const doc = await Announcement.findById(id);
  if (!doc) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
  return NextResponse.json({ ok:true, item: doc });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const update: any = {};
  
  // Temel alanlar
  if ('publishedAt' in body) update.publishedAt = body.publishedAt;
  if ('title' in body) update.title = body.title;
  if ('content' in body) update.content = body.content;
  if ('excerpt' in body) update.excerpt = body.excerpt;
  if ('isFeatured' in body) update.isFeatured = body.isFeatured;
  if ('featured' in body) update.featured = body.featured;
  if ('status' in body) update.status = body.status;
  if ('category' in body) update.category = body.category;
  if ('tags' in body) update.tags = body.tags;
  if ('featuredImage' in body) update.featuredImage = body.featuredImage;
  
  // Ek görseller ve dosyalar
  if ('images' in body) update.images = body.images;
  if ('files' in body) update.files = body.files;

  const doc = await Announcement.findByIdAndUpdate(id, update, { new: true });
  if (!doc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  
  return NextResponse.json({ 
    success: true, 
    data: doc,
    message: 'Duyuru başarıyla güncellendi'
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  await Announcement.findByIdAndDelete(id);
  return NextResponse.json({ ok:true });
}
