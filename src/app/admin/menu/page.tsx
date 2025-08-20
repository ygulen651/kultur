"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";

type MenuItem = { label: string; href: string; external?: boolean; children?: MenuItem[] };
type FooterLink = { label: string; url: string; external?: boolean };
type FooterColumn = { title: string; links: FooterLink[] };
type Social = { platform: "facebook"|"instagram"|"x"|"youtube"|"linkedin"|"tiktok"; url: string; isActive?: boolean };

type SiteMenu = {
  navbar: {
    brand: { name?: string; slogan?: string; logoLight?: string; logoDark?: string };
    items: MenuItem[];
    ctas: MenuItem[];
    isActive: boolean;
  };
  footer: {
    isActive: boolean;
    columns: FooterColumn[];
    contact: { email?: string; phone?: string; address?: string };
    socials: Social[];
    map: { provider: "google" | "osm"; embedUrl?: string; lat?: number; lng?: number; zoom?: number; isActive: boolean };
    bottomLinks: FooterLink[];
  };
};

const PLATFORMS: Social["platform"][] = ["facebook","instagram","x","youtube","linkedin","tiktok"];

export default function MenuAdminPage() {
  const [tab, setTab] = useState<"navbar"|"footer">("navbar");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SiteMenu>({
    navbar: { brand: {}, items: [], ctas: [], isActive: true },
    footer: { isActive: true, columns: [], contact: {}, socials: [], map: { provider: "google", isActive: true, zoom: 14 }, bottomLinks: [] }
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        const j = await res.json();
        if (j?.item) setData(j.item);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await res.json();
      if (!j.ok) alert(j.error || "Kaydetme hatası");
    } catch (e) {
      alert("Kaydetme hatası");
    } finally {
      setSaving(false);
    }
  }

  async function uploadToCloudinary(file: File, setUrl: (v: string) => void) {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/cloudinary/upload", { method: "POST", body: fd });
    const j = await r.json();
    if (j?.ok && j?.url) setUrl(j.url);
    else alert("Yükleme hatası");
  }

  if (loading) {
    return <div className="p-6 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setTab("navbar")} className={`px-3 py-2 rounded ${tab==="navbar"?"bg-blue-600 text-white":"bg-slate-100"}`}>Navbar</button>
          <button onClick={() => setTab("footer")} className={`px-3 py-2 rounded ${tab==="footer"?"bg-blue-600 text-white":"bg-slate-100"}`}>Footer</button>
        </div>
        <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60">{saving?"Kaydediliyor…":"Kaydet"}</button>
      </div>
      {/* ...devamı prompttaki gibi... */}
    </div>
  );
}