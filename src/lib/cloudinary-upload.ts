import { v2 as cloudinary } from "cloudinary";

export async function uploadBuffer(buffer: Buffer, opts: any) {
  return new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
}
