// src/app/admin/home/page.tsx
"use client";

import { useEffect, useState } from "react";

type MVV = {
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  valuesText: string;
};

const defaults: MVV = {
  missionTitle: "Misyonumuz",
  missionText: "",
  visionTitle: "Vizyonumuz",
  visionText: "",
  valuesTitle: "Değerlerimiz",
  valuesText: "",
};

export default function AdminHomePage() {
  const [data, setData] = useState<MVV>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/home/mvv", { cache: "no-store" });
        const json = await res.json();
        if (mounted && json?.ok && json?.item) {
          setData((d) => ({ ...d, ...json.item }));
        }
      } catch (e) {
        console.error("MVV GET error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/home/mvv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json?.ok) setMsg("Kaydedildi ✔");
      else setMsg(json?.error || "Hata oluştu");
    } catch (e: any) {
      setMsg(e?.message || "Hata oluştu");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Yükleniyor…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Ana Sayfa Yönetimi</h1>

      {/* Misyon */}
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Misyon</h2>
        <input
          className="w-full rounded border p-2"
          value={data.missionTitle}
          onChange={(e) => setData({ ...data, missionTitle: e.target.value })}
          placeholder="Başlık (Misyonumuz)"
        />
        <textarea
          className="w-full rounded border p-2 min-h-[120px]"
          value={data.missionText}
          onChange={(e) => setData({ ...data, missionText: e.target.value })}
          placeholder="Misyon metni"
        />
      </div>

      {/* Vizyon */}
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Vizyon</h2>
        <input
          className="w-full rounded border p-2"
          value={data.visionTitle}
          onChange={(e) => setData({ ...data, visionTitle: e.target.value })}
          placeholder="Başlık (Vizyonumuz)"
        />
        <textarea
          className="w-full rounded border p-2 min-h-[120px]"
          value={data.visionText}
          onChange={(e) => setData({ ...data, visionText: e.target.value })}
          placeholder="Vizyon metni"
        />
      </div>

      {/* Değerler */}
      <div className="rounded-lg border p-4 space-y-3">
        <h2 className="font-medium">Değerlerimiz</h2>
        <input
          className="w-full rounded border p-2"
          value={data.valuesTitle}
          onChange={(e) => setData({ ...data, valuesTitle: e.target.value })}
          placeholder="Başlık (Değerlerimiz)"
        />
        <textarea
          className="w-full rounded border p-2 min-h-[120px]"
          value={data.valuesText}
          onChange={(e) => setData({ ...data, valuesText: e.target.value })}
          placeholder="Değerler metni"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
      </div>
    </div>
  );
}
