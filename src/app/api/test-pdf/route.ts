import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    console.log("Test PDF API başladı");
    
    const form = await req.formData();
    const pdfFile = form.get("pdf");
    
    if (!pdfFile || !(pdfFile instanceof File)) {
      return NextResponse.json({ error: "PDF dosyası bulunamadı" }, { status: 400 });
    }
    
    console.log("PDF dosyası:", pdfFile.name, pdfFile.size);
    
    // Base64'e çevir
    const arrayBuf = await pdfFile.arrayBuffer();
    const b64 = Buffer.from(arrayBuf).toString("base64");
    const dataUri = `data:application/pdf;base64,${b64}`;
    
    // Güvenli dosya adı oluştur
    const safeFilename = pdfFile.name
      .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (match) => {
        const map: { [key: string]: string } = {
          'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
          'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C'
        };
        return map[match] || match;
      })
      .replace(/[^a-zA-Z0-9.-]/g, '_');
    
    console.log("Güvenli dosya adı:", safeFilename);
    
    // Cloudinary'ye yükle
    const result = await cloudinary.uploader.upload(dataUri, {
      upload_preset: "union_public",  // az önce düzenlediğin preset
      resource_type: "raw",           // PDF => raw (zorunlu)
      folder: "sendika/uploads",
      format: "pdf",
      use_filename: false,
      unique_filename: false,
      filename_override: safeFilename,
      type: "upload",                 // public teslim
      access_mode: "public",          // public asset
    });
    
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
