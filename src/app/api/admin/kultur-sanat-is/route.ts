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

  // PDF upload - bilgi-belge gibi
  let fileUrl = '';
  let fileName = '';
  let fileSize = 0;
  let fileType = '';
  let mimeType = '';
  
  const pdf = form.get("pdf");
  if (pdf && pdf instanceof File) {
    console.log("Admin API - PDF file:", pdf.name, pdf.size);
    
    try {
      // Dosya bilgilerini al
      fileName = pdf.name;
      fileSize = pdf.size;
      fileType = fileName.split('.').pop()?.toLowerCase() || 'pdf';
      mimeType = pdf.type || 'application/pdf';
      
      // Güvenli dosya adı oluştur
      const safeFilename = pdf.name
        .replace(/[ğüşıöçĞÜŞİÖÇ]/g, (match) => {
          const map: { [key: string]: string } = {
            'ğ': 'g', 'ü': 'u', 'ş': 's', 'ı': 'i', 'ö': 'o', 'ç': 'c',
            'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'İ': 'I', 'Ö': 'O', 'Ç': 'C'
          };
          return map[match] || match;
        })
        .replace(/[^a-zA-Z0-9.-]/g, '_');
      
      console.log("Admin API - Safe filename:", safeFilename);
      
      // Dosyayı public/uploads klasörüne kaydet
      const fs = await import('fs');
      const path = await import('path');
      
      // Uploads klasörünü oluştur (yoksa)
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Benzersiz dosya adı oluştur
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${safeFilename}`;
      const filePath = path.join(uploadsDir, uniqueFilename);
      
      // Dosyayı buffer olarak oku ve kaydet
      const arrayBuf = await pdf.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      fs.writeFileSync(filePath, buffer);
      
      // Dosya URL'ini oluştur
      fileUrl = `/uploads/${uniqueFilename}`;
      
      console.log("Admin API - PDF saved locally:", { fileUrl, fileName, fileSize, fileType, mimeType });
    } catch (uploadError) {
      console.error("Admin API - PDF upload hatası:", uploadError);
      return NextResponse.json({ 
        error: "PDF yüklenemedi", 
        message: uploadError instanceof Error ? uploadError.message : "Bilinmeyen hata" 
      }, { status: 500 });
    }
  }

    console.log("Admin API - Post oluşturuluyor:", {
      title, slug, excerpt, author, category, tags: tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      publishAt, featured, content, cover, gallery, fileUrl, fileName, fileSize, fileType, mimeType
    });

    const doc = await Post.create({
      title, slug, excerpt, author, category,
      tags: tags ? tags.split(",").map(s => s.trim()).filter(Boolean) : [],
      publishAt, featured, content,
      cover, gallery, 
      fileUrl, fileName, fileSize, fileType, mimeType,
      // Eski alanlar - geriye uyumluluk için
      attachmentPdf: fileUrl ? {
        publicId: undefined, // Cloudinary publicId yerine dosya yolu
        filename: fileName,
        bytes: fileSize
      } : undefined,
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
