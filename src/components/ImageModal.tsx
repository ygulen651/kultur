"use client"

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

interface ImageModalProps {
  images: string[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
}

export default function ImageModal({ images, initialIndex, isOpen, onClose }: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!isOpen) return null

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowLeft') goToPrevious()
    if (e.key === 'ArrowRight') goToNext()
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Modal içeriği */}
      <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
        {/* Kapat butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Sol ok */}
        {images.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {/* Sağ ok */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}

        {/* Ana görsel */}
        <div className="relative">
          <Image
            src={images[currentIndex]}
            alt={`Ek Görsel ${currentIndex + 1}`}
            width={1200}
            height={800}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            priority
          />
        </div>

        {/* Görsel numarası */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Klavye kısayolları bilgisi */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-xs opacity-70">
          ← → tuşları ile gezinin, ESC ile kapatın
        </div>
      </div>
    </div>
  )
}
