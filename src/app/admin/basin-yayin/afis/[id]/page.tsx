"use client";
import { useEffect, useState } from "react";
import { getBaseUrl } from "@/lib/http";

export default function EditAfisPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const base = getBaseUrl();
      const res = await fetch(`${base}/api/press/${params.id}`);
      const data = await res.json();
      setForm({
        ...data.item,
        publishedAt: data.item?.publishedAt?.slice(0,10) || new Date().toISOString().slice(0,10)
      });
      setLoading(false);
    })();
  }, [params.id]);

  if (loading || !form) return <div>Yükleniyor…</div>;

  async function handleSubmit(e: any) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, publishedAt: new Date(form.publishedAt) };
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/press/${params.id}`, { method: "PUT", body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) location.href = "/admin/basin-yayin/afis";
    else alert("Güncellenemedi");
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Afişi Düzenle</h1>
      <input className="input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})}/>
      <textarea className="textarea" value={form.excerpt} onChange={e=>setForm({...form, excerpt:e.target.value})}/>
      <input className="input" value={form.cover?.url || ""} onChange={e=>setForm({...form, cover:{ url:e.target.value }})}/>
      <input type="date" className="input" value={form.publishedAt} onChange={e=>setForm({...form, publishedAt:e.target.value})}/>
      <button className="px-4 py-2 rounded bg-blue-600 text-white" disabled={saving}>
        {saving ? "Kaydediliyor..." : "Güncelle"}
      </button>
    </form>
  );
}
