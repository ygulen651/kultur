// scripts/test-upload.ts
import { uploadImageToCloudinary } from '../src/lib/uploadImage';

async function testUpload() {
  try {
    console.log('Cloudinary yükleme testi başlıyor...');
    
    // Test için dummy file oluştur (gerçek uygulamada File objesi kullanılır)
    const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    const result = await uploadImageToCloudinary(testFile, {
      folder: 'test'
    });
    
    console.log('✅ Yükleme başarılı:', result);
  } catch (error) {
    console.error('❌ Yükleme hatası:', error);
  }
}

testUpload();
