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

/** Türkçe karakterleri ve tehlikeli karakterleri sadeleştirir */
export function toSafeFilename(raw: string) {
  const map: Record<string, string> = { "ğ":"g","ü":"u","ş":"s","ı":"i","ö":"o","ç":"c","Ğ":"G","Ü":"U","Ş":"S","İ":"I","Ö":"O","Ç":"C" };
  return (raw || "dosya.pdf")
    .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (m) => map[m] || m)
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/\.pdf$/i, "") + ".pdf";
}
