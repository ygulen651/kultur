"use client";
import * as React from 'react'
import AnnouncementCard from "@/components/AnnouncementCard";

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
};

const endpoint = "/api/announcements?status=published";

const norm = (a: Raw) => ({
  id: a._id,
  title: a.title ?? "",
  slug: a.slug ?? a._id,
  excerpt: a.excerpt ?? (a.content ? a.content.slice(0, 140) : ""),
  date: a.publishedAt ?? a.createdAt ?? null,
  imageUrl: a.coverUrl ?? a.imageUrl ?? (a as any).cover ?? null,
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
    <main className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Duyurular</h1>

      {loading && <div>Yükleniyor…</div>}
      {error && <div className="text-red-600">Duyurular yüklenemedi: {error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="text-gray-500">Henüz duyuru yok.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <AnnouncementCard
              key={a.id}
              item={{
                _id: a.id,
                title: a.title,
                slug: a.slug,
                excerpt: a.excerpt,
                publishedAt: a.date,
                cover: a.imageUrl
              }}
              href={`/duyurular/${a.slug}`}
              className="mb-8"
            />
          ))}
        </div>
      )}
    </main>
  );
}
