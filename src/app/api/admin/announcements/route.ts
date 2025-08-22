import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { toErrorLike } from '@/lib/errors';

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const items = await Announcement.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json({ ok: true, items, total: items.length })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('GET /api/admin/announcements error:', e);
    return NextResponse.json({ ok: false, error: e.message, code: e.code, meta: e.meta }, { status: 500 })
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
      excerpt: body.excerpt || '',
      featured: !!body.featured,
      status: body.status || 'draft',
      publishDate: body.publishDate || new Date(),
      category: body.category || 'Genel',
      author: body.author || 'Anonim',
      tags: body.tags || [],
      fields: {
        image: body.image || { url: '', publicId: '' },
      },
    })
    return NextResponse.json({ ok: true, id: String(created._id), item: created })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('POST /api/admin/announcements error:', e);
    return NextResponse.json({ ok: false, error: e.message, code: e.code, meta: e.meta }, { status: 500 })
  }
}




