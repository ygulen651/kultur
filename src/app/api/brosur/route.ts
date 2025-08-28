import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Brosur } from "@/models/Brosur";

const Body = z.object({
  title: z.string().min(2),
  summary: z.string().optional(),
  imageUrl: z.string().min(1),
  slug: z.string().min(1).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const items = await Brosur.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ ok: true, items }, { status: 200 });
  } catch (error) {
    console.error("GET /api/brosur error:", error);
    return NextResponse.json({ ok: false, error: "Veri çekilemedi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Request body'yi güvenli şekilde parse et
    let json;
    try {
      const bodyText = await req.text();
      if (!bodyText) {
        return NextResponse.json({ ok: false, error: "Boş request body" }, { status: 400 });
      }
      
      json = JSON.parse(bodyText);
      console.log("Brosur API - Received data:", json);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json({ ok: false, error: "Geçersiz JSON formatı" }, { status: 400 });
    }
    
    const data = Body.parse(json);
    
    // Slug otomatik oluştur
    const slug = data.slug || data.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    const brosurData = {
      ...data,
      slug,
      createdAt: new Date(),
    };
    
    const created = await Brosur.create(brosurData);
    console.log("Brosur created:", created);

    return NextResponse.json({ 
      ok: true, 
      item: created,
      message: "Broşür başarıyla oluşturuldu"
    }, { status: 201 });
    
  } catch (err: any) {
    console.error("POST /api/brosur error:", err);
    
    if (err?.code === 11000 && err?.keyPattern?.slug) {
      return NextResponse.json(
        { ok: false, error: "Aynı başlıktan oluşan slug zaten var." },
        { status: 409 }
      );
    }
    
    if (err?.issues) {
      return NextResponse.json({ 
        ok: false, 
        error: "Geçersiz veri", 
        details: err.issues
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: "Sunucu hatası",
      message: err?.message || "Bilinmeyen hata"
    }, { status: 500 });
  }
}
