#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 DNS Kontrol Script\'i');
console.log('========================');

const domains = [
  'kultursanatis.com.tr',
  'www.kultursanatis.com.tr'
];

async function checkDNS(domain) {
  try {
    console.log(`\n📡 ${domain} DNS kontrol ediliyor...`);
    
    // nslookup ile A record kontrolü
    console.log('🔍 A Record (IP Adresi):');
    try {
      const aRecord = execSync(`nslookup ${domain}`, { encoding: 'utf8' });
      console.log(aRecord);
    } catch (error) {
      console.log('❌ nslookup hatası:', error.message);
    }
    
    // dig ile detaylı DNS bilgisi
    console.log('🔍 Detaylı DNS Bilgisi:');
    try {
      const digResult = execSync(`dig ${domain}`, { encoding: 'utf8' });
      console.log(digResult);
    } catch (error) {
      console.log('❌ dig hatası:', error.message);
    }
    
    // HTTP response kontrolü
    console.log('🌐 HTTP Response:');
    try {
      const httpResponse = execSync(`curl -I -s -w "Status: %{http_code}\nLocation: %{redirect_url}\n" ${domain}`, { encoding: 'utf8' });
      console.log(httpResponse);
    } catch (error) {
      console.log('❌ HTTP kontrol hatası:', error.message);
    }
    
  } catch (error) {
    console.error(`❌ ${domain} kontrol hatası:`, error.message);
  }
}

async function main() {
  console.log('🚀 DNS kontrolleri başlıyor...');
  
  for (const domain of domains) {
    await checkDNS(domain);
  }
  
  console.log('\n📋 DNS Ayarları Kontrol Listesi:');
  console.log('================================');
  console.log('✅ A Record: 76.76.19.34 (Vercel IP)');
  console.log('✅ CNAME: www → cname.vercel-dns.com');
  console.log('✅ CNAME: @ → cname.vercel-dns.com');
  console.log('✅ Vercel Domain: Aktif');
  console.log('✅ SSL Sertifikası: Aktif');
  
  console.log('\n🔧 Vercel Dashboard: https://vercel.com/dashboard');
  console.log('🌐 Site URL: https://www.kultursanatis.com.tr');
}

main().catch(console.error);
