import { NextRequest, NextResponse } from 'next/server'
import { authenticate } from '@/lib/auth'
import { toErrorLike } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 /api/auth/me çağrıldı')
    
    const user = await authenticate(request)
    console.log('👤 Auth sonucu:', user ? 'Başarılı' : 'Başarısız')
    
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı')
      return NextResponse.json({ 
        success: false, 
        message: 'Yetkisiz erişim' 
      }, { status: 401 })
    }
    
    console.log('✅ Kullanıcı bilgileri döndürülüyor:', user.email)
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error: unknown) {
    const e = toErrorLike(error);
    console.error('❌ /api/auth/me hatası:', e);
    return NextResponse.json({ 
      success: false, 
      message: 'Bir hata oluştu',
      details: e.message,
      code: e.code,
      meta: e.meta
    }, { status: 500 })
  }
}
