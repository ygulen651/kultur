"use client";
import { useEffect, useState } from "react";

export default function BasinPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Yeni ayrı API endpoint'i kullan
        const res = await fetch("/api/basin", { 
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
    return <div className="max-w-5xl mx-auto p-6">Yükleniyor...</div>;
  }
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Basın Haberleri</h1>
      {!items.length && (
        <div className="text-gray-500">Henüz haber eklenmemiş.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow p-4">
            <h3 className="font-semibold mb-2">{item.title}</h3>
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover rounded mb-2" />
            )}
            {item.summary && <div className="text-gray-700 text-sm mb-2">{item.summary}</div>}
            <div className="text-xs text-gray-500">
              {item.createdAt ? new Date(item.createdAt).toLocaleDateString("tr-TR") : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


