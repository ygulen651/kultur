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
    const json = await req.json();
    
    console.log("Afis API - Received data:", json);
    
    const data = Body.parse(json);
    const created = await Afis.create(data);

    return NextResponse.json({ ok: true, item: created }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/afis error:", err);
    
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
    return NextResponse.json({ ok: false, error: "Sunucu hatası" }, { status: 500 });
  }
}
