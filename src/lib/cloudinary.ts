import { v2 as cloudinary } from "cloudinary";

if (!cloudinary.config().cloud_name) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
  });
}

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || process.env.CLOUDINARY_UPLOAD_PRESET || '',
  folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || process.env.CLOUDINARY_FOLDER || 'kultur-sendika',
};

// Dosya yükleme fonksiyonu
export const uploadToCloudinary = async (
  file: Buffer | string,
  options: {
    folder?: string;
    public_id?: string;
    transformation?: any[];
    resource_type?: 'image' | 'video' | 'raw';
  } = {}
) => {
  try {
    const uploadOptions = {
      folder: options.folder || CLOUDINARY_CONFIG.folder,
      public_id: options.public_id,
      transformation: options.transformation,
      resource_type: options.resource_type || 'image',
      ...(typeof file === 'string' ? { url: file } : {})
    };

    if (typeof file === 'string') {
      // URL yükleme
      const result = await cloudinary.uploader.upload(file, uploadOptions);
      return result;
    } else {
      // Buffer yükleme
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        
        uploadStream.end(file);
      });
      
      return result;
    }
  } catch (error) {
    console.error('Cloudinary yükleme hatası:', error);
    throw new Error('Dosya yüklenemedi');
  }
};

export { cloudinary };
