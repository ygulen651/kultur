import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";

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
  } catch (err: any) {
    console.error("delete error:", err);
    return NextResponse.json({ ok: false, error: "DELETE_FAILED" }, { status: 500 });
  }
}
