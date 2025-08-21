import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'
import { AdminUser } from '@/models/AdminUser'
import { connectDB } from '@/lib/mongodb'
import { toErrorLike } from '@/lib/errors'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Login API çağrıldı')
    const body = await request.json()
    const { email, password } = body
    console.log('📧 Giriş denemesi:', email)

    // Veritabanına bağlan
    console.log('📡 MongoDB bağlantısı başlatılıyor...')
    await connectDB()
    console.log('✅ MongoDB bağlantısı başarılı')
    
    // Admin kullanıcıyı bul
    console.log('👤 Admin kullanıcı aranıyor...')
    const adminUser = await AdminUser.findOne({ email, isActive: true })
    console.log('👤 Admin kullanıcı bulundu mu:', !!adminUser)
    
    if (!adminUser) {
      console.log('❌ Admin kullanıcı bulunamadı')
      return NextResponse.json({
        success: false,
        message: 'E-posta veya şifre hatalı'
      }, { status: 401 })
    }
    
    // Şifreyi kontrol et
    console.log('🔑 Şifre kontrol ediliyor...')
    const isPasswordValid = await bcrypt.compare(password, adminUser.password)
    console.log('🔑 Şifre doğru mu:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('❌ Şifre yanlış')
      return NextResponse.json({
        success: false,
        message: 'E-posta veya şifre hatalı'
      }, { status: 401 })
    }
    
    // JWT token oluştur
    console.log('🎫 JWT token oluşturuluyor...')
    const token = generateToken(adminUser)
    console.log('🎫 Token oluşturuldu mu:', !!token)
    
    console.log('✅ Login başarılı, token döndürülüyor')
    return NextResponse.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        token,
        user: {
          id: adminUser._id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role,
          avatar: adminUser.avatar
        }
      }
    }, { status: 200 })

    // Yanlış bilgiler
    return NextResponse.json({
      success: false,
      message: 'E-posta veya şifre hatalı'
    }, { status: 401 })

  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('Login error:', e);
    return NextResponse.json({
      success: false,
      message: 'Bir hata oluştu',
      details: e.message,
      code: e.code,
      meta: e.meta
    }, { status: 500 })
  }
}
