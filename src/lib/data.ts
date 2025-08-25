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
    console.log('🔄 getAnnouncements çağrıldı, params:', params);
    
    const search = new URLSearchParams({
      status: "published",
      limit: "3",
      ...(params ?? {}),
    }).toString();
    
    const url = `/api/announcements?${search}`;
    console.log('📡 Duyurular API URL:', url);
    
    const res = await fetch(url, { cache: "no-store" });
    console.log('📊 Duyurular API response status:', res.status);
    
    if (!res.ok) {
      console.log('❌ Duyurular API hatası:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    console.log('📢 Duyurular API data:', data);
    const items = Array.isArray(data?.items) ? data.items : [];
    console.log('✅ Duyurular yüklendi, sayı:', items.length);
    return items;
  } catch (error) {
    console.error('❌ Duyurular API exception:', error);
    return [];
  }
}

export async function getEvents(params?: Record<string, string>) {
  try {
    console.log('🔄 getEvents çağrıldı, params:', params);
    
    const qs = new URLSearchParams({ ...(params ?? {}) }).toString();
    const url = `/api/events${qs ? `?${qs}` : ''}`;
    console.log('📡 Etkinlikler API URL:', url);

    const res = await fetch(url, { cache: 'no-store' });
    console.log('📊 Etkinlikler API response status:', res.status);
    
    if (!res.ok) {
      console.log('❌ Etkinlikler API hatası:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json().catch(() => ({}));
    console.log('🎉 Etkinlikler API data:', data);
    const items = Array.isArray(data?.items) ? data.items : [];
    console.log('✅ Etkinlikler yüklendi, sayı:', items.length);
    return items;
  } catch (e) {
    console.error('❌ Etkinlikler API exception:', e);
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
    console.log('🔄 getSliders çağrıldı');
    
    const url = `/api/sliders`;
    console.log('📡 Sliders API URL:', url);
    
    const res = await fetch(url, { cache: "no-store" });
    console.log('📊 Sliders API response status:', res.status);
    
    if (!res.ok) {
      console.log('❌ Sliders API hatası:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    console.log('✅ Sliders API data:', data);
    const items = Array.isArray(data?.items) ? data.items : [];
    console.log('✅ Sliders yüklendi, sayı:', items.length);
    return items;
  } catch (e) {
    console.error('❌ Sliders API exception:', e);
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
    const url = `/api/members${group ? `?group=${group}` : ''}`;
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
  try {
    console.log('🔄 getBoardMembers çağrıldı, group:', group);
    
    const url = `/api/boards/yonetim-kurulu${group ? `?group=${group}` : ''}`;
    console.log('📡 Yönetim kurulu API URL:', url);
    
    const res = await fetch(url, { cache: 'no-store' });
    console.log('📊 Yönetim kurulu API response status:', res.status);
    
    if (!res.ok) {
      console.log('❌ Yönetim kurulu API hatası:', res.status, res.statusText);
      return [];
    }
    
    const data = await res.json();
    console.log('✅ Yönetim kurulu API data:', data);
    // API'den data.data geliyor, data.items değil
    const items = Array.isArray(data?.data) ? data.data : [];
    console.log('✅ Yönetim kurulu yüklendi, sayı:', items.length);
    return items;
  } catch (e) {
    console.error('❌ Yönetim kurulu API exception:', e);
    return [];
  }
}
