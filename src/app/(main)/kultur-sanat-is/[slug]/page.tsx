import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface PostType {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  author: string;
  category: string;
  publishAt?: Date;
  content: string;
  cover?: {
    url: string;
    publicId: string;
  };
  gallery?: Array<{
    url: string;
    publicId: string;
  }>;
  attachmentPdf?: {
    publicId: string;
    filename: string;
    bytes: number;
  };
  tags?: string[];
}

export default async function KulturSanatIsDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  await connectDB();
  
  const { slug } = await params;
  const post = await Post.findOne({ slug }).lean() as PostType | null;
  
  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Kapak Görseli */}
      {post.cover && (
        <div className="mb-8">
          <Image 
            src={post.cover.url} 
            alt={post.title}
            width={800}
            height={400}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Başlık ve Meta */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-gray-600 mb-4">
          <span>Yazar: {post.author}</span>
          <span>Kategori: {post.category}</span>
          {post.publishAt && (
            <span>Tarih: {new Date(post.publishAt).toLocaleDateString("tr-TR")}</span>
          )}
        </div>
        {post.excerpt && (
          <p className="text-lg text-gray-700 italic">{post.excerpt}</p>
        )}
      </div>

      {/* PDF Butonları */}
      {post.attachmentPdf?.publicId && (
        <div className="flex gap-3 mb-8 p-4 bg-gray-50 rounded-lg">
          <a 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            target="_blank"
            href={`/api/view-pdf/${encodeURIComponent(post.attachmentPdf.publicId)}`}
          >
            PDF'yi Aç
          </a>
          <a 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            href={`/api/files/${encodeURIComponent(post.attachmentPdf.publicId)}`}
            download
          >
            PDF'yi İndir
          </a>
          <span className="text-sm text-gray-600 self-center">
            {post.attachmentPdf.filename} ({(post.attachmentPdf.bytes / 1024).toFixed(1)} KB)
          </span>
        </div>
      )}

      {/* İçerik */}
      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>

      {/* Galeri */}
      {post.gallery && post.gallery.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Galeri</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {post.gallery.map((image, index) => (
              <Image 
                key={index}
                src={image.url} 
                alt={`${post.title} - Görsel ${index + 1}`}
                width={300}
                height={200}
                className="w-full h-32 object-cover rounded"
              />
            ))}
          </div>
        </div>
      )}

      {/* Etiketler */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Etiketler</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Geri Dön */}
      <div className="mt-8 pt-6 border-t">
        <Link 
          href="/kultur-sanat-is"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Kültür Sanat-İş sayfasına dön
        </Link>
      </div>
    </div>
  );
}

