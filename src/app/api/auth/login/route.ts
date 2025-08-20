import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Basit admin giriş kontrolü (veri çağrıları kapalı)
    if (email === 'admin@sendika.com' && password === 'admin123') {
      return NextResponse.json({
        success: true,
        message: 'Giriş başarılı',
        data: {
          token: 'dummy-admin-token-' + Date.now(),
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

    // Yanlış bilgiler
    return NextResponse.json({
      success: false,
      message: 'E-posta veya şifre hatalı'
    }, { status: 401 })

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Bir hata oluştu'
    }, { status: 500 })
  }
}
