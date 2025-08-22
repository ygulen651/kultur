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
    // Local development için test verisi
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          _id: '1',
          title: 'Test Duyuru 1',
          excerpt: 'Bu bir test duyurusudur',
          content: 'Test duyuru içeriği burada yer alacak',
          status: 'published',
          featured: true,
          publishDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: 'Test Duyuru 2',
          excerpt: 'İkinci test duyurusu',
          content: 'İkinci test duyuru içeriği',
          status: 'published',
          featured: false,
          publishDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

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
  // Local development için test verisi
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        _id: '1',
        title: 'Test Etkinlik 1',
        excerpt: 'Bu bir test etkinliğidir',
        content: 'Test etkinlik içeriği burada yer alacak',
        status: 'published',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 hafta sonra
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 saat sürecek
        location: 'Test Lokasyon',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'Test Etkinlik 2',
        excerpt: 'İkinci test etkinliği',
        content: 'İkinci test etkinlik içeriği',
        status: 'published',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 hafta sonra
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(), // 3 saat sürecek
        location: 'Test Lokasyon 2',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

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
  // Local development için test verisi
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        _id: '1',
        title: 'Test Slider 1',
        description: 'Bu bir test slider\'dır',
        imageUrl: '/uploads/test-slider-1.jpg',
        link: '/duyurular/test-duyuru-1',
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'Test Slider 2',
        description: 'İkinci test slider',
        imageUrl: '/uploads/test-slider-2.jpg',
        link: '/etkinlikler/test-etkinlik-1',
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

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
  // Local development için test verisi
  if (process.env.NODE_ENV === 'development') {
    return [
      {
        _id: '1',
        name: 'Test Üye 1',
        position: 'Başkan',
        bio: 'Test üye biyografisi burada yer alacak',
        photo: '/uploads/test-member-1.jpg',
        email: 'test1@example.com',
        phone: '+90 555 123 4567',
        experience: '10+ yıl deneyim',
        education: 'Üniversite mezunu',
        group: group || 'yonetim-kurulu',
        order: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        name: 'Test Üye 2',
        position: 'Başkan Yardımcısı',
        bio: 'İkinci test üye biyografisi',
        photo: '/uploads/test-member-2.jpg',
        email: 'test2@example.com',
        phone: '+90 555 987 6543',
        experience: '8+ yıl deneyim',
        education: 'Yüksek lisans',
        group: group || 'yonetim-kurulu',
        order: 2,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  return DATA_DISABLED ? [] : [];
}
