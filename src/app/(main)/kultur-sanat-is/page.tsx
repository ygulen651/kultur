import Link from 'next/link'
import Image from 'next/image'
import { Section } from '@/components/Section'
import { Container } from '@/components/Container'
import EmptyState from '@/components/EmptyState'

async function getKulturSanatIs() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/kultur-sanat-is`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return json.success ? json.data : []
  } catch (error) {
    console.error('Error fetching Kultur Sanat Is:', error)
    return []
  }
}

export default async function KulturSanatIsList({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const sp = searchParams ? await searchParams : undefined
  const items = await getKulturSanatIs()
  
  // Öne çıkan ve normal içerikleri ayır
  const featured = items.filter((item: any) => item.isFeatured).slice(0, 2)
  const regular = items.filter((item: any) => !item.isFeatured)

  return (
    <>
      {/* Hero Section */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Kültür Sanat-İş
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Kültür ve sanat alanında çalışan kamu görevlilerinin haklarını koruyor, 
              mesleki gelişimlerini destekliyor ve sanatın gücünü toplum yararına kullanıyoruz.
            </p>
          </div>
        </Container>
      </Section>

      {/* Öne Çıkan İçerikler */}
      {featured.length > 0 && (
        <Section padding="xl">
          <Container>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Öne Çıkan İçerikler
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                En güncel ve önemli kültür sanat haberleri
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featured.map((it: any) => (
                <Link 
                  key={it._id} 
                  href={`/kultur-sanat-is/${it.slug}`} 
                  className="group block rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {it.coverImage ? (
                      <Image 
                        src={it.coverImage} 
                        alt={it.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                        Öne Çıkan
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mb-3">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Kültür Sanat-İş
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors mb-3 line-clamp-2">
                      {it.title}
                    </h3>
                    
                    {it.excerpt && (
                      <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4 leading-relaxed">
                        {it.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        {it.author || 'Anonim'}
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {new Date(it.publishDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Tüm İçerikler */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tüm İçerikler
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Kültür sanat alanındaki tüm haberler ve makaleler
            </p>
          </div>
          
          {regular.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map((it: any) => (
                <Link 
                  key={it._id} 
                  href={`/kultur-sanat-is/${it.slug}`} 
                  className="group block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {it.coverImage ? (
                      <Image 
                        src={it.coverImage} 
                        alt={it.title} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 mb-2">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Kültür Sanat-İş
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 mb-2">
                      {it.title}
                    </h3>
                    
                    {it.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                        {it.excerpt}
                      </p>
                    )}
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(it.publishDate).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState text="Henüz Kültür Sanat-İş içeriği eklenmemiş. Admin panelinden içerik ekleyebilirsiniz." />
          )}
        </Container>
      </Section>
    </>
  )
}

