import Link from 'next/link'
import Image from 'next/image'
import { Section } from '@/components/Section'
import { Container } from '@/components/Container'
import EmptyState from '@/components/EmptyState'
import { getKulturSanatIs } from '@/lib/data'

export default async function KulturSanatIsList({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const sp = searchParams ? await searchParams : undefined
  const items = await getKulturSanatIs()
  
  // Boş array'ler
  const featured: any[] = []
  const regular: any[] = []

  return (
    <>
      {featured.length > 0 && (
        <Section padding="xl">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featured.map((it: any) => (
                <Link key={it._id} href={`/kultur-sanat-is/${it.slug}`} className="group block rounded-2xl overflow-hidden border bg-white dark:bg-gray-900">
                  <div className="relative aspect-[16/9]">
                    {it.coverImage && (
                      <Image src={it.coverImage} alt={it.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-primary/80 mb-2">Kültür Sanat-İş</div>
                    <h2 className="text-xl md:text-2xl font-bold group-hover:text-primary line-clamp-2">{it.title}</h2>
                    {it.excerpt && (<p className="mt-2 text-muted-foreground line-clamp-2">{it.excerpt}</p>)}
                    <div className="mt-4 text-sm text-muted-foreground">{new Date(it.publishDate).toLocaleDateString('tr-TR')}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section padding="xl" background="muted">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regular.map((it: any) => (
              <Link key={it._id} href={`/kultur-sanat-is/${it.slug}`} className="group block rounded-2xl overflow-hidden border bg-white dark:bg-gray-900">
                <div className="relative aspect-[16/9] bg-black/5">
                  {it.coverImage && (
                    <Image src={it.coverImage} alt={it.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs text-primary/80 mb-1">Kültür Sanat-İş</div>
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary">{it.title}</h3>
                </div>
              </Link>
            ))}
          </div>

          {items.length === 0 && (
            <EmptyState text="Henüz Kültür Sanat-İş içeriği eklenmemiş. Admin panelinden içerik ekleyebilirsiniz." />
          )}
        </Container>
      </Section>
    </>
  )
}

