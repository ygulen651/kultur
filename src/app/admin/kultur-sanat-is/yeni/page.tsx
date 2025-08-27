"use client";

import { useState } from "react";
import slugify from "slugify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, FileText, Image, Images, Save } from "lucide-react";

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append("title", title);
      const autoSlug = slug || slugify(title, { lower: true, locale: "tr" });
      const uniqueSlug = autoSlug + "-" + Date.now();
      fd.append("slug", uniqueSlug);
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
      
      if (!res.ok) {
        alert("Hata: " + js.error);
      } else {
        alert("İçerik başarıyla kaydedildi!");
        // Formu temizle
        setTitle("");
        setSlug("");
        setExcerpt("");
        setAuthor("");
        setCategory("Genel");
        setTags("");
        setPublishAt("");
        setFeatured(false);
        setContent("");
        setCoverFile(undefined);
        setGalleryFiles(null);
        setPdfFile(undefined);
      }
    } catch (error) {
      alert("Bir hata oluştu: " + error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Yeni Kültür Sanat-İş İçeriği</h1>
        <p className="text-muted-foreground mt-2">
          Blog benzeri içerik oluşturun, PDF ekleyin ve görseller yükleyin
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Ana Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Temel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="İçerik başlığı"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (opsiyonel)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="Otomatik oluşturulur"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="excerpt">Kısa Özet</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                placeholder="İçeriğin kısa özeti"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="author">Yazar *</Label>
              <Input
                id="author"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Yazar adı"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
              >
                <option value="Genel">Genel</option>
                <option value="Duyuru">Duyuru</option>
                <option value="Makale">Makale</option>
                <option value="Haber">Haber</option>
                <option value="Analiz">Analiz</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Etiketler</Label>
              <Input
                id="tags"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="Virgülle ayırarak yazın"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publishAt">Yayın Tarihi</Label>
              <Input
                id="publishAt"
                type="date"
                value={publishAt}
                onChange={e => setPublishAt(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Öne Çıkar</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={featured}
                  onCheckedChange={setFeatured}
                />
                <Label htmlFor="featured">Bu içeriği öne çıkar</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İçerik */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              İçerik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="content">Ana İçerik *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="İçeriğin ana metni..."
                rows={10}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Dosyalar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Dosyalar ve Görseller
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kapak Görseli */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Kapak Görseli
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setCoverFile(e.target.files?.[0])}
                  className="hidden"
                  id="cover"
                />
                <label htmlFor="cover" className="cursor-pointer">
                  <div className="space-y-2">
                    <Image className="h-8 w-8 mx-auto text-gray-400" />
                    <div className="text-sm">
                      {coverFile ? (
                        <span className="text-green-600 font-medium">{coverFile.name}</span>
                      ) : (
                        <span className="text-gray-500">Görsel seçin</span>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Galeri */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Images className="h-4 w-4" />
                Galeri (max 9)
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => setGalleryFiles(e.target.files)}
                  className="hidden"
                  id="gallery"
                />
                <label htmlFor="gallery" className="cursor-pointer">
                  <div className="space-y-2">
                    <Images className="h-8 w-8 mx-auto text-gray-400" />
                    <div className="text-sm">
                      {galleryFiles ? (
                        <span className="text-green-600 font-medium">
                          {galleryFiles.length} görsel seçildi
                        </span>
                      ) : (
                        <span className="text-gray-500">Görseller seçin</span>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* PDF */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                PDF Dosya
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => setPdfFile(e.target.files?.[0])}
                  className="hidden"
                  id="pdf"
                />
                <label htmlFor="pdf" className="cursor-pointer">
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-gray-400" />
                    <div className="text-sm">
                      {pdfFile ? (
                        <span className="text-green-600 font-medium">{pdfFile.name}</span>
                      ) : (
                        <span className="text-gray-500">PDF seçin</span>
                      )}
                    </div>
                  </div>
                </label>
              </div>
              <p className="text-xs text-gray-500 text-center">
                PDF yüklenirse "Aç" ve "İndir" butonları oluşur
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Kaydet Butonu */}
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                İçeriği Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

