'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Eye, Monitor, Smartphone } from 'lucide-react'

interface ImagePreviewProps {
  imageUrl: string
  title: string
  onClose: () => void
}

export default function ImagePreview({ imageUrl, title, onClose }: ImagePreviewProps) {
  const [previewMode, setPreviewMode] = useState<'slider' | 'card'>('slider')
  const [deviceSize, setDeviceSize] = useState<'desktop' | 'mobile'>('desktop')

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Görsel Önizleme</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Önizleme Modu:</label>
              <div className="flex gap-1">
                <Button
                  variant={previewMode === 'slider' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('slider')}
                >
                  Slider
                </Button>
                <Button
                  variant={previewMode === 'card' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPreviewMode('card')}
                >
                  Kart
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Cihaz:</label>
              <div className="flex gap-1">
                <Button
                  variant={deviceSize === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDeviceSize('desktop')}
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={deviceSize === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDeviceSize('mobile')}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  Mobile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-6">
          <div className={`mx-auto ${deviceSize === 'mobile' ? 'max-w-sm' : 'max-w-4xl'}`}>
            {previewMode === 'slider' ? (
              /* Slider Preview */
              <div className="relative w-full h-96 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4">
                    <h1 className="text-lg font-black mb-2 line-clamp-2 leading-tight">
                      {title}
                    </h1>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-semibold opacity-95">
                        {new Date().toLocaleDateString('tr-TR')}
                      </p>
                      <p className="text-sm font-medium opacity-90">
                        1 / 1
                      </p>
                    </div>
                  </div>
                </div>
                {/* Navigation arrows */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all">
                  ‹
                </button>
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white backdrop-blur-sm transition-all">
                  ›
                </button>
                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                </div>
              </div>
            ) : (
              /* Card Preview */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Large Card */}
                <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-black text-gray-900 line-clamp-2 mb-2 leading-tight">{title}</h3>
                    <p className="text-xs text-gray-700 font-semibold">{new Date().toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>

                {/* Small Square Cards */}
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white hover:bg-gray-50 transition-all duration-300 aspect-square relative overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl border border-gray-200">
                      {i === 1 ? (
                        <>
                          <div className="absolute inset-0 h-4/5">
                            <img
                              src={imageUrl}
                              alt={title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-white/95 backdrop-blur-sm p-2 flex flex-col justify-center border-t border-gray-100">
                            <h3 className="text-xs font-black text-gray-900 line-clamp-1 leading-tight mb-0.5">{title}</h3>
                            <p className="text-xs text-gray-600 font-semibold">{new Date().toLocaleDateString('tr-TR')}</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-center p-2">
                          <div className="w-8 h-8 bg-gray-300 rounded" />
                          <h3 className="text-xs font-bold text-gray-900">Duyuru {i}</h3>
                          <p className="text-xs text-gray-600 font-medium">Yakında</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Kapat
          </Button>
        </div>
      </div>
    </div>
  )
}
