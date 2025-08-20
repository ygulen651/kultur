import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Rapor from "@/models/Rapor";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const deleted = await Rapor.findByIdAndDelete(params.id);
    
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "Kayıt bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Kayıt silindi" });
  } catch (err: any) {
    console.error("DELETE /api/rapor/[id] error:", err);
    return NextResponse.json(
      { ok: false, error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
