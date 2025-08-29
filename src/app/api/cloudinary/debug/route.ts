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

    const candidates = publicIdParam.endsWith(".pdf")
      ? [publicIdParam, publicIdParam.replace(/\.pdf$/i, "")]
      : [publicIdParam, `${publicIdParam}.pdf`];

    const types = ["upload"];
    let res: any = null, lastErr: any = null;

    for (const pid of candidates) {
      for (const t of types) {
        try {
          res = await cloudinary.api.resource(pid, { resource_type: "raw", type: t as any });
          if (res) break;
        } catch (e) { lastErr = e; }
      }
      if (res) break;
    }

    if (!res) {
      return NextResponse.json({
        error: "bulunamadı",
        message: "public_id hiçbir type altında bulunamadı",
        details: lastErr?.error || String(lastErr),
      }, { status: lastErr?.http_code || 404 });
    }

    return NextResponse.json({
      public_id: res.public_id,
      resource_type: res.resource_type,
      type: res.type,
      access_mode: res.access_mode,
      secure_url: res.secure_url,
      bytes: res.bytes,
      created_at: res.created_at,
    });
  } catch (e:any) {
    return NextResponse.json({
      error: "Cloudinary API hatası",
      http_code: e?.http_code,
      message: e?.message || e?.error?.message || "bilinmeyen",
    }, { status: e?.http_code || 500 });
  }
}
