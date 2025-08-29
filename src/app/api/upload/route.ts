import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge"; // istersen node

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "Dosya eksik" }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ ok: false, error: "Cloudinary yapılandırması eksik" }, { status: 500 });
    }

    // Cloudinary'ye ilet
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", uploadPreset);
    fd.append("folder", "brosur");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ ok: false, error: "Cloudinary yükleme hatası", details: text }, { status: 400 });
    }

    const text = await res.text();
    if (!text) {
      return NextResponse.json({ ok: false, error: "Cloudinary boş yanıt döndürdü" }, { status: 502 });
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ ok: false, error: "Cloudinary JSON dönmedi" }, { status: 502 });
    }

    if (!data.secure_url) {
      return NextResponse.json({ ok: false, error: "Cloudinary yanıtında secure_url yok" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, url: data.secure_url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Yükleme hatası" }, { status: 500 });
  }
}
