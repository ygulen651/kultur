import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";

export const runtime = 'nodejs'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const doc = await Announcement.findById(id)
  if (!doc) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true, item: doc })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const body = await req.json().catch(() => ({}))
    const { id } = await params;
    const doc = await Announcement.findById(id)
    if (!doc) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })

    if (typeof body.title === 'string') doc.title = body.title.trim()
    if (typeof body.content === 'string') doc.content = body.content
    if (typeof body.isFeatured === 'boolean') doc.isFeatured = body.isFeatured
    if (body.publishedAt !== undefined) doc.publishedAt = body.publishedAt || null
    if (body.image) doc.imageFilename = body.image

    await doc.save()
    return NextResponse.json({ ok: true, id: String(doc._id), item: doc })
  } catch (e: any) {
    console.error('PUT /api/admin/announcements/[id] error:', e)
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  try {
    const { id } = await params;
    const doc = await Announcement.findById(id)
    if (!doc) return NextResponse.json({ ok: false, error: 'not found' }, { status: 404 })
    await doc.deleteOne()
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('DELETE /api/admin/announcements/[id] error:', e)
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}




