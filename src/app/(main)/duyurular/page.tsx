"use client";

import * as React from 'react'
import { Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { pickAnnouncementCover } from '@/lib/ui'

type Raw = {
  _id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  publishedAt?: string | null;
  createdAt?: string | null;
  coverUrl?: string | null;
  imageUrl?: string | null;
  featuredImage?: string | null;
  images?: string[];
  fields?: {
    image?: {
      url?: string;
    };
  };
};

const endpoint = "/api/announcements?status=published";

const norm = (a: Raw) => ({
  id: a._id,
  title: a.title ?? "",
  slug: a.slug ?? a._id,
  excerpt: a.excerpt ?? (a.content ? a.content.slice(0, 140) : ""),
  date: a.publishedAt ?? a.createdAt ?? null,
  imageUrl: a.coverUrl ?? a.imageUrl ?? a.featuredImage ?? a.fields?.image?.url ?? null,
  images: a.images || [],
});

export default function PublicAnnouncementsPage() {
  const [items, setItems] = React.useState<ReturnType<typeof norm>[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || res.statusText);
      }
      const raw: Raw[] = Array.isArray(data?.items) ? data.items : [];
      setItems(raw.map(norm));
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <>
      {/* Hero Section */}
      <div className="py-20 bg-gradient-to-br from-red-50 via-blue-50 to-purple-50 dark:from-red-900/20 dark:via-blue-900/20 dark:to-purple-900/20">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Duyurular
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sendikamızdan en güncel haberler, önemli duyurular ve gelişmeler
            </p>
          </div>
        </div>
      </div>

      {/* Duyurular Listesi */}
      <div className="py-20">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-lg text-muted-foreground">Duyurular yükleniyor...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <div className="text-red-600 text-lg mb-4">❌ Hata: {error}</div>
              <Button onClick={load} variant="outline">Tekrar Dene</Button>
            </div>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Henüz duyuru yok</h3>
              <p className="text-muted-foreground">
                Duyurular yakında burada görünecek.
              </p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-12 mb-12">
                {items.map((item) => {
                  const coverImage = pickAnnouncementCover({
                    cover: item.imageUrl,
                    featuredImage: item.imageUrl,
                    imageUrl: item.imageUrl,
                    images: item.images
                  });

                  return (
                    <article key={item.id} className="group">
                      <div className="relative aspect-[21/9] overflow-hidden rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-1 mb-8">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-blue-100 to-purple-100 dark:from-red-900/20 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur-sm">
                            DUYURU
                          </Badge>
                        </div>
                        
                        {/* Date */}
                        {item.date && (
                          <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                            {new Date(item.date).toLocaleDateString('tr-TR')}
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-xl font-bold leading-tight group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h3>
                        
                        {item.excerpt && (
                          <p className="text-muted-foreground leading-relaxed line-clamp-3">
                            {item.excerpt}
                          </p>
                        )}

                        <Link
                          href={`/duyurular/${item.slug}`}
                          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium group-hover:translate-x-1 transition-all duration-300"
                        >
                          Devamını Oku
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* CTA Section */}
              <div className="text-center">
                <div className="relative inline-block group">
                  <div className="absolute -inset-2 bg-gradient-to-r from-red-600 via-blue-600 to-red-600 rounded-2xl opacity-75 group-hover:opacity-100 blur-lg transition-all duration-300 animate-pulse"></div>
                  <Button
                    size="lg"
                    asChild
                    className="relative bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white border-0 rounded-2xl px-8 py-4 font-bold text-lg shadow-2xl"
                  >
                    <Link href="/">
                      Ana Sayfaya Dön
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
