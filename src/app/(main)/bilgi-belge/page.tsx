'use client'

import { Suspense } from "react"
import { FileText, Download, Calendar, User, Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Section } from "@/components/Section"
import { Container } from "@/components/Container"

interface Document {
  _id: string
  title: string
  description: string
  category: string
  tags: string[]
  fileUrl: string
  fileName: string
  fileSize: number
  fileType: string
  status: string
  isPrivate: boolean
  downloadCount: number
  uploadedBy: string
  createdAt: string
}

// Statik belge verileri
const documents: Document[] = [
  {
    "_id": "1",
    "title": "NEDEN KÜLTÜR SANAT-İŞ",
    "description": "Kültür Sanat İş sendikasına neden üye olunmalı konusunda detaylı bilgi",
    "category": "Resmi Belgeler",
    "tags": ["Resmi Belgeler", "DOCX"],
    "fileUrl": "/uploads/1754912116203-NEDEN KÜLTÜR SANATİŞ YAZISI 2017.docx",
    "fileName": "NEDEN KÜLTÜR SANATİŞ YAZISI 2017.docx",
    "fileSize": 1185792,
    "fileType": "docx",
    "status": "published",
    "isPrivate": false,
    "downloadCount": 0,
    "uploadedBy": "Admin",
    "createdAt": "2025-08-26T00:00:00.000Z"
  },
  {
    "_id": "2",
    "title": "ÜYELİK FORMU",
    "description": "Kültür Sanat İş sendikasına üye olmak için gerekli form",
    "category": "Resmi Belgeler",
    "tags": ["Resmi Belgeler", "PDF"],
    "fileUrl": "/documents/Kültür-Sanat-İş-Üyelik-Formu.pdf",
    "fileName": "Kültür-Sanat-İş-Üyelik-Formu.pdf",
    "fileSize": 337000,
    "fileType": "pdf",
    "status": "published",
    "isPrivate": false,
    "downloadCount": 0,
    "uploadedBy": "Admin",
    "createdAt": "2025-08-26T00:00:00.000Z"
  },
  {
    "_id": "3",
    "title": "BAKANLIK TALEPLERİ",
    "description": "Bakanlık ile ilgili talep ve başvuru formları",
    "category": "Resmi Belgeler",
    "tags": ["Resmi Belgeler", "DOCX"],
    "fileUrl": "/uploads/BAKANLIK_TALEPLER__1755594332190.docx",
    "fileName": "BAKANLIK_TALEPLER__1755594332190.docx",
    "fileSize": 33710,
    "fileType": "docx",
    "status": "published",
    "isPrivate": false,
    "downloadCount": 0,
    "uploadedBy": "Admin",
    "createdAt": "2025-08-26T00:00:00.000Z"
  }
]

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileTypeColor(fileType: string): string {
  const colors: Record<string, string> = {
    pdf: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    doc: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    docx: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    xls: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    xlsx: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    ppt: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    pptx: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    txt: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }
  return colors[fileType.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

function DocumentsList({ documents }: { documents: Document[] }) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📄</div>
        <h3 className="text-xl font-semibold mb-2">Henüz belge yok</h3>
        <p className="text-muted-foreground">Belgeler yakında eklenecek.</p>
      </div>
    )
  }

  const handleDownload = (doc: Document) => {
    try {
      // Dosya URL'ini kontrol et
      if (!doc.fileUrl) {
        alert('Dosya bulunamadı!')
        return
      }

      // API endpoint'i kullanarak dosya indir
      const downloadUrl = `/api/download?file=${encodeURIComponent(doc.fileUrl)}&name=${encodeURIComponent(doc.fileName)}`
      window.open(downloadUrl, '_blank')
    } catch (error) {
      console.error('Dosya indirme hatası:', error)
      alert('Dosya indirilemedi. Lütfen tekrar deneyin.')
    }
  }

  const handleView = (doc: Document) => {
    try {
      if (!doc.fileUrl) {
        alert('Dosya bulunamadı!')
        return
      }

      // Yeni sekmede aç
      window.open(doc.fileUrl, '_blank')
    } catch (error) {
      console.error('Dosya görüntüleme hatası:', error)
      alert('Dosya görüntülenemedi. Lütfen tekrar deneyin.')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <Card key={doc._id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold mb-2">
                  {doc.title}
                </CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {doc.category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {doc.fileType.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {doc.description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {doc.description}
              </p>
            )}
            
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {doc.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {doc.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{doc.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{doc.uploadedBy}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(doc.createdAt).toLocaleDateString('tr-TR')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                <span>{doc.downloadCount} indirme</span>
                <span>•</span>
                <span>{formatFileSize(doc.fileSize)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button 
                onClick={() => handleDownload(doc)}
                className="flex-1"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                İndir
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleView(doc)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Görüntüle
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function BilgiBelgePage() {

  return (
    <>
      {/* Hero Section */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Bilgi Belge
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sendika ile ilgili tüm resmi belgeler, şablonlar, formlar ve dokümanlar
            </p>
          </div>
        </Container>
      </Section>

      {/* Belgeler */}
      <Section padding="xl">
        <Container>
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Belge ara..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrele
                </Button>
              </div>
            </div>
          </div>

          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-4 text-lg text-muted-foreground">Belgeler yükleniyor...</p>
              </div>
            </div>
          }>
            <DocumentsList documents={documents} />
          </Suspense>
        </Container>
      </Section>
    </>
  )
}
