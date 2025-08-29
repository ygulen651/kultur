export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const ALLOWED_HOST = "res.cloudinary.com";
const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  "";

function ensureCloudinary() {
  const cfg = cloudinary.config();
  if (!cfg.cloud_name && process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
      secure: true,
    });
  }
}

// /raw/(upload|authenticated)/v123/<public_id(.pdf)>
function extractPublicId(u: URL) {
  const m = u.pathname.match(/\/raw\/(?:upload|authenticated)\/v\d+\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function fetchPdf(urlStr: string, range?: string | null) {
  return fetch(urlStr, {
    method: "GET",
    headers: { ...(range ? { range } : {}), Accept: "application/pdf" },
    cache: "no-store",
    redirect: "follow",
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url");
    const download = searchParams.get("download") === "1";
    if (!target) return NextResponse.json({ error: "url gerekli" }, { status: 400 });

    let u: URL;
    try { u = new URL(target); } catch { return NextResponse.json({ error: "geçersiz url" }, { status: 400 }); }

    if (u.hostname !== ALLOWED_HOST) {
      return NextResponse.json({ error: "yalnızca Cloudinary izinli" }, { status: 400 });
    }
    if (CLOUD_NAME && !u.pathname.startsWith(`/${CLOUD_NAME}/raw/`)) {
      return NextResponse.json({ error: "yalnızca raw yolları izinli" }, { status: 400 });
    }

    const range = req.headers.get("range");

    // 1) Public URL ile dene
    let upstream = await fetchPdf(u.toString(), range);
    console.log("[pdf-proxy] target:", u.toString(), "status:", upstream.status);

    // 2) 401 ise: authenticated imzalı fallback dene
    if (upstream.status === 401) {
      ensureCloudinary();
      const publicId = extractPublicId(u);
      if (publicId) {
        // Admin API ile tipini doğrula (raw/authenticated var mı?)
        let foundType: "upload" | "authenticated" | null = null;
        try {
          await cloudinary.api.resource(publicId, { resource_type: "raw", type: "upload" });
          foundType = "upload";
        } catch {
          try {
            await cloudinary.api.resource(publicId, { resource_type: "raw", type: "authenticated" });
            foundType = "authenticated";
          } catch {/* ignore */}
        }

        if (foundType === "authenticated") {
          const signed = cloudinary.url(publicId, {
            resource_type: "raw",
            type: "authenticated",
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 300, // 5 dk
          });
          console.log("[pdf-proxy] fallback signed:", signed);
          upstream = await fetchPdf(signed, range);
        }
      }
    }

    // Başlıkları geçir
    const headers = new Headers();
    for (const h of [
      "content-type",
      "content-length",
      "accept-ranges",
      "content-range",
      "etag",
      "last-modified",
      "cache-control",
    ]) {
      const v = upstream.headers.get(h);
      if (v) headers.set(h, v);
    }

    const filename = decodeURIComponent(u.pathname.split("/").pop() || "dosya.pdf");
    headers.set("content-disposition", `${download ? "attachment" : "inline"}; filename="${filename}"`);
    headers.set("cross-origin-resource-policy", "cross-origin");

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (e: any) {
    console.error("[pdf-proxy] error:", e);
    return NextResponse.json({ error: e?.message || "proxy hata" }, { status: 500 });
  }
}
