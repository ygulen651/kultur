import { getBaseUrl } from "@/lib/http";

export default async function EditAfisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Bu sayfa henüz tamamlanmadı, sadece placeholder
  return (
    <div className="max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Afişi Düzenle</h1>
      <p className="text-gray-600">Bu sayfa henüz geliştirilmedi.</p>
      <a href="/admin/basin-yayin/afis" className="text-blue-600 hover:underline">
        ← Afiş listesine geri dön
      </a>
    </div>
  );
}
