export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

function ensureCloudinaryConfig() {
  const cfg = cloudinary.config();
  if (!cfg.cloud_name) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
  }
}

export async function POST(req: Request) {
  try {
    ensureCloudinaryConfig();
    const { publicId } = await req.json();
    if (!publicId) return NextResponse.json({ error: "publicId gerekli" }, { status: 400 });

    // CDN önbelleğini temizle
    const result = await cloudinary.uploader.explicit(publicId, {
      resource_type: "raw",
      type: "upload",
      invalidate: true,
    });

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "invalidate başarısız" },
      { status: 500 }
    );
  }
}
