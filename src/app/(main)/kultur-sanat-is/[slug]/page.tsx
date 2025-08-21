"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Section } from '@/components/Section'
import { Container } from '@/components/Container'
import { connectDB } from '@/lib/mongodb'
import { KulturSanatIsModel } from '@/models/KulturSanatIs'
import ImageModal from '@/components/ImageModal'

interface PageProps { params: Promise<{ slug: string }> }

export default function KulturSanatIsDetail({ params }: PageProps) {
  const [slug, setSlug] = useState<string>('')
  const [it, setIt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Component mount olduğunda veriyi yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        const resolvedParams = await params
        setSlug(resolvedParams.slug)
        
        const response = await fetch(`/api/kultur-sanat-is/${resolvedParams.slug}`)
        const data = await response.json()
        
        if (data.success) {
          setIt(data.data)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [params])

  const openModal = (index: number) => {
    setSelectedImageIndex(index)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
  }
  
  if (loading) {
    return (
      <Section padding="xl">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
            <p className="text-xl text-muted-foreground">İçerik yükleniyor...</p>
          </div>
        </Container>
      </Section>
    )
  }

  if (!it) {
    return (
      <Section padding="xl">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-red-600">
              İçerik Bulunamadı
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              "{slug}" slug'ı ile ilgili içerik bulunamadı.
            </p>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <>
      <Section padding="xl">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Başlık */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {it.title}
              </h1>
              
              {/* Meta bilgiler */}
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {it.author}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(it.publishDate).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  {it.category}
                </span>
              </div>
            </div>
            
            {/* Kapak Görseli */}
            {it.coverImage && (
              <div className="mb-12">
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl">
                  <Image 
                    src={it.coverImage} 
                    alt={it.title} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                    className="object-cover transition-transform duration-300 hover:scale-105" 
                    priority
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
              </div>
            )}
            
            {/* Özet */}
            {it.excerpt && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-l-4 border-blue-500">
                <p className="text-xl text-gray-700 dark:text-gray-200 leading-relaxed italic">
                  "{it.excerpt}"
                </p>
              </div>
            )}
            
            {/* Ana İçerik */}
            {it.content && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div 
                  className="text-gray-700 dark:text-gray-200 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ 
                    __html: it.content.replace(/\n/g, '<br />') 
                  }} 
                />
              </div>
            )}
            

            
            {/* Ek Görseller */}
            {it.images && it.images.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                {/* Görsel sayısı bilgisi */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 px-6 py-3 rounded-full border border-red-200 dark:border-red-700">
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      📸 {it.images.length} Ek Görsel
                    </span>
                    <span className="text-red-500 dark:text-red-300 text-sm">
                      Tıklayarak büyütün
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {it.images.map((image: string, index: number) => (
                    <div key={index} className="group cursor-pointer" onClick={() => openModal(index)}>
                      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105">
                        <Image 
                          src={image} 
                          alt={`Ek Görsel ${index + 1}`}
                          fill 
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500" 
                        />
                        
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Görsel numarası */}
                        <div className="absolute top-3 left-3 bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg transform scale-100 group-hover:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        
                        {/* Tıklama göstergesi */}
                        <div className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                          🔍 Büyüt
                        </div>
                        
                        {/* Hover efekti - border */}
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500 transition-colors duration-300 rounded-2xl"></div>
                        
                        {/* Alt bilgi */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-sm font-medium text-center">
                            Ek Görsel {index + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Modal */}
                <ImageModal
                  images={it.images}
                  initialIndex={selectedImageIndex}
                  isOpen={modalOpen}
                  onClose={closeModal}
                />
              </div>
            )}
            
            {/* Ek Dosya */}
            {it.file && (
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Ek Dosya</h3>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v1H8a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {it.fileName || 'Ek Dosya'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {it.fileType || 'Dosya türü bilinmiyor'}
                    </p>
                  </div>
                  <a 
                    href={it.file} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    İndir
                  </a>
                </div>
              </div>
            )}
            
            {/* Etiketler */}
            {it.tags && it.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Etiketler</h3>
                <div className="flex flex-wrap gap-2">
                  {it.tags.map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full border border-blue-200 dark:border-blue-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  )
}

