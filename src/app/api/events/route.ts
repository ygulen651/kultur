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
    
    const query: Record<string, unknown> = { status };
    
    if (category) query.category = category;
    if (upcoming) {
      query.startDate = { $gte: new Date() };
    }
    
    const events = await Event.find(query)
      .sort({ startDate: 1, createdAt: -1 })
      .limit(limit)
      .lean();
    
    const items = events.map((event: Record<string, unknown>) => ({
      ...event,
      cover: pickCover(event)
    }));
    
    return NextResponse.json({ 
      success: true, 
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
    await connectDB();
    const body = await req.json();

    if (!body?.title)   return NextResponse.json({ ok:false, error:"TITLE_REQUIRED" }, { status:400 });
    if (!body?.startAt) return NextResponse.json({ ok:false, error:"START_AT_REQUIRED" }, { status:400 });

    const payload = {
      title: String(body.title),
      excerpt: String(body?.excerpt ?? ""),
      content: String(body?.content ?? ""),
      location: String(body?.location ?? ""),
      startAt: new Date(body.startAt),
      endAt: body?.endAt ? new Date(body.endAt) : undefined,
      isFeatured: Boolean(body?.isFeatured),
      publishedAt: body?.publishedAt ? new Date(body.publishedAt) : undefined,
      image: {
        url: String(body?.image?.url ?? ""),
        publicId: String(body?.image?.publicId ?? ""),
        filename: String(body?.image?.filename ?? ""),
      },
    };

    const created = await Event.create(payload);
    return NextResponse.json({ ok: true, item: created });
  } catch (err: any) {
    console.error("POST /api/events:", err?.message || err);
    return NextResponse.json({ ok: false, error: err?.message || "CREATE_EVENT_FAILED" }, { status: 500 });
  }
}
