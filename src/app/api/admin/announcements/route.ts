import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const items = await Announcement.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ ok: true, items, total: items.length })
  } catch (e: any) {
    console.error('GET /api/admin/announcements error:', e)
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.json().catch(() => ({}))
    const title = (body.title || '').trim()
    if (!title) {
      return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 })
    }
    const created = await Announcement.create({
      title,
      content: body.content || '',
      isFeatured: !!body.isFeatured,
      publishedAt: body.publishedAt || null,
      fields: {
        image: body.image || { url: '', publicId: '' },
      },
    })
    return NextResponse.json({ ok: true, id: String(created._id), item: created })
  } catch (e: any) {
    console.error('POST /api/admin/announcements error:', e)
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}




