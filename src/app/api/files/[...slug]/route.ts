import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    
    // slug = ["Neden-Kultur-Sanat-Is-Sendikasina-Uye-Olmalıyız.pdf"] -> filename = "Neden-Kultur-Sanat-Is-Sendikasina-Uye-Olmalıyız.pdf"
    const filename = slug.join("/");
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary config eksik" }, { status: 500 });
    }

    // Sadece "Neden Kültür Sanat İş" PDF'i için özel URL
    const publicId = "sendika/uploads/Neden-Kultur-Sanat-Is-Sendikasina-Uye-Olmalıyız";
    const url = `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}.pdf`;
    
    console.log('Cloudinary raw URL:', url);
    console.log('İstenen dosya adı:', filename);

    const resp = await fetch(url);
    if (!resp.ok) {
      console.error('Cloudinary fetch hatası:', resp.status, resp.statusText);
      return NextResponse.json({ error: "PDF bulunamadı" }, { status: 404 });
    }

    const arrayBuf = await resp.arrayBuffer();
    
    // Dosya adını düzelt - Türkçe karakterleri koru
    const finalFilename = "Neden Kültür Sanat İş Sendikasına Üye Olmalıyız.pdf";

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="${finalFilename}"`);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    console.log('PDF indiriliyor:', finalFilename, 'Boyut:', arrayBuf.byteLength);

    return new NextResponse(Buffer.from(arrayBuf), { status: 200, headers });
  } catch (e) {
    console.error('Proxy download hatası:', e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
