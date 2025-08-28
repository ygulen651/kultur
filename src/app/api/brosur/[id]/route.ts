import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Brosur } from "@/models/Brosur";

// Tek broşür getir
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const item = await Brosur.findById(id);
    if (!item) {
      return NextResponse.json({ 
        ok: false, 
        error: "Broşür bulunamadı" 
      }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, item });
  } catch (error) {
    console.error("GET /api/brosur/[id] error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Broşür yüklenemedi" 
    }, { status: 500 });
  }
}

// Broşür güncelle
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    
    const item = await Brosur.findById(id);
    if (!item) {
      return NextResponse.json({ 
        ok: false, 
        error: "Broşür bulunamadı" 
      }, { status: 404 });
    }
    
    // Güncellenecek alanlar
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl.trim();
    if (body.imageAlt !== undefined) updateData.imageAlt = body.imageAlt.trim();
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.order !== undefined) updateData.order = body.order;
    
    const updated = await Brosur.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ 
      ok: true, 
      item: updated,
      message: "Broşür başarıyla güncellendi"
    });
    
  } catch (error: any) {
    console.error("PUT /api/brosur/[id] error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Broşür güncellenemedi",
      details: error.message
    }, { status: 500 });
  }
}

// Broşür sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const item = await Brosur.findById(id);
    if (!item) {
      return NextResponse.json({ 
        ok: false, 
        error: "Broşür bulunamadı" 
      }, { status: 404 });
    }
    
    await Brosur.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      ok: true, 
      message: "Broşür başarıyla silindi"
    });
    
  } catch (error: any) {
    console.error("DELETE /api/brosur/[id] error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Broşür silinemedi",
      details: error.message
    }, { status: 500 });
  }
}
