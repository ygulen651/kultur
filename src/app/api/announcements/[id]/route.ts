import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;
  const doc = await Announcement.findById(id);
  if (!doc) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
  return NextResponse.json({ ok:true, item: doc });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;
  const body = await req.json();
  const update: any = {};
  if ('publishedAt' in body) update.publishedAt = body.publishedAt;
  if ('title' in body) update.title = body.title;
  if ('content' in body) update.content = body.content;
  if ('isFeatured' in body) update.isFeatured = body.isFeatured;

  const doc = await Announcement.findByIdAndUpdate(id, update, { new: true });
  if (!doc) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
  return NextResponse.json({ ok:true, item: doc });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;
  await Announcement.findByIdAndDelete(id);
  return NextResponse.json({ ok:true });
}
