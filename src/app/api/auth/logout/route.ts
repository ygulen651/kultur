import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Her zaman 200 OK + boş JSON döndür
    return NextResponse.json({
      ok: true,
      message: 'Çıkış işlemi tamamlandı'
    }, { status: 200 });
  } catch (error) {
    // Hata durumunda bile 200 OK + boş JSON döndür
    return NextResponse.json({
      ok: true,
      message: 'Çıkış işlemi tamamlandı'
    }, { status: 200 });
  }
}
