import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "ID belirtilmedi" },
        { status: 400 }
      );
    }

    // Post'u bul ve sil
    const deletedPost = await Post.findByIdAndDelete(id);
    
    if (!deletedPost) {
      return NextResponse.json(
        { error: "İçerik bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "İçerik başarıyla silindi",
      deletedPost: {
        id: deletedPost._id,
        title: deletedPost.title
      }
    });

  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json(
      { error: "Sunucu hatası", message: "İçerik silinemedi" },
      { status: 500 }
    );
  }
}
