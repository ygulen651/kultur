import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const publicId = url.searchParams.get("publicId"); // ör: sendika/uploads/NEDEN__...
    
    if (!publicId) {
      return NextResponse.json({ error: "publicId gerekli" }, { status: 400 });
    }

    console.log("Debug - Checking publicId:", publicId);

    const res = await cloudinary.api.resource(publicId, { resource_type: "raw" });
    
    console.log("Debug - Cloudinary API response:", {
      type: res.type,
      resource_type: res.resource_type,
      access_mode: res.access_mode,
      public_id: res.public_id
    });

    // Önemli alanlar: type, resource_type, access_mode, secure_url
    return NextResponse.json({
      type: res.type,                // ⇦ BURADA "upload" görmelisin
      resource_type: res.resource_type, // ⇦ "raw" olmalı
      access_mode: res.access_mode,  // ⇦ "public" olmalı
      secure_url: res.secure_url,
      public_id: res.public_id,
      bytes: res.bytes,
      format: res.format
    });

  } catch (error) {
    console.error("Debug - Cloudinary API error:", error);
    return NextResponse.json({ 
      error: "Cloudinary API hatası", 
      message: error instanceof Error ? error.message : "Bilinmeyen hata",
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
