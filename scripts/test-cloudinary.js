const https = require('https');

async function testCloudinaryURL() {
  // Test edilecek Cloudinary URL'i
  const testURL = 'https://res.cloudinary.com/dcuzvxaip/raw/upload/v1756205642/kultur-sanat-is/neden-kultur-sanat-is-sendikasina-uye-olmalıyız.pdf';
  
  console.log('🔍 Cloudinary URL test ediliyor...');
  console.log('URL:', testURL);
  console.log('');
  
  return new Promise((resolve, reject) => {
    https.get(testURL, (response) => {
      console.log('✅ Fetch başarılı!');
      console.log('Status:', response.statusCode);
      console.log('Status Message:', response.statusMessage);
      console.log('Headers:');
      
      Object.keys(response.headers).forEach(key => {
        console.log(`  ${key}: ${response.headers[key]}`);
      });
      
      if (response.statusCode === 200) {
        console.log('');
        console.log('📄 Dosya içeriği alınıyor...');
        
        let data = [];
        response.on('data', (chunk) => {
          data.push(chunk);
        });
        
        response.on('end', () => {
          const buffer = Buffer.concat(data);
          console.log('✅ Dosya boyutu:', buffer.length, 'bytes');
          console.log('✅ Dosya türü: PDF');
          
          // İlk birkaç byte'ı kontrol et
          const header = buffer.slice(0, 4).toString('hex').match(/.{1,2}/g).join(' ');
          console.log('✅ Dosya header (hex):', header);
          
          // PDF magic number kontrolü
          if (header === '25 50 44 46') {
            console.log('✅ Bu gerçekten bir PDF dosyası!');
          } else {
            console.log('⚠️  Bu PDF dosyası olmayabilir');
          }
          
          resolve();
        });
        
      } else {
        console.log('❌ Fetch başarısız:', response.statusCode, response.statusMessage);
        resolve();
      }
      
    }).on('error', (error) => {
      console.error('❌ Hata oluştu:');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      reject(error);
    });
  });
}

testCloudinaryURL().catch(console.error);
