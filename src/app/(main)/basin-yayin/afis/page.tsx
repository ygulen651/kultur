"use client";
import { useEffect, useState } from "react";

export default function AfisPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Yeni ayrı API endpoint'i kullan
        const res = await fetch("/api/afis", { 
          cache: "no-store" 
        });
        const data = await res.json();
        if (data.ok) {
          setItems(data.items);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);
  
  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-10">Yükleniyor...</div>;
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Afişler</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it: any) => (
          <div key={it._id} className="rounded-xl border overflow-hidden">
            {it.imageUrl && (
              <img src={it.imageUrl} alt={it.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h3 className="font-semibold mb-2">{it.title}</h3>
              {it.summary && <div className="text-gray-700 text-sm mb-2">{it.summary}</div>}
            </div>
          </div>
        ))}
      </div>
      {!items.length && (
        <div className="rounded-xl border p-10 text-center text-muted-foreground mt-8">Henüz afiş eklenmemiş.</div>
      )}
    </div>
  );
}
