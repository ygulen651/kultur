import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  await connectDB();

  const docs = await GalleryItem.find({})
    .sort({ createdAt: -1 })
    .lean();

  const items = (docs ?? []).map((d: any) => ({
    _id: String(d._id),
    url: d.url,
    src: d.url,
    filename: d.filename ?? "",
    width: d.width ?? 0,
    height: d.height ?? 0,
    createdAt: d.createdAt,
  }));

  return NextResponse.json({ ok: true, items, total: items.length });
}
