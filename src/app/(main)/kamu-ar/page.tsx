import Link from 'next/link'
import Image from 'next/image'
import { Section } from '@/components/Section'
import { Container } from '@/components/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, Calendar, User } from 'lucide-react'

async function getKamuArData() {
  try {
    // Server-side'da base URL gerekli
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    
    const response = await fetch(`${baseUrl}/api/kamu-ar`, {
      next: { revalidate: 3600 } // 1 saat cache
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        return result.data
      }
    }
    
    return []
  } catch (error) {
    console.error('KAMU-AR veri çekme hatası:', error)
    return []
  }
}

export default async function KamuArListPage({ searchParams }: { searchParams?: Promise<{ q?: string; c?: string; t?: string }> }) {
  const sp = searchParams ? await searchParams : undefined
  const items = await getKamuArData()
  
  // Öne çıkan ve normal içerikleri ayır
  const featured = items.filter((item: any) => item.isFeatured)
  const regular = items.filter((item: any) => !item.isFeatured)

  return (
    <>
      {featured.length > 0 && (
        <Section padding="xl">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Öne Çıkan İçerikler</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                KAMU-AR'dan seçilen önemli haberler ve analizler
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featured.map((item: any) => (
                <Link key={item._id} href={`/kamu-ar/${item.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {item.coverImage && (
                        <Image 
                          src={item.coverImage} 
                          alt={item.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge variant="secondary" className="mb-2">
                          {item.category}
                        </Badge>
                        <h3 className="text-xl font-bold text-white line-clamp-2 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-white/90 text-sm line-clamp-2 mb-3">
                          {item.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-white/80 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {item.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(item.publishDate).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {item.readTime} dk
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section padding="xl" background="muted">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tüm İçerikler</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              KAMU-AR'dan güncel haberler, analizler ve raporlar
            </p>
          </div>
          
          {regular.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regular.map((item: any) => (
                <Link key={item._id} href={`/kamu-ar/${item.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {item.coverImage && (
                        <Image 
                          src={item.coverImage} 
                          alt={item.title} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                        {item.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {item.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.readTime} dk
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {new Date(item.publishDate).toLocaleDateString('tr-TR')}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Henüz İçerik Eklenmemiş</h3>
              <p className="text-muted-foreground">
                KAMU-AR sayfasında henüz içerik bulunmuyor. Admin panelinden içerik ekleyebilirsiniz.
              </p>
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  )
}
