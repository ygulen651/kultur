import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { Afis } from "@/models/Afis";

const Body = z.object({
  title: z.string().min(2),
  summary: z.string().optional(),
  imageUrl: z.string().min(1),
  slug: z.string().min(1).optional(),
});

export async function GET(req: NextRequest) {
  await connectDB();
  
  const items = await Afis.find({}).sort({ createdAt: -1 });
  return NextResponse.json({ ok: true, items }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // FormData olarak gelen veriyi işle
    const formData = await req.formData();
    
    const title = formData.get('title') as string;
    const summary = formData.get('summary') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const slug = formData.get('slug') as string;
    
    console.log("Afis API - Received FormData:", { title, summary, imageUrl, slug });
    
    // Validation
    if (!title || title.length < 2) {
      return NextResponse.json({ ok: false, error: "Başlık en az 2 karakter olmalı" }, { status: 400 });
    }
    
    if (!imageUrl) {
      return NextResponse.json({ ok: false, error: "Görsel dosyası gerekli" }, { status: 400 });
    }
    
    const data = {
      title: title.trim(),
      summary: summary?.trim() || "",
      imageUrl: imageUrl,
      slug: slug?.trim() || title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
    };
    
    const created = await Afis.create(data);

    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/afis error:", err);
    
    if (err?.code === 11000 && err?.keyPattern?.slug) {
      return NextResponse.json(
        { ok: false, error: "Aynı başlıktan oluşan slug zaten var." },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ ok: false, error: "Sunucu hatası: " + err.message }, { status: 500 });
  }
}
