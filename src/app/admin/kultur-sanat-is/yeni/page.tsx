"use client";

import { useState } from "react";
import slugify from "slugify";

export default function NewKulturSanatIsPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Genel");
  const [tags, setTags] = useState("");
  const [publishAt, setPublishAt] = useState<string>("");
  const [featured, setFeatured] = useState(false);
  const [content, setContent] = useState("");

  const [coverFile, setCoverFile] = useState<File | undefined>();
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [pdfFile, setPdfFile] = useState<File | undefined>();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const fd = new FormData();
    fd.append("title", title);
    fd.append("slug", slug || slugify(title, { lower: true, locale: "tr" }));
    fd.append("excerpt", excerpt);
    fd.append("author", author);
    fd.append("category", category);
    fd.append("tags", tags);
    fd.append("publishAt", publishAt);
    fd.append("featured", String(featured));
    fd.append("content", content);
    if (coverFile) fd.append("cover", coverFile);
    if (galleryFiles) Array.from(galleryFiles).forEach(f => fd.append("gallery", f));
    if (pdfFile) fd.append("pdf", pdfFile);

    const res = await fetch("/api/admin/kultur-sanat-is", { method: "POST", body: fd });
    const js = await res.json();
    if (!res.ok) alert("Hata: " + js.error);
    else alert("Kaydedildi!");
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Yeni Kültür Sanat-İş İçeriği</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sol */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Başlık *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Slug (ops.)</label>
            <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="otomatik oluşturulur" className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium">Kısa Özet</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} className="w-full border p-2 rounded h-24" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Yazar *</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border p-2 rounded">
                <option>Genel</option><option>Duyuru</option><option>Makale</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Etiketler (virgülle)</label>
            <input value={tags} onChange={e => setTags(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Yayın Tarihi</label>
              <input type="date" value={publishAt} onChange={e => setPublishAt(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <label className="flex items-end gap-2">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
              <span>Öne çıkar</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium">İçerik *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full border p-2 rounded h-40" />
          </div>
        </div>

        {/* Sağ - Dosyalar */}
        <div className="space-y-5">
          <div className="border rounded p-4">
            <div className="font-medium mb-2">Kapak Görseli</div>
            <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0])} />
          </div>

          <div className="border rounded p-4">
            <div className="font-medium mb-2">Ek Görseller (max 9)</div>
            <input type="file" accept="image/*" multiple onChange={e => setGalleryFiles(e.target.files)} />
          </div>

          <div className="border rounded p-4">
            <div className="font-medium mb-2">Ek Dosya (PDF)</div>
            <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files?.[0])} />
            <p className="text-xs text-gray-500 mt-1">PDF yüklenirse içerik sayfasında "Aç" ve "İndir" butonları oluşur.</p>
          </div>

          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">İçeriği Kaydet</button>
        </div>
      </form>
    </div>
  );
}

