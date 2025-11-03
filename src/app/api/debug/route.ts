import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log('🐛 Debug API çağrıldı');
    
    // Request bilgilerini logla
    const url = req.url;
    const method = req.method;
    
    // Headers'ı Next.js 15 uyumlu şekilde al
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    console.log('📡 Request bilgileri:', {
      url,
      method,
      headers: {
        'user-agent': headers['user-agent'],
        'host': headers['host'],
        'x-forwarded-for': headers['x-forwarded-for'],
        'x-forwarded-proto': headers['x-forwarded-proto']
      }
    });
    
    // Environment variables kontrolü
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    };
    
    console.log('🔧 Environment variables:', envVars);
    
    // URL parsing test
    let urlParseResult = 'success';
    try {
      new URL('/api/test?param=value');
    } catch (error) {
      urlParseResult = `error: ${error instanceof Error ? error.message : 'Unknown'}`;
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      request: {
        url,
        method,
        headers: {
          'user-agent': headers['user-agent'],
          'host': headers['host']
        }
      },
      environment: envVars,
      urlParsing: {
        test: urlParseResult
      },
      message: 'Debug bilgileri başarıyla alındı'
    });
    
  } catch (error) {
    console.error('❌ Debug API hatası:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Debug bilgileri alınamadı'
    }, { status: 500 });
  }
}
