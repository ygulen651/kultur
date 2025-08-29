// src/lib/uploadImage.ts
export async function uploadImageToCloudinary(
  file: File,
  {
    cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    folder = "brosur",
  }: { cloudName?: string; uploadPreset?: string; folder?: string } = {}
): Promise<string> {
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary yapılandırması eksik. Ortam değişkenlerini kontrol edin.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  // JSON parse etmeden önce ok kontrolü
  if (!res.ok) {
    // Cloudinary zaman zaman JSON yerine text/hata HTML döndürebilir
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary yükleme hatası. HTTP ${res.status}. ${text}`);
  }

  // Boş body dönerse .json() patlamasın
  const bodyText = await res.text();
  if (!bodyText) {
    throw new Error("Cloudinary boş yanıt döndürdü.");
  }

  let data: any;
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new Error("Cloudinary yanıtı JSON formatında değil.");
  }

  if (!data.secure_url) {
    throw new Error("Cloudinary yanıtında secure_url yok.");
  }
  return data.secure_url as string;
}
