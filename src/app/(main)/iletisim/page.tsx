"use client"

import { useState } from "react"
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Section } from "@/components/Section"
import { Container } from "@/components/Container"
import { generatePageSEO } from "@/lib/seo"

const metadata = generatePageSEO({
  title: "İletişim",
  description: "Kültür Sanat İş ile iletişime geçin. Adres, telefon, e-posta bilgileri ve iletişim formu.",
  path: "/iletisim"
})

export default function IletisimPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    category: "genel"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.ok) {
        setSubmitStatus('success')
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          category: "genel"
        })
      } else {
        setSubmitStatus('error')
        const errorMessage = result.message || 'Bilinmeyen hata'
        console.error('Form gönderim hatası:', errorMessage)
        // API'den gelen hata mesajını kullanıcıya göster
        alert(`Form hatası: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Network hatası:', error)
      setSubmitStatus('error')
      // Network hatası durumunda kullanıcıya bilgi ver
      alert('Bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <>
      {/* Hero Section */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              İletişim
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Bizimle iletişime geçin. Sorularınız, önerileriniz ve talepleriniz için buradayız.
            </p>
          </div>
        </Container>
      </Section>

      {/* İletişim Bilgileri */}
      <Section padding="xl">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Adres</h3>
                <p className="text-muted-foreground text-sm">
                  Şehit Adem Yavuz Sokak. Hitit Apt. No:14/14<br />
                  Kızılay / ANKARA
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Telefon</h3>
                <p className="text-muted-foreground text-sm">
                  <a href="tel:+903124198579" className="hover:text-primary">
                    0312-419 85 79
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">E-posta</h3>
                <p className="text-muted-foreground text-sm">
                  <a href="mailto:info@kultursanatis.org" className="hover:text-primary">
                    info@kultursanatis.org
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Faks</h3>
                <p className="text-muted-foreground text-sm">0312-419 85 79</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Bell className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">E-posta Bildirimleri</h3>
                <p className="text-sm text-muted-foreground">
                  Önemli duyurular ve güncellemeler için e-posta listemize abone olun
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => {
                    // E-posta aboneliği için modal açılabilir
                    alert('E-posta aboneliği özelliği yakında eklenecek!')
                  }}
                >
                  Abone Ol
                </Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </Section>

      {/* İletişim Formu ve Harita */}
      <Section padding="xl" background="muted">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* İletişim Formu */}
            <div className="w-full">
              <Card className="shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <MessageCircle className="h-6 w-6" />
                    İletişim Formu
                  </CardTitle>
                  <p className="text-muted-foreground text-base">
                    Sorularınız, önerileriniz veya talepleriniz için aşağıdaki formu doldurabilirsiniz.
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  {submitStatus === 'success' && (
                    <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 text-base font-medium">
                        ✅ Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                      </p>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-800 dark:text-red-200 text-base font-medium">
                        ❌ Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-base font-medium mb-3 block">Ad Soyad *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Adınız ve soyadınız"
                          className="h-12 text-base px-4"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-base font-medium mb-3 block">E-posta *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="ornek@email.com"
                          className="h-12 text-base px-4"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone" className="text-base font-medium mb-3 block">Telefon</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="0555 123 45 67"
                          className="h-12 text-base px-4"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category" className="text-base font-medium mb-3 block">Konu Kategorisi</Label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full h-12 px-4 py-2 border border-input bg-background rounded-md text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="genel">Genel Bilgi</option>
                          <option value="uyelik">Üyelik</option>
                          <option value="hukuk">Hukuki Destek</option>
                          <option value="etkinlik">Etkinlikler</option>
                          <option value="basin">Basın</option>
                          <option value="sikayet">Şikayet</option>
                          <option value="oneri">Öneri</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-base font-medium mb-3 block">Konu *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Mesajınızın konusu"
                        className="h-12 text-base px-4"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-base font-medium mb-3 block">Mesaj *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={8}
                        placeholder="Mesajınızı detaylı bir şekilde buraya yazın..."
                        className="text-base px-4 py-3 resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-14 text-lg font-medium"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Gönderiliyor...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-3" />
                          Mesajı Gönder
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Harita */}
            <div className="w-full">
              <Card className="shadow-lg h-full">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <MapPin className="h-6 w-6" />
                    Konum
                  </CardTitle>
                  <p className="text-muted-foreground text-base">
                    Sendika binamızın konumu ve iletişim bilgileri
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3059.6234567890123!2d32.8597!3d39.9208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d347d520732db1%3A0x4b8b8b8b8b8b8b8b!2sZiya%20G%C3%B6kalp%20Cd.%20No%3A45%20D%3A5%2C%2006420%20%C3%87ankaya%2FAnkara!5e0!3m2!1str!2str!4v1641234567890!5m2!1str!2str"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                      title="Kültür Sanat İş Sendikası Konumu"
                    />
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-lg mb-3">Adres Bilgileri</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Adres:</strong> Şehit Adem Yavuz Sokak. Hitit Apt. No:14/14</p>
                      <p><strong>İlçe:</strong> Kızılay</p>
                      <p><strong>Şehir:</strong> ANKARA</p>
                      <p><strong>Telefon:</strong> 0312-419 85 79</p>
                      <p><strong>E-posta:</strong> info@kultursanatis.org</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
