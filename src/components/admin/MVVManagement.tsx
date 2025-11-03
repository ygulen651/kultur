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
  missionTitle: "MİSYONUMUZ",
  missionText: "Kamu emekçilerinin ekonomik, sosyal hak ve menfaatlerini korumak, çalışma koşullarının iyileştirilmesini sağlamak, iş güvencesinin teminat altına alınmasını sağlamak, iş sağlığı ve güvenliğinin artırılmasını ve sosyo- ekonomik, haklarının geliştirilmesini ve korunmasını sağlamak. Ülkemizin kültür, sanat ve turizm politikalarının gelişimine katkıda bulunmak, ve örgütlenerek toplumsal bilincin gelişmesine katkıda bulunmak.",
  visionTitle: "VİZYONUMUZ",
  visionText: "Büyük Önder Ulu Atatürk'ün önderliğinde kurulan Atatürk Milliyetçiliğine bağlı, insan hak ve hukukuna saygılı Laik, Demokratik ve Sosyal Türkiye Cumhuriyeti Devletinin bütünlüğünü, ulusumuzun tam bağımsızlığını, Çağdaşlığını, Demokrasisini ve Hukuk'unu geliştirerek korumak ve gelecek kuşaklara aydınlık yarınlar bırakmak.",
  valuesTitle: "AMACI",
  valuesText: "Taşeronlaşmaya, Angaryaya ve hukuk dışı çalıştırılmaya karşı durarak, kamu emekçilerinin ortak ekonomik, sosyal, kültürel mesleki ve özlük haklarını korumak, geliştirmek, çalışma ve toplumsal barışının sağlanabilmesi için çalışmalar yapmak, kadın çalışanlarımız ile engelli olarak çalışanların sorunlarına çözüm üretmek, sendikal yaşamın hayata geçirilebilmesi için örgütlü çalışmalar yapmak, Ülkemizin laik, demokratik ve sosyal hukuk devleti yapısını korumak ve geliştirmek.",
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
          Amaç, Kapsam & Tanımlar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amaç */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium text-blue-600">MİSYONUMUZ</h3>
          <Input
            className="w-full"
            value={data.missionTitle}
            onChange={(e) => setData({ ...data, missionTitle: e.target.value })}
            placeholder="Başlık (MİSYONUMUZ)"
          />
          <Textarea
            className="w-full min-h-[120px]"
            value={data.missionText}
            onChange={(e) => setData({ ...data, missionText: e.target.value })}
            placeholder="Misyon metni"
          />
        </div>

        {/* Kapsam */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium text-green-600">VİZYONUMUZ</h3>
          <Input
            className="w-full"
            value={data.visionTitle}
            onChange={(e) => setData({ ...data, visionTitle: e.target.value })}
            placeholder="Başlık (VİZYONUMUZ)"
          />
          <Textarea
            className="w-full min-h-[120px]"
            value={data.visionText}
            onChange={(e) => setData({ ...data, visionText: e.target.value })}
            placeholder="Vizyon metni"
          />
        </div>

        {/* Tanımlar */}
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium text-purple-600">AMACI</h3>
          <Input
            className="w-full"
            value={data.valuesTitle}
            onChange={(e) => setData({ ...data, valuesTitle: e.target.value })}
            placeholder="Başlık (AMACI)"
          />
          <Textarea
            className="w-full min-h-[120px]"
            value={data.valuesText}
            onChange={(e) => setData({ ...data, valuesText: e.target.value })}
            placeholder="Amaç metni"
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
