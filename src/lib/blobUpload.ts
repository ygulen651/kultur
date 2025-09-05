import { put } from "@vercel/blob";

/** Vercel Blob'a PUBLIC PDF yükler, URL döner */
export async function uploadPdfToBlob(file: File, safeName: string, folder = "sendika/uploads") {
  // PDF olduğundan emin ol
  const name = safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`;

  const uploaded = await put(`${folder}/${name}`, file.stream(), {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: true, // isim çakışmasın
  });

  return uploaded; // { url, pathname, size, ... }
}

/** Vercel Blob'a PUBLIC görsel yükler, URL döner */
export async function uploadImageToBlob(file: File, safeName: string, folder = "sendika/images") {
  try {
    console.log('Blob upload başlatılıyor:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      safeName,
      folder 
    });

    // Görsel uzantısını kontrol et
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const name = safeName.toLowerCase().endsWith(`.${extension}`) ? safeName : `${safeName}.${extension}`;
    
    // Content type'ı belirle
    const contentType = file.type || `image/${extension}`;

    console.log('Blob upload parametreleri:', { name, contentType, folder });

    // File'ı ArrayBuffer'a çevir (stream yerine)
    const arrayBuffer = await file.arrayBuffer();
    
    const uploaded = await put(`${folder}/${name}`, arrayBuffer, {
      access: "public",
      contentType: contentType,
      addRandomSuffix: true, // isim çakışmasın
    });

    console.log('Blob upload başarılı:', { url: uploaded.url, pathname: uploaded.pathname });
    return uploaded; // { url, pathname, size, ... }
  } catch (error) {
    console.error('Blob upload hatası:', error);
    console.error('Hata detayları:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      status: (error as any)?.status,
      stack: error instanceof Error ? error.stack : 'No stack'
    });
    throw error;
  }
}

/** Türkçe karakterleri ve tehlikeli karakterleri sadeleştirir */
export function toSafeFilename(raw: string) {
  const map: Record<string, string> = { "ğ":"g","ü":"u","ş":"s","ı":"i","ö":"o","ç":"c","Ğ":"G","Ü":"U","Ş":"S","İ":"I","Ö":"O","Ç":"C" };
  return (raw || "dosya.pdf")
    .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (m) => map[m] || m)
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/\.pdf$/i, "") + ".pdf";
}

/** Görsel dosya adı için güvenli isim oluşturur */
export function toSafeImageFilename(raw: string) {
  const map: Record<string, string> = { "ğ":"g","ü":"u","ş":"s","ı":"i","ö":"o","ç":"c","Ğ":"G","Ü":"U","Ş":"S","İ":"I","Ö":"O","Ç":"C" };
  return (raw || "gorsel.jpg")
    .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (m) => map[m] || m)
    .replace(/[^a-zA-Z0-9._-]+/g, "_");
}
