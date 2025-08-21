import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({ ok: false, error: "METHOD_NOT_ALLOWED" }, { status: 405 });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "FILE_REQUIRED" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cloudinary stream upload
    const uploaded: any = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "sendika/gallery",
          resource_type: "auto",
          use_filename: true,
          unique_filename: true,
          overwrite: false
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });

    await connectDB();

    const item = await GalleryItem.create({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      filename: uploaded.original_filename || file.name || "",
      format: uploaded.format || "",
      width: uploaded.width || 0,
      height: uploaded.height || 0,
      bytes: uploaded.bytes || 0,
      resourceType: uploaded.resource_type || "image",
      folder: uploaded.folder || "sendika/gallery"
    });

    return NextResponse.json({ ok: true, item });
  } catch (err: any) {
    console.error("upload POST error:", err);
    return NextResponse.json({ ok: false, error: "UPLOAD_FAILED" }, { status: 500 });
  }
}
