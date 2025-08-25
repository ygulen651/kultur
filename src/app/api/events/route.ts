import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event } from "@/models/Event";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function pickCover(ev: any): string {
  return (
    ev?.image?.url ||
    ev?.featuredImageUrl ||
    ev?.cover ||
    ev?.computedCover ||
    ""
  );
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const upcoming = searchParams.get('upcoming') === 'true';
    
    // Status filtresini kaldır - tüm etkinlikleri getir
    const query: Record<string, unknown> = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category) query.category = category;
    if (upcoming) {
      query.$or = [
        { startDate: { $gte: new Date() } },
        { date: { $gte: new Date() } }
      ];
    }
    
    const events = await Event.find(query)
      .sort({ date: 1, startDate: 1, createdAt: -1 })
      .limit(limit)
      .lean();
    
    const items = events.map((event: Record<string, unknown>) => ({
      ...event,
      cover: pickCover(event),
      computedCover: pickCover(event)
    }));
    
    return NextResponse.json({ 
      success: true, 
      ok: true,
      items,
      count: items.length 
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/events error:', errorMessage);
    return NextResponse.json({ 
      success: false, 
      error: 'FETCH_FAILED',
      message: errorMessage
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 POST /api/events başladı");
    await connectDB();
    console.log("✅ MongoDB bağlantısı başarılı");
    
    const body = await req.json();
    console.log("📝 Request body:", JSON.stringify(body, null, 2));

    if (!body?.title)   return NextResponse.json({ success: false, error: "TITLE_REQUIRED", message: "Başlık alanı zorunludur" }, { status: 400 });

    const payload = {
      title: String(body.title),
      excerpt: String(body?.excerpt ?? ""),
      content: String(body?.content ?? ""),
      location: String(body?.location ?? ""),
      featured: Boolean(body?.featured),
      status: 'published', // Her zaman published olarak başlat
      publishedAt: body?.publishedAt ? new Date(body.publishedAt) : new Date(), // Eğer yoksa şimdiki zaman
      image: {
        url: String(body?.image?.url ?? ""),
        publicId: String(body?.image?.publicId ?? ""),
        filename: String(body?.image?.filename ?? ""),
      },
    };
    
    console.log("📦 Payload hazırlandı:", JSON.stringify(payload, null, 2));
    console.log("🎯 Event.create çağrılıyor...");
    
    const created = await Event.create(payload);
    console.log("✅ Event başarıyla oluşturuldu:", created._id);
    return NextResponse.json({ success: true, ok: true, item: created, message: "Etkinlik başarıyla oluşturuldu" });
  } catch (err: any) {
    console.error("❌ POST /api/events error details:", {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      code: err?.code,
      fullError: err
    });
    
    // MongoDB validation hatası mı kontrol et
    if (err?.name === 'ValidationError') {
      console.error("🔍 Validation Error Details:", err.errors);
    }
    
    // MongoDB duplicate key hatası mı kontrol et
    if (err?.code === 11000) {
      console.error("🔍 Duplicate Key Error:", err.keyValue);
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "CREATE_EVENT_FAILED", 
      message: err?.message || "Etkinlik oluşturulamadı",
      details: process.env.NODE_ENV === 'development' ? err?.stack : undefined
    }, { status: 500 });
  }
}
