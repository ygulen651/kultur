import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Brosur from "@/models/Brosur";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const deleted = await Brosur.findByIdAndDelete(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "Kayıt bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Kayıt silindi" });
  } catch (err: any) {
    console.error("DELETE /api/brosur/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
