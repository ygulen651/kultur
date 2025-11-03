import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mayıs 1 İşçi Bayramı slaydını ekle
    const mayDaySlider = {
      _id: 'may-day-2025',
      title: '1 Mayıs İşçi Bayramı Kutlu Olsun',
      subtitle: 'Emek ve Dayanışma Günü',
      description: 'Tüm işçilerin 1 Mayıs Emek ve Dayanışma Günü kutlu olsun. Birlik ve mücadele ruhuyla daha güzel günlere...',
      image: '/kultur.png', // Mevcut kültür.png dosyasını kullan
      buttonText: 'Devamını Oku',
      buttonLink: '/duyurular',
      active: true,
      featured: true,
      category: 'Kutlama',
      createdAt: '2025-05-01T00:00:00.000Z',
      updatedAt: '2025-05-01T00:00:00.000Z'
    }

    // Her zaman 200 OK + slider verisi döndür
    return NextResponse.json({
      ok: true,
      data: [mayDaySlider]
    }, { status: 200 });
  } catch (error) {
    // Hata durumunda bile 200 OK + slider verisi döndür
    const mayDaySlider = {
      _id: 'may-day-2025',
      title: '1 Mayıs İşçi Bayramı Kutlu Olsun',
      subtitle: 'Emek ve Dayanışma Günü',
      description: 'Tüm işçilerin 1 Mayıs Emek ve Dayanışma Günü kutlu olsun. Birlik ve mücadele ruhuyla daha güzel günlere...',
      image: '/kultur.png',
      buttonText: 'Devamını Oku',
      buttonLink: '/duyurular',
      active: true,
      featured: true,
      category: 'Kutlama',
      createdAt: '2025-05-01T00:00:00.000Z',
      updatedAt: '2025-05-01T00:00:00.000Z'
    }

    return NextResponse.json({
      ok: true,
      data: [mayDaySlider]
    }, { status: 200 });
  }
}
