"use client";

import * as React from "react";

type Ann = {
  _id: string;
  title?: string;
  content?: string;
  publishedAt?: string | null;
  createdAt?: string;
  isFeatured?: boolean;
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = React.useState<Ann[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const endpoint = "/api/announcements"; // admin: TÜM kayıtlar

  const normalize = (data: any): Ann[] => {
    // Farklı şekiller için tolerans: {ok, items} | {items} | {data:{items}}
    const arr =
      (data && Array.isArray(data.items) && data.items) ||
      (data && data.data && Array.isArray(data.data.items) && data.data.items) ||
      [];
    return arr;
  };

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      let data: any = null;
      try { data = await res.json(); } catch {}
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || res.statusText || `HTTP ${res.status}`);
      }
      const list = normalize(data);
      setItems(list);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  // --- ACTIONS ---
  const publish = async (id: string) => {
    await fetch(`/api/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publishedAt: new Date().toISOString() }),
    });
    await load();
  };
  const unpublish = async (id: string) => {
    await fetch(`/api/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publishedAt: null }),
    });
    await load();
  };
  const removeOne = async (id: string) => {
    if (!confirm('Silinsin mi?')) return;
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <main className="p-4 space-y-4">
      {/* DEBUG */}
      <div className="text-xs rounded-md border p-2 bg-yellow-50 text-yellow-900">
        <b>Admin Announcements Debug</b>
        <div>Endpoint: {endpoint}</div>
        <div>Loading: {String(loading)} | Error: {error ?? "-"}</div>
        <div>Count: {items.length}</div>
        <div>Titles: {items.slice(0,3).map(x => x.title || "(no title)").join(" | ") || "-"}</div>
        <button onClick={load} className="mt-1 px-2 py-1 border rounded">Yenile</button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Duyurular (Admin)</h1>
        <a
          href="/admin/duyurular/yeni"
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          + Yeni Duyuru
        </a>
      </div>

      {loading && <div>Yükleniyor…</div>}

      {error && <div className="text-red-600">Duyurular yüklenemedi: {error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="text-gray-500">Henüz duyuru yok.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <ul className="space-y-2">
          {items.map((a) => (
            <li key={a._id} className="border rounded p-3 space-y-1">
              <div className="font-medium">{a.title || "(başlıksız)"}</div>
              <div className="text-xs text-gray-500">
                Yayınlanma: {a.publishedAt ? new Date(a.publishedAt).toLocaleString() : "Taslak"}
              </div>
              <div className="flex gap-2 mt-2">
                <a
                  href={`/admin/duyurular/${a._id}/duzenle`}
                  className="px-2 py-1 border rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  Düzenle
                </a>
                {a.publishedAt
                  ? <button onClick={() => unpublish(a._id)} className="px-2 py-1 border rounded">Taslağa al</button>
                  : <button onClick={() => publish(a._id)} className="px-2 py-1 border rounded">Yayınla</button>}
                <button onClick={() => removeOne(a._id)} className="px-2 py-1 border rounded text-red-600">Sil</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
