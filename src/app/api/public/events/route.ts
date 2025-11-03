import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Her zaman 200 OK + boş JSON döndür
    return NextResponse.json({
      ok: true,
      data: []
    }, { status: 200 });
  } catch (error) {
    // Hata durumunda bile 200 OK + boş JSON döndür
    return NextResponse.json({
      ok: true,
      data: []
    }, { status: 200 });
  }
}
