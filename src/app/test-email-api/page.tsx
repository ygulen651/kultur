'use client'

import { useState } from 'react'

export default function TestEmailApiPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testApi = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/email-notifications')
      const data = await response.json()
      
      setResult({
        status: response.status,
        ok: response.ok,
        data: data
      })
      
      if (!response.ok) {
        setError(`HTTP ${response.status}: ${data.error || 'Bilinmeyen hata'}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">E-posta Bildirimleri API Test</h1>
      
      <button
        onClick={testApi}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Test ediliyor...' : 'API Test Et'}
      </button>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Hata:</strong> {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 border border-gray-400 rounded">
          <h3 className="font-bold mb-2">Test Sonucu:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <strong>Not:</strong> Bu sayfa sadece API testi için oluşturulmuştur. 
        Gerçek kullanımda admin paneline giriş yapmanız gerekir.
      </div>
    </div>
  )
}
