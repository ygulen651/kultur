import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Video } from "@/models/Video";
import slugify from "slugify";

export const revalidate = 0;

function toSlug(s: string) {
  return slugify(s ?? "", { lower: true, strict: true, trim: true, locale: "tr" }) || "video";
}

export async function GET(req: NextRequest) {
  await connectDB();
  const items = await Video.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, items, total: items.length });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const body = await req.json();
      if (!body.title || !body.videoUrl) {
        return NextResponse.json({ ok: false, error: "Başlık ve videoUrl zorunlu" }, { status: 400 });
      }
      // SLUG ÜRET
      let slug = toSlug(body.title);
      let tryCount = 0;
      while (await Video.exists({ slug })) {
        slug = toSlug(body.title) + "-" + Math.random().toString(36).slice(2, 6);
        if (++tryCount > 3) break;
      }
      const doc = await Video.create({
        title: body.title,
        videoUrl: body.videoUrl,
        cover: body.cover || {},
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        status: body.status || "published",
        slug,
      });
      return NextResponse.json({ ok: true, item: doc }, { status: 201 });
    }
    return NextResponse.json({ ok: false, error: "Sadece JSON destekleniyor" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "internal_error" }, { status: 500 });
  }
}
