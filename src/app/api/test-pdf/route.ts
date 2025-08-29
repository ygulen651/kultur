import { NextResponse } from "next/server";
import { uploadPdfBufferToCloudinary } from "@/lib/uploaders";

export async function POST(req: Request) {
  try {
    console.log("Test PDF API başladı");
    
    const form = await req.formData();
    const pdfFile = form.get("pdf");
    
    if (!pdfFile || !(pdfFile instanceof File)) {
      return NextResponse.json({ error: "PDF dosyası bulunamadı" }, { status: 400 });
    }
    
    console.log("PDF dosyası:", pdfFile.name, pdfFile.size);
    
    // Güvenli dosya adı oluştur
    const safeFilename = pdfFile.name
      .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (match) => {
        const map: { [key: string]: string } = {
          'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
          'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C'
        };
        return map[match] || match;
      })
      .replace(/[^a-zA-Z0-9.-]/g, '_') + '.pdf';
    
    console.log("Güvenli dosya adı:", safeFilename);
    
    // Cloudinary'ye yükle - yeni yardımcı fonksiyon ile
    const arrayBuf = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuf);
    
    const result = await uploadPdfBufferToCloudinary(pdfBuffer, safeFilename);
    
    console.log("Cloudinary sonucu:", result);
    
    return NextResponse.json({
      success: true,
      publicId: result.public_id,
      filename: safeFilename,
      url: result.secure_url,
      bytes: result.bytes
    });
    
  } catch (error) {
    console.error("Test PDF API hatası:", error);
    return NextResponse.json({ 
      error: "Sunucu hatası", 
      message: error instanceof Error ? error.message : "Bilinmeyen hata" 
    }, { status: 500 });
  }
}
