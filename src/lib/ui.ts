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
    '';

  if (direct) return direct;

  // Lokal dosya adıyla yüklenenler için:
  if (item?.imageFilename) return `/uploads/${item.imageFilename}`;
  if (item?.image?.url) return item.image.url;

  return '';
}
