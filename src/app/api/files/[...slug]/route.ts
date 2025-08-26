import { NextResponse } from "next/server";

function encodePathSegments(publicId: string) {
  return publicId.split("/").map(s => encodeURIComponent(s)).join("/");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    const { slug } = await params;
    
    let publicId = slug.join("/").replace(/^\/+|\/+$/g, "");
    const hasPdfExt = /\.pdf$/i.test(publicId);
    const filename = (hasPdfExt ? publicId : publicId + ".pdf").split("/").pop()!;
    const publicIdNoExt = publicId.replace(/\.pdf$/i, "");
    const encodedPublicId = encodePathSegments(publicIdNoExt);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary config eksik" }, { status: 500 });
    }

    const url = `https://res.cloudinary.com/${cloudName}/raw/upload/${encodedPublicId}${hasPdfExt ? "" : ".pdf"}`;
    
    console.log('=== PDF DOWNLOAD DEBUG ===');
    console.log('Slug:', slug);
    console.log('PublicId:', publicId);
    console.log('PublicIdNoExt:', publicIdNoExt);
    console.log('EncodedPublicId:', encodedPublicId);
    console.log('HasPdfExt:', hasPdfExt);
    console.log('Filename:', filename);
    console.log('Cloudinary URL:', url);

    const resp = await fetch(url);
    if (!resp.ok) {
      console.error('❌ Cloudinary fetch hatası:', resp.status, resp.statusText);
      return NextResponse.json({ 
        error: "PDF bulunamadı", 
        urlTried: url,
        status: resp.status,
        statusText: resp.statusText
      }, { status: 404 });
    }

    const arr = await resp.arrayBuffer();
    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");
    
    console.log('✅ PDF başarıyla indiriliyor:', filename, 'Boyut:', arr.byteLength, 'bytes');
    console.log('✅ Cloudinary URL:', url);
    console.log('=== DEBUG TAMAMLANDI ===\n');

    return new NextResponse(Buffer.from(arr), { status: 200, headers });
  } catch (e) {
    console.error('❌ Proxy download hatası:', e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
