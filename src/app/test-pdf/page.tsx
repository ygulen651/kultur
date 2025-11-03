"use client";

import { useState } from "react";

export default function TestPdfPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function testPdfUpload() {
    if (!pdfFile) {
      alert("PDF dosyası seçin!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const res = await fetch("/api/test-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data);

      if (res.ok) {
        alert("PDF başarıyla yüklendi!");
      } else {
        alert("Hata: " + data.error);
      }
    } catch (error) {
      console.error("Test hatası:", error);
      alert("Test sırasında hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">PDF Upload Test</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">PDF Dosyası Seç</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          onClick={testPdfUpload}
          disabled={!pdfFile || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "PDF'i Test Et"}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Test Sonucu:</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
