import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import mongoose from "mongoose";

export const revalidate = 0;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const { id } = params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ ok:false, error:"INVALID_ID" }, { status:400 });

    const body = await req.json();
    const update: any = {
      title: String(body?.title ?? ""),
      excerpt: String(body?.excerpt ?? ""),
      content: String(body?.content ?? ""),
      location: String(body?.location ?? ""),
      isFeatured: Boolean(body?.isFeatured),
    };

    if (body?.startAt) update.startAt = new Date(body.startAt);
    if (body?.endAt) update.endAt = new Date(body.endAt);
    if (body?.publishedAt) update.publishedAt = new Date(body.publishedAt);
    if (body?.image) {
      update.image = {
        url: String(body?.image?.url ?? ""),
        publicId: String(body?.image?.publicId ?? ""),
        filename: String(body?.image?.filename ?? ""),
      };
    }

    const updated = await Event.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
    if (!updated) return NextResponse.json({ ok:false, error:"NOT_FOUND" }, { status:404 });

    return NextResponse.json({ ok:true, item:updated });
  } catch (err: any) {
    console.error("PUT /api/events/[id]:", err?.message || err);
    return NextResponse.json({ ok:false, error: err?.message || "UPDATE_EVENT_FAILED" }, { status:500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const { id } = params;
    if (!id) return NextResponse.json({ ok:false, error:"ID_REQUIRED" }, { status:400 });

    const deleted = await Event.findByIdAndDelete(id).lean();
    if (!deleted) return NextResponse.json({ ok:false, error:"NOT_FOUND" }, { status:404 });

    return NextResponse.json({ ok:true });
  } catch (err: any) {
    console.error("DELETE /api/events/[id]:", err?.message || err);
    return NextResponse.json({ ok:false, error: err?.message || "DELETE_EVENT_FAILED" }, { status:500 });
  }
}

