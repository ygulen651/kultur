import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";

export const revalidate = 0;

function computeCover(it: any): string {
  const raw =
    it?.fields?.image?.url ||
    it?.featuredImageUrl ||
    it?.image?.url ||
    it?.image?.filename ||
    it?.imageFilename ||
    it?.fields?.image?.filename ||
    "";
  const v = String(raw || "").trim().replace(/^C:\\fakepath\\/, "");
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return v.startsWith("/uploads/") ? v : `/uploads/${v}`;
}

export async function GET(req: NextRequest) {
  await connectDB();
  const docs = await Announcement.find({}).sort({ createdAt: -1 }).lean();
  const items = docs.map((it: any) => ({ ...it, cover: computeCover(it) }));
  return NextResponse.json({ ok: true, items, total: items.length });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    let body: any = {}
    const ctype = req.headers.get('content-type') || ''
    if (ctype.includes('application/json')) {
      body = await req.json().catch(() => ({}))
    } else if (ctype.includes('multipart/form-data')) {
      const form = await req.formData()
      const fromForm: any = {}
      // FormData'yı manuel olarak işle - TypeScript uyumlu
      try {
        // FormData'yı JSON olarak işlemeye çalış
        const formDataObj: any = {}
        // @ts-expect-error - FormData methods for runtime
        for (const [key, value] of form.entries()) {
          formDataObj[key] = value
        }
        body = formDataObj
      } catch (e) {
        // Fallback: basit form parsing
        body = {}
      }
      if (typeof body.imageUrl === 'string' && !body.image) {
        body.image = { url: body.imageUrl, publicId: body.publicId || '' }
      }
    } else {
      try { body = await req.json() } catch { body = {} }
    }
    const rawTitle = body.title ?? body.name ?? body.baslik ?? ''
    const title = (typeof rawTitle === 'string' ? rawTitle : '').trim()
    if (!title) {
      return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 })
    }
    const created = await Announcement.create({
      title,
      content: typeof body.content === 'string' ? body.content : (body.description || ''),
      isFeatured: !!body.isFeatured,
      publishedAt: body.publishedAt || null,
      imageFilename: body.imageFilename || '',
      fields: {
        image: body.image || { url: '', publicId: '' },
        ...body.fields,
      },
    })
    return NextResponse.json({ ok: true, id: String(created._id), item: created }, { status: 201 })
  } catch (e: any) {
    console.error('POST /api/announcements error:', e)
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
