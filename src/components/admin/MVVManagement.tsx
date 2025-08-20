"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Users, Save } from "lucide-react";

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

export default function MVVManagement() {
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

  if (loading) return <div className="animate-pulse">Yükleniyor…</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Misyon, Vizyon & Değerler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Misyon */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium text-blue-600">Misyon</h3>
          <Input
            className="w-full"
            value={data.missionTitle}
            onChange={(e) => setData({ ...data, missionTitle: e.target.value })}
            placeholder="Başlık (Misyonumuz)"
          />
          <Textarea
            className="w-full min-h-[120px]"
            value={data.missionText}
            onChange={(e) => setData({ ...data, missionText: e.target.value })}
            placeholder="Misyon metni"
          />
        </div>

        {/* Vizyon */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium text-green-600">Vizyon</h3>
          <Input
            className="w-full"
            value={data.visionTitle}
            onChange={(e) => setData({ ...data, visionTitle: e.target.value })}
            placeholder="Başlık (Vizyonumuz)"
          />
          <Textarea
            className="w-full min-h-[120px]"
            value={data.visionText}
            onChange={(e) => setData({ ...data, visionText: e.target.value })}
            placeholder="Vizyon metni"
          />
        </div>

        {/* Değerler */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium text-purple-600">Değerlerimiz</h3>
          <Input
            className="w-full"
            value={data.valuesTitle}
            onChange={(e) => setData({ ...data, valuesTitle: e.target.value })}
            placeholder="Başlık (Değerlerimiz)"
          />
          <Textarea
            className="w-full min-h-[120px]"
            value={data.valuesText}
            onChange={(e) => setData({ ...data, valuesText: e.target.value })}
            placeholder="Değerler metni"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </Button>
          {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
