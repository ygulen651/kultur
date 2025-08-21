import { getSiteMenu } from "@/lib/menu";
import Link from "next/link";

export default async function Footer() {
  const menu = await getSiteMenu();
  const ft = menu?.footer;
  if (!ft?.isActive) return null;

  return (
    <footer className="bg-[#141c2a] text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-8">
        {/* ANASAYFA */}
        <div>
          <h4 className="text-sm font-semibold mb-4">ANASAYFA</h4>
          <ul className="space-y-2 text-sm/6 text-white/80">
            <li><Link href="/" className="hover:underline">Ana Sayfa</Link></li>
            <li><Link href="/duyurular" className="hover:underline">Duyurular</Link></li>
            <li><Link href="/etkinlikler" className="hover:underline">Etkinlikler</Link></li>
            <li><Link href="/galeri" className="hover:underline">Galeri</Link></li>
            <li><Link href="/tuzuk" className="hover:underline">Tüzük</Link></li>
            <li><Link href="/yonetim" className="hover:underline">Yönetim</Link></li>
            <li><Link href="/iletisim" className="hover:underline">İletişim</Link></li>
          </ul>
        </div>

        {/* SENDİKALAR */}
        <div>
          <h4 className="text-sm font-semibold mb-4">SENDİKALAR</h4>
          <ul className="space-y-2 text-sm/6 text-white/80">
            <li><a href="https://burois.org" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              BÜRO-İŞ <span className="ml-1 text-xs">↗</span>
            </a></li>
            <li><a href="https://egitimis.org" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              EĞİTİM-İŞ <span className="ml-1 text-xs">↗</span>
            </a></li>
            <li><a href="https://enerjiis.org" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              ENERJİ-İŞ <span className="ml-1 text-xs">↗</span>
            </a></li>
            <li><a href="https://tarimormanis.org" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              TARIM ORMAN-İŞ <span className="ml-1 text-xs">↗</span>
            </a></li>
            <li><a href="https://genelsaglikis.org" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              GENEL SAĞLIK-İŞ <span className="ml-1 text-xs">↗</span>
            </a></li>
            <li><a href="https://kultursanatis.org" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              KÜLTÜR SANAT-İŞ <span className="ml-1 text-xs">↗</span>
            </a></li>
            <li><a href="https://tapucevreyolis.org" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              TAPU ÇEVRE YOL-İŞ <span className="ml-1 text-xs">↗</span>
            </a></li>
          </ul>
        </div>

        {/* BİRLEŞİK KAMU İŞ */}
        <div>
          <h4 className="text-sm font-semibold mb-4">BİRLEŞİK KAMU İŞ</h4>
          <ul className="space-y-2 text-sm/6 text-white/80">
            <li><a href="https://birlesikkamuis.org" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              Birleşik Kamu İş Tüzüğü <span className="ml-1 text-xs">↗</span>
            </a></li>
            <li><a href="https://birlesikkamuis.org/tumsildilikler" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              TÜMSİLDİLİKLER <span className="ml-1 text-xs">↗</span>
            </a></li>
            <li><a href="https://birlesikkamuis.org/konfederasyon" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              Konfederasyon <span className="ml-1 text-xs">↗</span>
            </a></li>
            <li><a href="https://birlesikkamuis.org/merkez-yonetim" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
              Merkez Yönetim <span className="ml-1 text-xs">↗</span>
            </a></li>
          </ul>
        </div>

        {/* İLETİŞİM */}
        <div>
          <h4 className="text-sm font-semibold mb-4">İLETİŞİM</h4>
          <div className="text-sm/6 text-white/80 space-y-2">
            <div className="flex items-center">
              <span className="mr-2">📧</span>
              <a href="mailto:info@kultursanatis.org" className="hover:underline">info@kultursanatis.org</a>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📞</span>
              <a href="tel:+903124198579" className="hover:underline">0312-419 85 79</a>
            </div>
            <div className="flex items-start">
              <span className="mr-2 mt-1">📍</span>
              <span>Şehit Adem Yavuz Sokak. Hitit Apt. No:14/14 Kızılay / ANKARA</span>
            </div>
            <div className="flex gap-3 pt-2">
              <a href="https://facebook.com/kultursanatis" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span className="text-white text-xs font-bold">f</span>
              </a>
              <a href="https://twitter.com/kultursanatis" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors">
                <span className="text-white text-xs font-bold">𝕏</span>
              </a>
              <a href="https://instagram.com/kultursanatis" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors">
                <span className="text-white text-xs font-bold">📷</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Harita - Kırmızı logo kaldırıldı */}
      <div className="w-full h-[400px] bg-gray-100">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3060.1234567890123!2d32.8597!3d39.9334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d347d1b4b4b4b4%3A0x1234567890123456!2sK%C3%BClt%C3%BCr%20Sanat%20%C4%B0%C5%9F%20Sendikas%C4%B1!5e0!3m2!1str!2str!4v1234567890123"
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          title="Kültür Sanat İş Sendikası Konumu"
        />
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between text-white/70 text-xs">
        <div>© {new Date().getFullYear()} Kültür-İş. Tüm hakları saklıdır.</div>
        <div className="flex items-center gap-4">
          <Link href="/gizlilik-politikasi" className="hover:underline">Gizlilik Politikası</Link>
          <Link href="/kullanim-sartlari" className="hover:underline">Kullanım Şartları</Link>
          <Link href="/cerez-politikasi" className="hover:underline">Çerez Politikası</Link>
        </div>
      </div>
    </footer>
  );
}
