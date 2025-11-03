import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { Event } from "@/models/Event";
import { Management } from "@/models/Management";

export async function GET(req: NextRequest) {
  try {
    console.log('🏥 Health check başladı');
    
    // MongoDB bağlantısını test et
    await connectDB();
    console.log('✅ MongoDB bağlantısı başarılı');
    
    // Veri sayılarını kontrol et
    const announcementsCount = await Announcement.countDocuments({});
    const eventsCount = await Event.countDocuments({});
    const managementCount = await Management.countDocuments({});
    
    console.log('📊 Veri sayıları:', {
      announcements: announcementsCount,
      events: eventsCount,
      management: managementCount
    });
    
    // Environment variables kontrolü
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set'
    };
    
    console.log('🔧 Environment variables:', envCheck);
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        collections: {
          announcements: announcementsCount,
          events: eventsCount,
          management: managementCount
        }
      },
      environment: envCheck,
      message: 'Sistem sağlıklı çalışıyor'
    });
    
  } catch (error) {
    console.error('❌ Health check hatası:', error);
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Sistemde sorun var'
    }, { status: 500 });
  }
}
