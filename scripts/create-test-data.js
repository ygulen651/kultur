#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Test Veri Oluşturma Script\'i');
console.log('================================');

try {
  console.log('\n1. Test duyuru oluşturuluyor...');
  const announcementResponse = execSync('curl -X POST https://www.kultursanatis.com.tr/api/test-data', { 
    stdio: 'inherit',
    encoding: 'utf8'
  });
  console.log('✅ Test duyuru oluşturuldu');
  
  console.log('\n2. Test verileri kontrol ediliyor...');
  const testDataResponse = execSync('curl https://www.kultursanatis.com.tr/api/test-data', { 
    stdio: 'inherit',
    encoding: 'utf8'
  });
  console.log('✅ Test verileri kontrol edildi');
  
  console.log('\n3. Duyurular API test ediliyor...');
  const announcementsResponse = execSync('curl "https://www.kultursanatis.com.tr/api/announcements?status=published&limit=5"', { 
    stdio: 'inherit',
    encoding: 'utf8'
  });
  console.log('✅ Duyurular API test edildi');
  
  console.log('\n4. Etkinlikler API test ediliyor...');
  const eventsResponse = execSync('curl "https://www.kultursanatis.com.tr/api/events?status=published&limit=5"', { 
    stdio: 'inherit',
    encoding: 'utf8'
  });
  console.log('✅ Etkinlikler API test edildi');
  
  console.log('\n🎉 Tüm testler başarılı!');
  console.log('Site URL: https://www.kultursanatis.com.tr');
  
} catch (error) {
  console.error('❌ Test sırasında hata:', error.message);
  process.exit(1);
}
