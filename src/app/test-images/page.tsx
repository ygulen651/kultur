// Test Images Page - Vercel'de görsel sorununu debug etmek için
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getAnnouncements, getSliders } from "@/lib/data";

export default async function TestImagesPage() {
  const [announcements, sliders] = await Promise.all([
    getAnnouncements({ limit: "5" }),
    getSliders(),
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Vercel Görsel Test Sayfası</h1>
        
        {/* Environment Variables */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>NEXT_PUBLIC_SITE_URL:</strong> {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}
            </div>
            <div>
              <strong>BLOB_READ_WRITE_TOKEN:</strong> {process.env.BLOB_READ_WRITE_TOKEN ? 'Set' : 'Not set'}
            </div>
            <div>
              <strong>MONGODB_URI:</strong> {process.env.MONGODB_URI ? 'Set' : 'Not set'}
            </div>
            <div>
              <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
            </div>
          </div>
        </div>

        {/* Announcements Test */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Duyurular ({announcements.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {announcements.map((item, i) => (
              <div key={i} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{item?.title || 'No title'}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Image URLs:</strong>
                  <ul className="list-disc list-inside">
                    <li>image: {item?.image || 'null'}</li>
                    <li>featuredImage: {item?.featuredImage || 'null'}</li>
                    <li>imageUrl: {item?.imageUrl || 'null'}</li>
                    <li>coverImage: {item?.coverImage || 'null'}</li>
                  </ul>
                </div>
                {item?.image && (
                  <div className="mt-2">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        console.error('Image load error:', item.image);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sliders Test */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Slider'lar ({sliders.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sliders.map((item, i) => (
              <div key={i} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-2">{item?.title || 'No title'}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Image URLs:</strong>
                  <ul className="list-disc list-inside">
                    <li>imageUrl: {item?.imageUrl || 'null'}</li>
                    <li>image: {item?.image || 'null'}</li>
                    <li>featuredImage: {item?.featuredImage || 'null'}</li>
                  </ul>
                </div>
                {item?.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        console.error('Slider image load error:', item.imageUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Raw Data */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Data</h2>
          <details>
            <summary className="cursor-pointer font-medium">Announcements Raw Data</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(announcements, null, 2)}
            </pre>
          </details>
          <details className="mt-4">
            <summary className="cursor-pointer font-medium">Sliders Raw Data</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(sliders, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
