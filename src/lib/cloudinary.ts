import { v2 as cloudinary } from "cloudinary";

// Environment değişkenlerini kontrol et
console.log('Cloudinary config check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '***' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'NOT SET');

if (!cloudinary.config().cloud_name) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('Cloudinary environment variables are missing!');
    throw new Error('Cloudinary configuration is incomplete');
  }
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  
  console.log('Cloudinary configured successfully');
} else {
  console.log('Cloudinary already configured');
}

// Cloudinary bağlantısını test et
export const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection test:', result);
    return true;
  } catch (error) {
    console.error('Cloudinary connection test failed:', error);
    return false;
  }
};

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

// PDF yükleme fonksiyonu
export const uploadPdf = async (
  file: Buffer | string,
  filename: string,
  options: {
    folder?: string;
    public_id?: string;
  } = {}
) => {
  try {
    const uploadOptions = {
      folder: options.folder || `${CLOUDINARY_CONFIG.folder}/pdfs`,
      public_id: options.public_id,
      resource_type: 'raw' as const,     // PDF için şart
      use_filename: true,
      unique_filename: false,
      filename_override: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      format: 'pdf',
      allowed_formats: ['pdf']
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
    console.error('PDF yükleme hatası:', error);
    throw new Error('PDF yüklenemedi');
  }
};

// Raw dosya yükleme fonksiyonu
export const uploadRawFile = async (
  file: Buffer | string,
  filename: string,
  options: {
    folder?: string;
    public_id?: string;
    resource_type?: 'raw' | 'auto';
  } = {}
) => {
  try {
    const uploadOptions = {
      folder: options.folder || `${CLOUDINARY_CONFIG.folder}/files`,
      public_id: options.public_id,
      resource_type: (options.resource_type || 'raw') as 'raw' | 'auto',
      use_filename: true,
      unique_filename: false,
      filename_override: filename,
      allowed_formats: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
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
    console.error('Raw dosya yükleme hatası:', error);
    throw new Error('Dosya yüklenemedi');
  }
};

// Cloudinary raw PDF URL üretimi
export function cloudinaryRawPdfUrl(publicId: string) {
  // publicId uzantısız gelecek: "pdfs/Neden-Kultur-...-Olmaliyiz"
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}.pdf`;
}

// Cloudinary raw URL üretimi (genel)
export function getCloudinaryRawUrl(publicId: string, format?: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const ext = format || publicId.split('.').pop() || 'pdf';
  // çıktı: https://res.cloudinary.com/<cloud>/raw/upload/<publicId>.<ext>
  return `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}.${ext}`;
}

// Cloudinary image URL üretimi
export function getCloudinaryImageUrl(publicId: string, transformation?: any[]) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  if (transformation && transformation.length > 0) {
    const transStr = transformation.map(t => Object.entries(t).map(([k, v]) => `${k}_${v}`).join(',')).join('/');
    url += `/${transStr}`;
  }
  
  url += `/${publicId}`;
  return url;
}

export { cloudinary };

