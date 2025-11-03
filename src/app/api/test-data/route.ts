import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { Event } from "@/models/Event";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Duyuruları kontrol et
    const announcements = await Announcement.find({}).lean();
    console.log('📢 Duyurular bulundu:', announcements.length);
    
    // Etkinlikleri kontrol et
    const events = await Event.find({}).lean();
    console.log('🎉 Etkinlikler bulundu:', events.length);
    
    return NextResponse.json({
      success: true,
      announcements: {
        count: announcements.length,
        items: announcements.slice(0, 3) // İlk 3'ü göster
      },
      events: {
        count: events.length,
        items: events.slice(0, 3) // İlk 3'ü göster
      }
    });
  } catch (error) {
    console.error('Test data API hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Test duyuru verisi oluştur
    const testAnnouncement = await Announcement.create({
      title: "Test Duyuru - Sendika Güncellemeleri",
      excerpt: "Sendikamızda yapılan güncellemeler ve önemli değişiklikler hakkında bilgilendirme.",
      content: "Bu bir test duyurusudur. Sendikamızda yapılan güncellemeler ve önemli değişiklikler hakkında detaylı bilgi için devamını okuyun.",
      status: "published",
      publishDate: new Date(),
      featured: true,
      category: "Genel",
      author: "Sistem Yöneticisi",
      tags: ["duyuru", "güncelleme"]
    });
    
    console.log('✅ Test duyuru oluşturuldu:', testAnnouncement._id);
    
    return NextResponse.json({
      success: true,
      message: "Test duyuru oluşturuldu",
      announcement: testAnnouncement
    });
  } catch (error) {
    console.error('Test duyuru oluşturma hatası:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
