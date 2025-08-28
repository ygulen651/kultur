import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Video } from "@/models/Video";
import slugify from "slugify";

export const revalidate = 0;

function toSlug(s: string) {
  return slugify(s ?? "", { lower: true, strict: true, trim: true, locale: "tr" }) || "video";
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const items = await Video.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, items, total: items.length });
  } catch (error) {
    console.error("GET /api/video error:", error);
    return NextResponse.json({ ok: false, error: "Videolar yüklenemedi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Request body'yi güvenli şekilde parse et
    let body;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        return NextResponse.json({ ok: false, error: "Boş request body" }, { status: 400 });
      }
      
      body = JSON.parse(bodyText);
      console.log("Video API - Received data:", body);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json({ ok: false, error: "Geçersiz JSON formatı" }, { status: 400 });
    }
    
    // Validasyon
    if (!body.title || !body.videoUrl) {
      return NextResponse.json({ 
        ok: false, 
        error: "Başlık ve videoUrl zorunlu" 
      }, { status: 400 });
    }
    
    // SLUG ÜRET
    let slug = toSlug(body.title);
    let tryCount = 0;
    while (await Video.exists({ slug })) {
      slug = toSlug(body.title) + "-" + Math.random().toString(36).slice(2, 6);
      if (++tryCount > 3) break;
    }
    
    const videoData = {
      title: body.title.trim(),
      videoUrl: body.videoUrl,
      cover: body.cover || {},
      publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      status: body.status || "published",
      slug,
    };
    
    const doc = await Video.create(videoData);
    console.log("Video created:", doc);

    return NextResponse.json({ 
      ok: true, 
      item: doc,
      message: "Video başarıyla oluşturuldu"
    }, { status: 201 });
    
  } catch (err: any) {
    console.error("POST /api/video error:", err);
    
    if (err?.code === 11000 && err?.keyPattern?.slug) {
      return NextResponse.json(
        { ok: false, error: "Aynı başlıktan oluşan slug zaten var." },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: "Sunucu hatası",
      message: err?.message || "Bilinmeyen hata"
    }, { status: 500 });
  }
}
