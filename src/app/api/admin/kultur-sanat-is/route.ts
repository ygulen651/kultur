import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { uploadImage, uploadPdf } from "@/lib/uploaders";
import { NextResponse } from "next/server";
import slugify from "slugify";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    console.log("Admin API - POST başladı");
    await connectDB();
    console.log("Admin API - MongoDB bağlandı");

    const form = await req.formData();
    console.log("Admin API - FormData alındı");

  const title = String(form.get("title") || "");
  const slugRaw = String(form.get("slug") || "");
  const excerpt = String(form.get("excerpt") || "");
  const author = String(form.get("author") || "");
  const category = String(form.get("category") || "Genel");
  const tags = String(form.get("tags") || "");
  const publishAt = form.get("publishAt") ? new Date(String(form.get("publishAt"))) : undefined;
  const featured = String(form.get("featured") || "false") === "true";
  const content = String(form.get("content") || "");

  if (!title || !author || !content) {
    return NextResponse.json({ error: "Zorunlu alanlar boş" }, { status: 400 });
  }

  let slug = (slugRaw || slugify(title, { lower: true, locale: "tr" }))
    .replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");

  // Slug benzersizlik kontrolü
  const baseSlug = slug.replace(/-\d+$/, '');
  let counter = 1;
  
  while (true) {
    const existingSlug = await Post.findOne({ slug });
    if (!existingSlug) break;
    
    slug = `${baseSlug}-${Date.now()}-${counter}`;
    counter++;
    
    if (counter > 10) {
      return NextResponse.json({
        error: "Slug oluşturulamadı, lütfen farklı bir başlık deneyin"
      }, { status: 400 });
    }
  }

  // uploads
  let cover: any = undefined;
  const coverFile = form.get("cover");
  if (coverFile && coverFile instanceof File) {
    console.log("Admin API - Cover file:", coverFile.name, coverFile.size);
    cover = await uploadImage(coverFile, "sendika/covers");
    console.log("Admin API - Cover uploaded:", cover);
  }

  const gallery: any[] = [];
  const galleryFiles = form.getAll("gallery");
  console.log("Admin API - Gallery files count:", galleryFiles.length);
  for (const g of galleryFiles) {
    if (g instanceof File) {
      console.log("Admin API - Gallery file:", g.name, g.size);
      const up = await uploadImage(g, "sendika/gallery");
      gallery.push(up);
      console.log("Admin API - Gallery uploaded:", up);
    }
  }

  let attachmentPdf: any = undefined;
  const pdf = form.get("pdf");
  if (pdf && pdf instanceof File) {
    console.log("Admin API - PDF file:", pdf.name, pdf.size);
    attachmentPdf = await uploadPdf(pdf, "sendika/uploads");
    console.log("Admin API - PDF uploaded:", attachmentPdf);
  }

    console.log("Admin API - Post oluşturuluyor:", {
      title, slug, excerpt, author, category, tags: tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      publishAt, featured, content, cover, gallery, attachmentPdf
    });

    const doc = await Post.create({
      title, slug, excerpt, author, category,
      tags: tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      publishAt, featured, content,
      cover, gallery, attachmentPdf,
    });

    console.log("Admin API - Post oluşturuldu:", doc._id);
    return NextResponse.json({ ok: true, id: doc._id, slug: doc.slug });
  } catch (error) {
    console.error("Admin API - Hata:", error);
    return NextResponse.json({ 
      error: "Sunucu hatası", 
      message: error instanceof Error ? error.message : "Bilinmeyen hata" 
    }, { status: 500 });
  }
}

export async function GET() {
  await connectDB();
  
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: "İçerikler yüklenemedi" }, { status: 500 });
  }
}
