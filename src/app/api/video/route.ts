import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Video } from "@/models/Video";

// YouTube URL'sinden video ID'sini çıkar
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// YouTube embed URL'si oluştur
function createEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

// Slug oluştur
function toSlug(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const revalidate = 0;

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

    if (!body.title || !body.videoUrl) {
      return NextResponse.json({
        ok: false,
        error: "Başlık ve videoUrl zorunlu"
      }, { status: 400 });
    }

    // YouTube URL'si kontrolü
    if (body.originalUrl) {
      const youtubeId = extractYouTubeId(body.originalUrl);
      if (!youtubeId) {
        return NextResponse.json({
          ok: false,
          error: "Geçersiz YouTube URL'si"
        }, { status: 400 });
      }
      
      // Embed URL ve thumbnail otomatik oluştur
      body.videoUrl = createEmbedUrl(youtubeId);
      body.youtubeId = youtubeId;
      body.thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
    }

    let slug = toSlug(body.title);
    let tryCount = 0;
    while (await Video.exists({ slug })) {
      slug = toSlug(body.title) + "-" + Math.random().toString(36).slice(2, 6);
      if (++tryCount > 3) break;
    }

    const videoData = {
      title: body.title.trim(),
      videoUrl: body.videoUrl,
      thumbnailUrl: body.thumbnailUrl,
      youtubeId: body.youtubeId,
      originalUrl: body.originalUrl,
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
