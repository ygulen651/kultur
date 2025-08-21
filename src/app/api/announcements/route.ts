import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";

export const revalidate = 0;

function computeCover(it: any): string {
  const raw =
    it?.fields?.image?.url ||
    it?.featuredImageUrl ||
    it?.image?.url ||
    it?.image?.filename ||
    it?.imageFilename ||
    it?.fields?.image?.filename ||
    "";
  const v = String(raw || "").trim().replace(/^C:\\fakepath\\/, "");
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return v.startsWith("/uploads/") ? v : `/uploads/${v}`;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'published';
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    const query: Record<string, unknown> = { status };
    
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    
    const announcements = await Announcement.find(query)
      .sort({ publishDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      items: announcements,
      count: announcements.length 
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('GET /api/announcements error:', errorMessage);
    return NextResponse.json({ 
      success: false, 
      error: 'FETCH_FAILED',
      message: errorMessage
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const fromForm = body.fromForm || false;
    
         let announcementData: Record<string, unknown>;
    
    if (fromForm) {
      // Form verilerini işle
      announcementData = {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt || body.content?.substring(0, 150),
        category: body.category || 'Genel',
        status: body.status || 'draft',
        featured: body.featured || false,
        publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
        author: body.author || 'Anonim',
        tags: body.tags ? body.tags.split(',').map((tag: string) => tag.trim()) : []
      };
    } else {
      // API verilerini işle
      announcementData = body;
    }
    
    const announcement = new Announcement(announcementData);
    await announcement.save();
    
    return NextResponse.json({ 
      success: true, 
      item: announcement,
      message: 'Duyuru başarıyla oluşturuldu'
    }, { status: 201 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('POST /api/announcements error:', errorMessage);
    return NextResponse.json({ 
      success: false, 
      error: 'CREATE_FAILED',
      message: errorMessage
    }, { status: 500 });
  }
}
