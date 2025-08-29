export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

function ensureCloudinaryConfigured() {
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

export async function GET(req: Request) {
  try {
    ensureCloudinaryConfigured();

    const url = new URL(req.url);
    const publicIdParam = url.searchParams.get("publicId");
    if (!publicIdParam) {
      return NextResponse.json({ error: "publicId gerekli" }, { status: 400 });
    }

    const tryIds = publicIdParam.endsWith(".pdf")
      ? [publicIdParam, publicIdParam.replace(/\.pdf$/i, "")]
      : [publicIdParam, `${publicIdParam}.pdf`];

    let res: any = null, lastErr: any = null;
    for (const pid of tryIds) {
      try {
        res = await cloudinary.api.resource(pid, { resource_type: "raw" });
        if (res) break;
      } catch (e) { lastErr = e; }
    }
    if (!res) throw lastErr || new Error("Asset bulunamadı");

    return NextResponse.json({
      public_id: res.public_id,
      resource_type: res.resource_type, // "raw" beklenir
      type: res.type,                   // "upload" beklenir
      access_mode: res.access_mode,     // "public" beklenir
      secure_url: res.secure_url,
      bytes: res.bytes,
      created_at: res.created_at,
    });
  } catch (e:any) {
    return NextResponse.json({
      error: "Cloudinary API hatası",
      http_code: e?.http_code,
      message: e?.message || e?.error?.message || "bilinmeyen",
      details: e?.error || String(e),
    }, { status: e?.http_code || 500 });
  }
}
