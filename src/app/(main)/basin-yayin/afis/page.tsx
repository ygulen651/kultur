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
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        {items.map((it: any) => (
          <div key={it._id} className="rounded-xl border overflow-hidden bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
            {it.imageUrl && (
              <div className="w-full">
                <img 
                  src={it.imageUrl} 
                  alt={it.title} 
                  className="w-full h-auto object-contain rounded-t-xl" 
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="font-semibold mb-3 text-lg text-gray-900 dark:text-white">{it.title}</h3>
              {it.summary && <div className="text-gray-700 dark:text-gray-300 text-sm mb-2 leading-relaxed">{it.summary}</div>}
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
