import { DATA_DISABLED } from './config';

// Uygulama genelinde bundan çağıracağız.
export async function safeFetch<T = unknown>(_url?: string, _init?: RequestInit): Promise<T | null> {
  // Veri tamamen kapalı: ASLA gerçek fetch yapma
  if (DATA_DISABLED) return null;
  // (Gerekirse ileride açılacak)
  return null;
}

// Örnek getter'lar: hepsi boş döner
export async function getSiteData() {
  return DATA_DISABLED ? { 
    hero: null, 
    highlights: [], 
    footer: null,
    mission: {
      mission: "Kamu çalışanlarının haklarını korumak, sosyal ve ekonomik durumlarını iyileştirmek, demokratik ve laik cumhuriyeti desteklemek.",
      vision: "Türkiye'nin en güçlü ve etkili kamu sendikası olmak, çalışanların sesini en yüksek perdeden duyurmak.",
      values: "Adalet, eşitlik, dayanışma, şeffaflık ve demokratik katılım ilkelerimizle hareket ediyoruz."
    },
    settings: null,
    theme: null,
    menu: null,
    socials: null
  } : null;
}

export async function getAnnouncements(params?: Record<string, string>) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const search = new URLSearchParams({
      status: "published",
      limit: "6",
      ...(params ?? {}),
    }).toString();
    const url = `${base}/api/announcements?${search}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function getEvents(params?: Record<string, string>) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  const qs = new URLSearchParams({ ...(params ?? {}) }).toString();
  const url = base ? `${base}/api/events${qs ? `?${qs}` : ''}` : `/api/events${qs ? `?${qs}` : ''}`;

  try {
    const res = await fetch(url, { cache: 'no-store' }); // ⬅️ kritik
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.items) ? data.items : [];
  } catch (e) {
    console.error('getEvents error:', e);
    return [];
  }
}

export async function getGallery() { 
  return DATA_DISABLED ? [] : []; 
}

export async function getKamuAr() { 
  return DATA_DISABLED ? [] : []; 
}

// Eski press fonksiyonları kaldırıldı - artık ayrı API'ler kullanılıyor

export async function getSliders() {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const url = `${base}/api/sliders`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.items) ? data.items : [];
  } catch {
    return [];
  }
}

export async function getDocuments() {
  return DATA_DISABLED ? [] : [];
}

export async function getKulturSanatIs() {
  return DATA_DISABLED ? [] : [];
}

export async function getMembers(group?: string) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const url = base ? `${base}/api/members${group ? `?group=${group}` : ''}` : `/api/members${group ? `?group=${group}` : ''}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    return Array.isArray(data?.items) ? data.items : [];
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('getMembers error:', errorMessage);
    return [];
  }
}

export async function getContactInfo() {
  return DATA_DISABLED ? null : null;
}

export async function getBoardMembers(group?: string) {
  return DATA_DISABLED ? [] : [];
}
