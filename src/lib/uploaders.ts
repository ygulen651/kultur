import { cloudinary } from "@/lib/cloudinary";
import { v2 as cloudinaryV2 } from "cloudinary";

export async function uploadImage(file: File, folder = "sendika/images") {
  const arrayBuf = await file.arrayBuffer();
  const b64 = Buffer.from(arrayBuf).toString("base64");
  const dataUri = `data:${file.type};base64,${b64}`;

  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    use_filename: true,
    unique_filename: false,
  });
  return { url: res.secure_url, publicId: res.public_id };
}

export async function uploadPdf(file: File, folder = "sendika/uploads") {
  const arrayBuf = await file.arrayBuffer();
  const b64 = Buffer.from(arrayBuf).toString("base64");
  const dataUri = `data:application/pdf;base64,${b64}`;

  // Türkçe karakterleri güvenli hale getir
  const safeFilename = file.name
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[Ğ]/g, 'G')
    .replace(/[Ü]/g, 'U')
    .replace(/[Ş]/g, 'S')
    .replace(/[İ]/g, 'I')
    .replace(/[Ö]/g, 'O')
    .replace(/[Ç]/g, 'C')
    .replace(/[^a-zA-Z0-9.-]/g, '_');

  const filenameBase = safeFilename.replace(/\.pdf$/i, "");
  
  console.log("PDF Upload - Original filename:", file.name);
  console.log("PDF Upload - Safe filename:", safeFilename);
  
  const res = await cloudinary.uploader.upload(dataUri, {
    upload_preset: "union_public",   // az önce düzenlediğin preset
    resource_type: "raw",            // PDF => raw (zorunlu)
    folder,
    format: "pdf",
    use_filename: true,              // Orijinal ismi kullan
    unique_filename: false,          // Aynı isimli dosyaların üzerine yaz
    filename_override: filenameBase + ".pdf", // Türkçe karakterleri temizle
    type: "upload",                  // public teslim
    access_mode: "public",           // public asset
    overwrite: true,                 // Eski dosyaların üzerine yaz
  });

  console.log("PDF Upload - Cloudinary response:", res.public_id);
  
  // public_id uzantısız gelir
  return { publicId: res.public_id, filename: safeFilename, bytes: res.bytes };
}

// Yeni PDF upload yardımcı fonksiyonu - Buffer ile
export async function uploadPdfBufferToCloudinary(pdfBuffer: Buffer, safeFilename: string) {
  const dataUri = `data:application/pdf;base64,${Buffer.from(pdfBuffer).toString("base64")}`;

  const result = await cloudinaryV2.uploader.upload(dataUri, {
    upload_preset: "union_public",
    resource_type: "raw",
    folder: "sendika/uploads",
    use_filename: false,
    unique_filename: false,
    filename_override: safeFilename, // "AD.pdf" dahilse format vermene gerek yok
    type: "upload",
    access_mode: "public",
    overwrite: true,
  });

  // Doğrulama logu:
  console.log("PDF UPLOADED", {
    url: result.secure_url,
    type: result.type,
    rtype: result.resource_type,
    access: (result as any).access_mode,
  });

  return result; // { secure_url, public_id, ... }
}
