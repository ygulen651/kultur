import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'

export async function GET() {
  try {
    await connectDB()
    
    return NextResponse.json({
      status: 'healthy',
      message: 'MongoDB bağlantısı başarılı',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check hatası:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      message: 'MongoDB bağlantısı başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
