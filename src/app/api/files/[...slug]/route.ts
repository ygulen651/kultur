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
    
    console.log('=== PDF DOWNLOAD DEBUG ===');
    console.log('Slug:', slug);
    console.log('Filename:', filename);
    console.log('Cloud Name:', cloudName);
    
    if (!cloudName) {
      return NextResponse.json({ error: "Cloudinary config eksik" }, { status: 500 });
    }

    // Farklı Cloudinary URL'lerini dene
    const possibleUrls = [
      // URL 1: Tam dosya adı ile
      `https://res.cloudinary.com/${cloudName}/raw/upload/sendika/uploads/Neden-Kultur-Sanat-Is-Sendikasina-Uye-Olmalıyız.pdf`,
      // URL 2: Sadece dosya adı ile
      `https://res.cloudinary.com/${cloudName}/raw/upload/Neden-Kultur-Sanat-Is-Sendikasina-Uye-Olmalıyız.pdf`,
      // URL 3: Klasör olmadan
      `https://res.cloudinary.com/${cloudName}/raw/upload/Neden-Kultur-Sanat-Is-Sendikasina-Uye-Olmalıyız`,
      // URL 4: Varsayılan klasör ile
      `https://res.cloudinary.com/${cloudName}/raw/upload/kultur-sendika/Neden-Kultur-Sanat-Is-Sendikasina-Uye-Olmalıyız.pdf`
    ];

    console.log('Denenecek URL\'ler:');
    possibleUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });

    let resp = null;
    let workingUrl = '';

    // Her URL'i dene
    for (let i = 0; i < possibleUrls.length; i++) {
      const url = possibleUrls[i];
      console.log(`\n${i + 1}. URL deneniyor: ${url}`);
      
      try {
        resp = await fetch(url);
        console.log(`Response status: ${resp.status} ${resp.statusText}`);
        
        if (resp.ok) {
          workingUrl = url;
          console.log(`✅ Çalışan URL bulundu: ${url}`);
          break;
        } else {
          console.log(`❌ URL çalışmadı: ${resp.status} ${resp.statusText}`);
        }
      } catch (error) {
        console.log(`❌ URL hatası:`, error);
      }
    }

    if (!resp || !resp.ok) {
      console.error('❌ Hiçbir URL çalışmadı!');
      return NextResponse.json({ 
        error: "PDF bulunamadı", 
        details: "Cloudinary'de dosya bulunamadı",
        triedUrls: possibleUrls
      }, { status: 404 });
    }

    const arrayBuf = await resp.arrayBuffer();
    
    // Dosya adını düzelt - Türkçe karakterleri koru
    const finalFilename = "Neden Kültür Sanat İş Sendikasına Üye Olmalıyız.pdf";

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `attachment; filename="${finalFilename}"`);
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    console.log('✅ PDF indiriliyor:', finalFilename, 'Boyut:', arrayBuf.byteLength, 'bytes');
    console.log('✅ Çalışan URL:', workingUrl);
    console.log('=== DEBUG TAMAMLANDI ===\n');

    return new NextResponse(Buffer.from(arrayBuf), { status: 200, headers });
  } catch (e) {
    console.error('❌ Proxy download hatası:', e);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
