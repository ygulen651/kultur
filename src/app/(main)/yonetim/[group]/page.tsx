import Image from "next/image"
import { Mail, Phone, User, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Section } from "@/components/Section"
import { Container } from "@/components/Container"

interface ManagementMember {
  _id: string
  name: string
  position: string
  bio: string
  photo: string
  email: string
  phone: string
  experience: string
  education: string
  order: number
  group?: string
}

const titleMap: Record<string, string> = {
  'merkez-yonetim-kurulu': 'Merkez Yönetim Kurulu',
  'merkez-denetleme-kurulu': 'Merkez Denetleme Kurulu',
  'merkez-disiplin-kurulu': 'Merkez Disiplin Kurulu'
}

async function getManagementDataByGroup(group: string): Promise<ManagementMember[]> {
  try {
    // Server-side'da base URL gerekli
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const response = await fetch(`${baseUrl}/api/boards/${group}`, {
      next: { revalidate: 3600 } // 1 saat cache
    })
    
    if (response.ok) {
      const result = await response.json()
      if (result.success) {
        return result.data || []
      }
    }
    
    return []
  } catch (error) {
    console.error('Veri çekme hatası:', error)
    return []
  }
}

export default async function YonetimGroupPage({ params }: { params: Promise<{ group: string }> }) {
  const { group } = await params
  const decodedGroup = decodeURIComponent(group)
  const title = titleMap[decodedGroup] || 'Yönetim Kurulu'
  const members = await getManagementDataByGroup(decodedGroup)

  return (
    <>
      {/* Hero Section */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {title}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              {title} üyeleri
            </p>
          </div>
        </Container>
      </Section>

      {/* Yönetim Kurulu Üyeleri */}
      <Section padding="xl">
        <Container>
          {members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member) => (
                <Card key={member._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="text-center">
                      <CardTitle className="text-xl mb-1">{member.name}</CardTitle>
                      <Badge variant="secondary" className="mb-3">
                        {member.position}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {member.bio}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Deneyim:</span>
                        <span className="font-medium">{member.experience}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">E-posta:</span>
                        <span className="font-medium">{member.email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Telefon:</span>
                        <span className="font-medium">{member.phone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // Boş kart - üye yoksa
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Henüz üye eklenmemiş
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {title} için henüz üye eklenmemiş. Admin panelinden üye ekleyebilirsiniz.
                </p>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    asChild
                  >
                    <a href="/admin/login" target="_blank" rel="noopener noreferrer">
                      <Plus className="h-4 w-4 mr-2" />
                      Admin Paneli
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
