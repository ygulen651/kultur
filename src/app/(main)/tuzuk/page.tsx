import Link from "next/link"
import { FileText, Download, Eye, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Section } from "@/components/Section"
import { Container } from "@/components/Container"
import { generatePageSEO } from "@/lib/seo"

export const metadata = generatePageSEO({
  title: "Tüzük",
  description: "Kültür Sanat İş sendikasının tüzüğü, yönetmelikler ve mevzuat bilgileri.",
  path: "/tuzuk"
})

async function getTuzukData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tuzuk`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        return result.data
      }
    }
    
    return null
  } catch (error) {
    console.error('Tüzük veri çekme hatası:', error)
    return null
  }
}

export default async function TuzukPage() {
  // Tüzük verilerini API'den al
  const tuzukData = await getTuzukData()
  
  // İçindekiler tablosu için başlıkları çıkar (basit implementasyon)
  const tableOfContents = [
    { id: "genel-hukumler", title: "Genel Hükümler", level: 1 },
    { id: "amac-ve-gorev", title: "Amaç ve Görev", level: 1 },
    { id: "uyelik", title: "Üyelik", level: 1 },
    { id: "uyelik-sartlari", title: "Üyelik Şartları", level: 2 },
    { id: "uyelik-haklari", title: "Üyelik Hakları", level: 2 },
    { id: "uyelik-yükümlülükleri", title: "Üyelik Yükümlülükleri", level: 2 },
    { id: "organlar", title: "Organlar", level: 1 },
    { id: "genel-kurul", title: "Genel Kurul", level: 2 },
    { id: "yonetim-kurulu", title: "Yönetim Kurulu", level: 2 },
    { id: "denetleme-kurulu", title: "Denetleme Kurulu", level: 2 },
    { id: "mali-hukumler", title: "Mali Hükümler", level: 1 },
    { id: "son-hukumler", title: "Son Hükümler", level: 1 }
  ]

  return (
    <>
      {/* Hero Section */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sendika Tüzüğü
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Kültür Sanat İş sendikasının tüzüğü, yönetmelikler ve mevzuat bilgileri
            </p>
          </div>
        </Container>
      </Section>

      {/* Tüzük Bilgileri */}
      <Section padding="lg">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Son Güncelleme</h3>
                <p className="text-muted-foreground">
                  {tuzukData ? new Date(tuzukData.updatedAt).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Versiyon</h3>
                <p className="text-muted-foreground">
                  {tuzukData?.version || '1.0.0'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Download className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">PDF İndir</h3>
                <Button size="sm" className="mt-2" disabled={!tuzukData}>
                  <Download className="h-4 w-4 mr-2" />
                  İndir
                </Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Ana İçerik */}
      <Section padding="xl">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* İçindekiler */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">İçindekiler</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => (
                      <Link
                        key={item.id}
                        href={`#${item.id}`}
                        className={`flex items-center text-sm hover:text-primary transition-colors ${
                          item.level === 2 ? 'ml-4 text-muted-foreground' : 'font-medium'
                        }`}
                      >
                        <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="line-clamp-2">{item.title}</span>
                      </Link>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Tüzük İçeriği */}
            <div className="lg:col-span-3">
              <Card>
                <CardContent className="p-8">
                  {tuzukData ? (
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                            {tuzukData.title}
                          </h2>
                          <Badge variant="outline" className="text-blue-700 dark:text-blue-300">
                            v{tuzukData.version}
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Son güncelleme: {new Date(tuzukData.updatedAt).toLocaleDateString('tr-TR')} 
                          - {tuzukData.lastModifiedBy} tarafından
                        </p>
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {tuzukData.content}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Tüzük İçeriği Bulunamadı
                      </h3>
                      <p className="text-muted-foreground">
                        Tüzük içeriği henüz eklenmemiş veya yayınlanmamış.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>



      {/* Hukuki Destek */}
      <Section padding="lg">
        <Container>
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">
              Hukuki Destek
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Tüzük ve mevzuat konularında sorularınız varsa, 
              hukuk birimimizden destek alabilirsiniz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/iletisim">
                  Hukuk Birimine Ulaşın
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/bilgi-belge">
                  Tüm Belgeleri İnceleyin
                </Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
