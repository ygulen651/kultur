import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bilgi belge dosya yollarını düzelt
  if (pathname.startsWith('/uploads/') || pathname.startsWith('/documents/')) {
    // Dosya yolu doğru, devam et
    return NextResponse.next()
  }

  // API rotaları için CORS ve body size limiti
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    // Video upload için body size limitini artır
    if (pathname === '/api/cloudinary/upload') {
      response.headers.set('Content-Length', '0')
      response.headers.set('Transfer-Encoding', 'chunked')
    }
    
    return response
  }

  // Diğer tüm istekler için devam et
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
