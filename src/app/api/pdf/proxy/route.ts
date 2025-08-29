export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

const ALLOWED_HOST = "res.cloudinary.com";
const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  ""; // opsiyonel ek güvenlik

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
    if (CLOUD_NAME && !u.pathname.startsWith(`/${CLOUD_NAME}/raw/upload/`)) {
      return NextResponse.json({ error: "yalnızca raw/upload izinli" }, { status: 400 });
    }

    const range = req.headers.get("range") || undefined;

    const upstream = await fetch(u.toString(), {
      method: "GET",
      headers: { ...(range ? { range } : {}), Accept: "application/pdf" },
      cache: "no-store",
      redirect: "follow",
    });

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
    return NextResponse.json({ error: e?.message || "proxy hata" }, { status: 500 });
  }
}
