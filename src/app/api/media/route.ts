import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Media from "@/models/Media";

export const revalidate = 0;

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const items = await Media.find({}).sort({ uploadDate: -1 }).lean();
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.formData();
    const file = body.get("file") as File | null;
    const title = body.get("title") as string;
    const type = body.get("type") as string;
    if (!file || !title || !type) return NextResponse.json({ ok: false, error: "Eksik alan" }, { status: 400 });
    // Cloudinary upload burada yapılmalı, url alınmalı (örnek: /api/cloudinary/upload'a yönlendir)
    // Şimdilik url alanı zorunlu, file uploadı frontend'de yapılmalı
    const url = body.get("url") as string;
    if (!url) return NextResponse.json({ ok: false, error: "Dosya yüklenemedi" }, { status: 400 });
    const media = await Media.create({
      title,
      type,
      url,
      category: body.get("category") as string || "",
      tags: (body.get("tags") as string)?.split(",") || [],
      thumbnail: body.get("thumbnail") as string || undefined,
      size: body.get("size") as string || undefined,
      width: body.get("width") ? Number(body.get("width")) : undefined,
      height: body.get("height") ? Number(body.get("height")) : undefined,
    });
    return NextResponse.json({ ok: true, item: media });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "error" }, { status: 400 });
  }
}

