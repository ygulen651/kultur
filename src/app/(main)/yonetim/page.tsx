"use client"

import { useEffect, useState } from 'react'
import Image from "next/image"
import { Mail, Phone, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"


interface ManagementMember {
  _id?: string
  id?: string
  name: string
  position: string
  bio: string
  photo: string
  email: string
  phone: string
  experience: string
  education: string
}

export default function YonetimPage() {
  const [members, setMembers] = useState<ManagementMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    try {
      setLoading(true)
      console.log('🔄 Ana sayfa: Yönetim kurulu verileri yükleniyor...')
      const res = await fetch('/api/boards/yonetim-kurulu')
      const json = await res.json()
      console.log('📡 Ana sayfa API Response:', JSON.stringify(json, null, 2))
      
      if (json.success) {
        console.log('✅ Ana sayfa: Üyeler yüklendi:', JSON.stringify(json.data, null, 2))
        console.log('🔢 Ana sayfa üye sayısı:', json.data?.length || 0)
        if (json.data && json.data.length > 0) {
          console.log('👤 Ana sayfa ilk üye:', JSON.stringify(json.data[0], null, 2))
        }
        setMembers(json.data || [])
      } else {
        console.error('❌ Ana sayfa: API başarısız:', json.message)
        setMembers([])
      }
    } catch (error) {
      console.error('❌ Ana sayfa: Yönetim kurulu verileri yüklenemedi:', error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Yönetim kurulu yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hero Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Yönetim Kurulu
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sendikamızı yöneten deneyimli ve alanında uzman yönetim kurulu üyelerimiz
            </p>
          </div>
        </div>
      </div>

      {/* Yönetim Kurulu Üyeleri */}
      <div className="py-20">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          {members.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Henüz yönetim kurulu üyesi eklenmemiş</h3>
              <p className="text-muted-foreground">
                Yönetim kurulu üyeleri yakında burada görünecek.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member, index) => (
                <Card key={member._id || member.id || `member-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                      <CardTitle className="text-xl mb-1">{member.name || '(İsim Yok)'}</CardTitle>
                      <Badge variant="secondary" className="mb-3">
                        {member.position || '(Pozisyon Yok)'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {member.bio && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                    
                    {member.experience && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Deneyim:</span>
                          <span className="font-medium">{member.experience}</span>
                        </div>
                        
                        {member.education && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Eğitim:</span>
                            <span className="font-medium">{member.education}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {(member.email || member.phone) && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col gap-2">
                          {member.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">E-posta:</span>
                              <a 
                                href={`mailto:${member.email}`}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {member.email}
                              </a>
                            </div>
                          )}
                          
                          {member.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Telefon:</span>
                              <a 
                                href={`tel:${member.phone}`}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {member.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
