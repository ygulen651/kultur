import { NextRequest, NextResponse } from 'next/server'
import { toErrorLike } from '@/lib/errors'

export async function POST(request: NextRequest) {
  try {
    // Her zaman 200 OK + boş JSON döndür
    return NextResponse.json({
      ok: true,
      message: 'Çıkış işlemi tamamlandı'
    }, { status: 200 });
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('Logout error:', e);
    // Hata durumunda bile 200 OK + boş JSON döndür
    return NextResponse.json({
      ok: true,
      message: 'Çıkış işlemi tamamlandı'
    }, { status: 200 });
  }
}
