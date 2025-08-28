const { cloudinary } = require('../src/lib/cloudinary');

console.log('Cloudinary Test Script');
console.log('=====================');

// Environment değişkenlerini kontrol et
console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '***' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'NOT SET');
console.log('CLOUDINARY_UPLOAD_FOLDER:', process.env.CLOUDINARY_UPLOAD_FOLDER);

// Cloudinary konfigürasyonunu kontrol et
console.log('\nCloudinary Config:');
console.log('Cloud Name:', cloudinary.config().cloud_name);
console.log('API Key:', cloudinary.config().api_key ? '***' : 'NOT SET');
console.log('API Secret:', cloudinary.config().api_secret ? '***' : 'NOT SET');

// Test upload yap
async function testUpload() {
  try {
    console.log('\nTesting upload...');
    
    // Basit bir test buffer oluştur
    const testBuffer = Buffer.from('Test file content');
    
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'sendika/uploads',
          resource_type: 'raw',
          public_id: 'test-file-' + Date.now()
        },
        (error, result) => {
          if (error) {
            console.error('Upload error:', error);
            reject(error);
          } else {
            console.log('Upload successful:', result);
            resolve(result);
          }
        }
      );
      
      stream.write(testBuffer);
      stream.end();
    });
    
    console.log('Test upload successful!');
    console.log('Public ID:', result.public_id);
    console.log('URL:', result.secure_url);
    
  } catch (error) {
    console.error('Test upload failed:', error);
  }
}

testUpload();
