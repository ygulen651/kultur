"use client";
import { CldImage } from 'next-cloudinary';

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <CldImage
        src="cld-sample-5" // Cloudinary sample görseli veya kendi publicId'niz
        width="500"
        height="500"
        crop={{
          type: 'auto',
          source: true
        }}
        alt="Cloudinary örnek görsel"
      />
      <p className="mt-4 text-muted-foreground text-sm">Cloudinary ile optimize edilmiş ve transform edilmiş görsel.</p>
    </div>
  );
}
