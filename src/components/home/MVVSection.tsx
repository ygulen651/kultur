// src/components/home/MVVSection.tsx
import React from "react";

type MVV = {
  missionTitle: string;
  missionText: string;
  visionTitle: string;
  visionText: string;
  valuesTitle: string;
  valuesText: string;
};

async function getMVV(): Promise<MVV> {
      const base = process.env.NEXT_PUBLIC_SITE_URL || '';

  try {
    const url = base ? `${base}/api/home/mvv` : '/api/home/mvv';
    const res = await fetch(url, {
      next: { revalidate: 300 }, // ana sayfa için cache
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const d = json?.item || {};
    return {
      missionTitle: d.missionTitle ?? "Misyonumuz",
      missionText: d.missionText ?? "",
      visionTitle: d.visionTitle ?? "Vizyonumuz",
      visionText: d.visionText ?? "",
      valuesTitle: d.valuesTitle ?? "Değerlerimiz",
      valuesText: d.valuesText ?? "",
    };
  } catch (error) {
    console.error("MVV fetch error:", error);
    return {
      missionTitle: "Misyonumuz",
      missionText: "",
      visionTitle: "Vizyonumuz",
      visionText: "",
      valuesTitle: "Değerlerimiz",
      valuesText: "",
    };
  }
}

export default async function MVVSection() {
  const data = await getMVV();

  return (
    <section className="py-12">
      <h2 className="text-3xl font-bold text-center mb-8">Sendikamızın Gücü</h2>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Misyon */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-slate-900 border">
          <div className="text-sm font-semibold mb-2">🛡 {data.missionTitle}</div>
          <p className="text-sm opacity-80 leading-6">{data.missionText || "—"}</p>
        </div>

        {/* Vizyon */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-slate-900 border">
          <div className="text-sm font-semibold mb-2">📈 {data.visionTitle}</div>
          <p className="text-sm opacity-80 leading-6">{data.visionText || "—"}</p>
        </div>

        {/* Değerler */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-fuchsia-50 to-white dark:from-fuchsia-950/30 dark:to-slate-900 border">
          <div className="text-sm font-semibold mb-2">🏅 {data.valuesTitle}</div>
          <p className="text-sm opacity-80 leading-6">{data.valuesText || "—"}</p>
        </div>
      </div>
    </section>
  );
}
