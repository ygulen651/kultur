// src/lib/ui.ts
export function pickAnnouncementCover(item: any): string {
  if (!item) return '';

  // En güvenilir alanlar – Cloudinary tam URL:
  const direct =
    item.cover ||
    item?.fields?.image?.url ||      // { fields: { image: { url } } } — Cloudinary
    item?.featuredImageUrl ||        // bazı akışlarda bu alan var
    item?.imageUrl ||                // API'den gelen normalize edilmiş alan
    item?.coverUrl ||                // API'den gelen cover alanı
    item?.featuredImage ||           // Yeni featuredImage alanı
    item?.image ||                   // Genel image alanı
    '';

  if (direct) return direct;

  // Cloudinary URL'leri için:
  if (item?.image?.url) return item.image.url;

  // Varsayılan görsel
  return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop';
}
