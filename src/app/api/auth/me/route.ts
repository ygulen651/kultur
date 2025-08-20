import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Authorization header'ı kontrol et
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Yetkilendirme hatası'
      }, { status: 401 })
    }

    // Token'ı al
    const token = authHeader.replace('Bearer ', '')
    
    // Basit token kontrolü (veri çağrıları kapalı)
    if (token.startsWith('dummy-admin-token-')) {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: 'admin-1',
            email: 'admin@sendika.com',
            name: 'Admin',
            role: 'admin',
            avatar: null
          }
        }
      }, { status: 200 })
    }

    // Geçersiz token
    return NextResponse.json({
      success: false,
      message: 'Geçersiz token'
    }, { status: 401 })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Bir hata oluştu'
    }, { status: 500 })
  }
}
