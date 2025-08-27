import { NextResponse } from "next/server";

const enc = (s: string) => s.split("/").map(encodeURIComponent).join("/");

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  try {
    const { slug } = await params;
    let id = slug.join("/").replace(/^\/+|\/+$/g, "");
    const hasExt = /\.pdf$/i.test(id);
    const idNoExt = id.replace(/\.pdf$/i, "");
    const url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${enc(idNoExt)}${hasExt ? "" : ".pdf"}`;

    const r = await fetch(url);
    if (!r.ok) return NextResponse.json({ error: "PDF bulunamadı", urlTried: url }, { status: 404 });

    const buf = Buffer.from(await r.arrayBuffer());
    const filename = (hasExt ? id : id + ".pdf").split("/").pop()!;
    const h = new Headers({
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    return new NextResponse(buf, { status: 200, headers: h });
  } catch (e: any) {
    return NextResponse.json({ error: "Sunucu hatası", message: e?.message }, { status: 500 });
  }
}
