export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { toSafeFilename } from "@/lib/blobUpload";

export async function POST(req: Request) {
  try {
    const { url, name } = await req.json();
    if (!url) return NextResponse.json({ error: "url gerekli" }, { status: 400 });

    // Cloudinary'den oku
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ error: "kaynak okunamadı", status: res.status }, { status: 400 });

    const safe = toSafeFilename(name || decodeURIComponent(url.split("/").pop() || "dosya.pdf"));
    const uploaded = await put(`sendika/uploads/${safe}`, res.body!, {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: true,
    });

    return NextResponse.json({ ok: true, blobUrl: uploaded.url, filename: safe });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "clone hata" }, { status: 500 });
  }
}
