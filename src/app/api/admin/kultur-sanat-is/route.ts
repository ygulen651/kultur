import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { uploadImage, uploadPdf, uploadPdfBufferToCloudinary } from "@/lib/uploaders";
import { uploadPdfToBlob, uploadImageToBlob, toSafeFilename, toSafeImageFilename } from "@/lib/blobUpload";
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

  // uploads - Vercel Blob kullan
  let cover: any = undefined;
  const coverFile = form.get("cover");
  if (coverFile && coverFile instanceof File) {
    console.log("Admin API - Cover file:", coverFile.name, coverFile.size);
    try {
      const safeName = toSafeImageFilename(coverFile.name);
      cover = await uploadImageToBlob(coverFile, safeName, "sendika/covers");
      console.log("Admin API - Cover uploaded to Vercel Blob:", cover);
    } catch (uploadError) {
      console.error("Admin API - Cover upload hatası:", uploadError);
      return NextResponse.json({ 
        error: "Kapak görseli yüklenemedi", 
        message: uploadError instanceof Error ? uploadError.message : "Bilinmeyen hata"
      }, { status: 500 });
    }
  }

  const gallery: any[] = [];
  const galleryFiles = form.getAll("gallery");
  console.log("Admin API - Gallery files count:", galleryFiles.length);
  for (const g of galleryFiles) {
    if (g instanceof File) {
      console.log("Admin API - Gallery file:", g.name, g.size);
      try {
        const safeName = toSafeImageFilename(g.name);
        const up = await uploadImageToBlob(g, safeName, "sendika/gallery");
        gallery.push(up);
        console.log("Admin API - Gallery uploaded to Vercel Blob:", up);
      } catch (uploadError) {
        console.error("Admin API - Gallery upload hatası:", uploadError);
        return NextResponse.json({ 
          error: "Galeri görseli yüklenemedi", 
          message: uploadError instanceof Error ? uploadError.message : "Bilinmeyen hata"
        }, { status: 500 });
      }
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
      
      // Slug/title'dan "neden-kultur-sanat-is" kontrolü
      const normalizedSlug = (slug || title)
        .toLowerCase()
        .replace(/[^a-z0-9-\s]/g, "")
        .replace(/\s+/g, "-");
      const isNedenKultur = normalizedSlug.startsWith("neden-kultur-sanat-is");
      
      console.log("Admin API - Slug check:", { slug, normalizedSlug, isNedenKultur });
      
      if (isNedenKultur) {
        // ▼▼▼ SADECE "Neden Kültür..." için Vercel Blob'a yükle ▼▼▼
        console.log("Admin API - Uploading to Vercel Blob...");
        const safe = toSafeFilename(pdf.name || "dosya.pdf");
        const up = await uploadPdfToBlob(pdf as File, safe, "sendika/uploads");
        
        fileUrl = up.url;                         // <<< DB'ye kaydedilecek link
        fileName = safe;
        fileSize = pdf.size;
        fileType = "pdf";
        mimeType = "application/pdf";
        
        console.log("Admin API - PDF uploaded to Blob:", { fileUrl, fileName, fileSize, fileType, mimeType });
      } else {
        // ▼▼▼ Diğer yazılarda mevcut Cloudinary akışı kalsın
        console.log("Admin API - Uploading to Cloudinary...");
        
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
        
        const arrayBuf = await pdf.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuf);
        
        const result = await uploadPdfBufferToCloudinary(pdfBuffer, safeFilename);
        
        console.log("Admin API - Cloudinary upload result:", result);
        
        // Dosya URL'ini Cloudinary'den al
        fileUrl = result.secure_url;
        
        console.log("Admin API - PDF uploaded to Cloudinary:", { fileUrl, fileName, fileSize, fileType, mimeType });
      }
    } catch (uploadError) {
      console.error("Admin API - PDF upload hatası:", uploadError);
      return NextResponse.json({ 
        error: "PDF yüklenemedi", 
        message: uploadError instanceof Error ? uploadError.message : "Bilinmeyen hata",
        details: uploadError instanceof Error ? uploadError.stack : undefined
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
    const posts = await Post.find({})
      .select('_id title slug excerpt category tags cover publishAt author featured fileUrl fileName mimeType createdAt')
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: "İçerikler yüklenemedi" }, { status: 500 });
  }
}
