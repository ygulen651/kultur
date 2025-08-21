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

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const published = url.searchParams.get("published");
    const featured = url.searchParams.get("featured");

    const q: any = {};
    if (published === "true") q.publishedAt = { $ne: null };
    if (featured === "true") q.isFeatured = true;

    const rows = await Event.find(q).sort({ createdAt: -1 }).lean();

    const items = rows.map((row: any) => {
      const cover =
        row?.image?.url ||
        row?.fields?.image?.url ||
        row?.featuredImageUrl ||
        (row?.imageFilename ? `/uploads/${row.imageFilename}` : "");
      return { ...row, computedCover: cover };
    });

    return NextResponse.json({ ok: true, items, total: items.length });
  } catch (err: any) {
    console.error("GET /api/events error:", err?.message || err);
    return NextResponse.json({ ok: false, error: err?.message || "Unknown error" }, { status: 500 });
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
