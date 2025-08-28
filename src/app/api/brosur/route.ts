import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Brosur } from "@/models/Brosur";

// Tüm broşürleri getir (sadece aktif olanlar)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    
    let query: any = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    const items = await Brosur.find(query)
      .sort({ order: 1, createdAt: -1 })
      .select('title description imageUrl imageAlt category tags createdAt');
    
    return NextResponse.json({ 
      ok: true, 
      items,
      total: items.length
    });
  } catch (error) {
    console.error("GET /api/brosur error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Broşürler yüklenemedi" 
    }, { status: 500 });
  }
}

// Yeni broşür ekle
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    if (!body.title || !body.imageUrl) {
      return NextResponse.json({ 
        ok: false, 
        error: "Başlık ve görsel zorunlu" 
      }, { status: 400 });
    }
    
    // Broşür verisi
    const brosurData = {
      title: body.title.trim(),
      description: body.description?.trim() || '',
      imageUrl: body.imageUrl.trim(),
      imageAlt: body.imageAlt?.trim() || body.title.trim(),
      category: body.category?.trim() || 'Genel',
      tags: body.tags || [],
      isActive: body.isActive !== undefined ? body.isActive : true,
      order: body.order || 0
    };
    
    // En yüksek order'ı bul
    const maxOrder = await Brosur.findOne().sort({ order: -1 }).select('order');
    if (maxOrder && brosurData.order === 0) {
      brosurData.order = maxOrder.order + 1;
    }
    
    const created = await Brosur.create(brosurData);
    
    return NextResponse.json({ 
      ok: true, 
      item: created,
      message: "Broşür başarıyla oluşturuldu"
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("POST /api/brosur error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Broşür eklenemedi",
      details: error.message
    }, { status: 500 });
  }
}
