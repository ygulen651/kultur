export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

const ALLOWED_HOST = "res.cloudinary.com";
const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  "";
const ALLOW_SIGNED = (process.env.ALLOW_CLOUDINARY_FALLBACK_SIGNED || "false").toLowerCase() === "true";

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

// RAW upload/full URL'den public_id çıkar (…/raw/upload/v123/<public_id>)
function extractPublicIdFromRawUrl(u: URL) {
  const m = u.pathname.match(/\/raw\/(?:upload|authenticated)\/v\d+\/(.+)$/);
  if (!m) return null;
  return decodeURIComponent(m[1]); // public_id (+ uzantı)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url");
    const download = searchParams.get("download") === "1";

    if (!target) {
      return NextResponse.json({ error: "url gerekli" }, { status: 400 });
    }

    let u: URL;
    try {
      u = new URL(target);
    } catch {
      return NextResponse.json({ error: "geçersiz url" }, { status: 400 });
    }

    if (u.hostname !== ALLOWED_HOST) {
      return NextResponse.json({ error: "yalnızca Cloudinary izinli" }, { status: 400 });
    }
    if (CLOUD_NAME && !u.pathname.startsWith(`/${CLOUD_NAME}/raw/`)) {
      return NextResponse.json({ error: "yalnızca raw yolları izinli" }, { status: 400 });
    }

    const range = req.headers.get("range") || undefined;

    // 1) PUBLIC denemesi
    const tryFetch = async (urlStr: string) => {
      const res = await fetch(urlStr, {
        method: "GET",
        headers: { ...(range ? { range } : {}), Accept: "application/pdf" },
        cache: "no-store",
        redirect: "follow",
      });
      return res;
    };

    let upstream = await tryFetch(u.toString());
    console.log("[pdf-proxy] target:", u.toString(), "status:", upstream.status);

    // 2) Fallback: authenticated ise ve izin varsa imzalı dene
    if (upstream.status === 401 && ALLOW_SIGNED) {
      ensureCloudinary();
      const publicId = extractPublicIdFromRawUrl(u);
      if (publicId) {
        // public_id uzantılı geliyor (…/foo.pdf). Cloudinary signed URL oluştur.
        // resource_type:'raw', type:'authenticated' ile imzalı delivery oluştur.
        const signedUrl = cloudinary.url(publicId, {
          resource_type: "raw",
          type: "authenticated",
          sign_url: true,
          secure: true,
        });

        console.log("[pdf-proxy] fallback signed:", signedUrl);
        upstream = await tryFetch(signedUrl);
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
    headers.set(
      "content-disposition",
      `${download ? "attachment" : "inline"}; filename="${filename}"`
    );
    headers.set("cross-origin-resource-policy", "cross-origin");

    return new Response(upstream.body, { status: upstream.status, headers });
  } catch (e: any) {
    console.error("[pdf-proxy] error:", e);
    return NextResponse.json({ error: e?.message || "proxy hata" }, { status: 500 });
  }
}
