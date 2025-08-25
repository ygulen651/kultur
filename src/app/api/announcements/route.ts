import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Announcement } from "@/models/Announcement";
import { verifyToken } from "@/lib/auth";

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
    const status = searchParams.get('status') || searchParams.get('published') || 'published';
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    console.log('🔍 API Parametreleri:', { status, limit, category, featured });
    
    // Basit query - sadece status kontrolü
    const query: Record<string, unknown> = { status: status };
    
    if (category) query.category = category;
    if (featured === 'true') {
      query.featured = true;
    }
    
    console.log('🔍 Duyurular query:', JSON.stringify(query, null, 2));
    
    // Önce tüm duyuruları sayalım
    const totalCount = await Announcement.countDocuments({});
    console.log('📊 Toplam duyuru sayısı:', totalCount);
    
    // Status'a göre sayalım
    const statusCount = await Announcement.countDocuments({ status: status });
    console.log(`📊 Status '${status}' olan duyuru sayısı:`, statusCount);
    
    const announcements = await Announcement.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    console.log('📢 MongoDB\'den bulunan duyurular:', announcements.length);
    console.log('📢 İlk duyuru örneği:', announcements[0] ? {
      _id: announcements[0]._id,
      title: announcements[0].title,
      status: announcements[0].status,
      category: announcements[0].category
    } : 'Duyuru yok');
    
    return NextResponse.json({ 
      success: true, 
      items: announcements,
      count: announcements.length,
      debug: {
        query,
        totalCount,
        statusCount,
        foundCount: announcements.length
      }
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
    // Authentication kontrolü
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'UNAUTHORIZED',
        message: 'Yetkilendirme gerekli'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ 
        success: false, 
        error: 'INVALID_TOKEN',
        message: 'Geçersiz token'
      }, { status: 401 });
    }

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
        tags: body.tags ? body.tags.split(',').map((tag: string) => tag.trim()) : [],
        // Ek görseller ve dosyalar
        images: body.images || [],
        files: body.files || []
      };
    } else {
      // API verilerini işle
      announcementData = {
        title: body.title,
        excerpt: body.excerpt || "",
        content: body.content || "",
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        isFeatured: body.isFeatured || false,
        imageFilename: body.imageFilename || "",
        featuredImageUrl: body.featuredImageUrl || "",
        // Ek görseller ve dosyalar
        images: body.images || [],
        files: body.files || [],
        fields: body.fields || {},
        category: body.category || 'genel',
        tags: body.tags ? (Array.isArray(body.tags) ? body.tags : body.tags.split(',').map((tag: string) => tag.trim())) : [],
        status: body.status || 'draft',
        author: body.author || 'Admin'
      };
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
