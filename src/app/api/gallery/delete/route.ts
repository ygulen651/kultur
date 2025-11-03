import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";
import { toErrorLike } from '@/lib/errors';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id, publicId } = body || {};

    if (!id && !publicId) {
      return NextResponse.json({ ok: false, error: "ID_OR_PUBLICID_REQUIRED" }, { status: 400 });
    }

    await connectDB();

    const doc = id
      ? await GalleryItem.findById(id)
      : await GalleryItem.findOne({ publicId });

    if (!doc) {
      return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
    }

    await cloudinary.uploader.destroy(doc.publicId, { resource_type: "image" }).catch(() => null);
    await GalleryItem.deleteOne({ _id: doc._id });

    return NextResponse.json({ ok: true, deletedId: doc._id });
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error("delete error:", e);
    return NextResponse.json({ 
      ok: false, 
      error: "DELETE_FAILED",
      details: e.message,
      code: e.code,
      meta: e.meta
    }, { status: 500 });
  }
}
