import { cloudinary } from "@/lib/cloudinary";

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

  const filenameBase = file.name.replace(/\.pdf$/i, "");
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "raw",            // *** kritik ***
    format: "pdf",
    use_filename: true,
    unique_filename: false,
    filename_override: filenameBase + ".pdf",
  });

  // public_id uzantısız gelir
  return { publicId: res.public_id, filename: filenameBase + ".pdf", bytes: res.bytes };
}
