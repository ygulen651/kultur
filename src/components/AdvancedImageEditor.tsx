'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  X, Crop as CropIcon, Eye, RotateCw, FlipHorizontal, FlipVertical, 
  ZoomIn, ZoomOut, Download, Palette, Sun, Contrast, Droplets, 
  Sparkles, Wand2, Settings, Undo, Redo, Save, Image as ImageIcon,
  Type, Square, Circle, Triangle, Brush, Eraser
} from 'lucide-react'
import ImagePreview from './ImagePreview'
import 'react-image-crop/dist/ReactCrop.css'

interface AdvancedImageEditorProps {
  imageUrl: string
  onCropComplete: (editedImageUrl: string) => void
  onClose: () => void
  aspectRatio?: number
  title?: string
}

interface ImageAdjustments {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  sharpness: number
  hue: number
  gamma: number
}

interface FilterPreset {
  name: string
  adjustments: Partial<ImageAdjustments>
  icon: React.ReactNode
}

const FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'Orijinal',
    adjustments: {},
    icon: <ImageIcon className="h-4 w-4" />
  },
  {
    name: 'Vintage',
    adjustments: { brightness: 0.1, contrast: 0.2, saturation: -0.3, hue: 20 },
    icon: <Palette className="h-4 w-4" />
  },
  {
    name: 'Siyah-Beyaz',
    adjustments: { saturation: -1, contrast: 0.3 },
    icon: <Contrast className="h-4 w-4" />
  },
  {
    name: 'Canlı',
    adjustments: { brightness: 0.2, contrast: 0.4, saturation: 0.5 },
    icon: <Sparkles className="h-4 w-4" />
  },
  {
    name: 'Yumuşak',
    adjustments: { brightness: 0.1, contrast: -0.2, blur: 0.1 },
    icon: <Droplets className="h-4 w-4" />
  },
  {
    name: 'Dramatik',
    adjustments: { brightness: -0.1, contrast: 0.6, saturation: 0.3 },
    icon: <Wand2 className="h-4 w-4" />
  }
]

export default function AdvancedImageEditor({ 
  imageUrl, 
  onCropComplete, 
  onClose, 
  aspectRatio = 16/9,
  title = "Gelişmiş Fotoğraf Editörü"
}: AdvancedImageEditorProps) {
  
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [activeTab, setActiveTab] = useState('crop')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Görsel düzenleme ayarları
  const [adjustments, setAdjustments] = useState<ImageAdjustments>({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    sharpness: 0,
    hue: 0,
    gamma: 1
  })
  
  const [activeFilter, setActiveFilter] = useState('Orijinal')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const mainCanvasRef = useRef<HTMLCanvasElement>(null)

  // Görsel yüklendiğinde otomatik kırpma alanı oluştur
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectRatio,
        width,
        height
      ),
      width,
      height
    )
    setCrop(crop)
  }, [aspectRatio])

  // Görsel düzenleme fonksiyonu
  const applyAdjustments = useCallback((canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, adjustments: ImageAdjustments) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i]
      let g = data[i + 1]
      let b = data[i + 2]
      
      // Parlaklık
      if (adjustments.brightness !== 0) {
        r = Math.max(0, Math.min(255, r + adjustments.brightness * 255))
        g = Math.max(0, Math.min(255, g + adjustments.brightness * 255))
        b = Math.max(0, Math.min(255, b + adjustments.brightness * 255))
      }
      
      // Kontrast
      if (adjustments.contrast !== 0) {
        const factor = (259 * (adjustments.contrast * 255 + 255)) / (255 * (259 - adjustments.contrast * 255))
        r = Math.max(0, Math.min(255, factor * (r - 128) + 128))
        g = Math.max(0, Math.min(255, factor * (g - 128) + 128))
        b = Math.max(0, Math.min(255, factor * (b - 128) + 128))
      }
      
      // Doygunluk
      if (adjustments.saturation !== 0) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b
        r = Math.max(0, Math.min(255, gray + adjustments.saturation * (r - gray)))
        g = Math.max(0, Math.min(255, gray + adjustments.saturation * (g - gray)))
        b = Math.max(0, Math.min(255, gray + adjustments.saturation * (b - gray)))
      }
      
      // Renk tonu
      if (adjustments.hue !== 0) {
        const hsv = rgbToHsv(r, g, b)
        hsv.h = (hsv.h + adjustments.hue) % 360
        const rgb = hsvToRgb(hsv.h, hsv.s, hsv.v)
        r = rgb.r
        g = rgb.g
        b = rgb.b
      }
      
      // Gamma
      if (adjustments.gamma !== 1) {
        r = Math.max(0, Math.min(255, 255 * Math.pow(r / 255, 1 / adjustments.gamma)))
        g = Math.max(0, Math.min(255, 255 * Math.pow(g / 255, 1 / adjustments.gamma)))
        b = Math.max(0, Math.min(255, 255 * Math.pow(b / 255, 1 / adjustments.gamma)))
      }
      
      data[i] = r
      data[i + 1] = g
      data[i + 2] = b
    }
    
    ctx.putImageData(imageData, 0, 0)
  }, [])

  // RGB to HSV dönüşümü
  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    
    let h = 0
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6
      else if (max === g) h = (b - r) / diff + 2
      else h = (r - g) / diff + 4
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
    
    const s = max === 0 ? 0 : diff / max
    const v = max
    
    return { h, s, v }
  }

  // HSV to RGB dönüşümü
  const hsvToRgb = (h: number, s: number, v: number) => {
    const c = v * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = v - c
    
    let r = 0, g = 0, b = 0
    if (h >= 0 && h < 60) { r = c; g = x; b = 0 }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0 }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    }
  }

  // Filtre uygula
  const applyFilter = useCallback((filterName: string) => {
    const filter = FILTER_PRESETS.find(f => f.name === filterName)
    if (filter) {
      setAdjustments(prev => ({ ...prev, ...filter.adjustments }))
      setActiveFilter(filterName)
    }
  }, [])

  // Görseli işle ve kaydet
  const processAndSaveImage = useCallback(async () => {
    try {
      console.log('Gelişmiş görsel işleme başlatılıyor...')
      
      const image = imgRef.current
      const canvas = mainCanvasRef.current
      if (!image || !canvas || !completedCrop) {
        console.error('Gerekli elementler bulunamadı')
        return
      }

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        console.error('Canvas context alınamadı')
        return
      }

      const pixelRatio = window.devicePixelRatio
      const canvasWidth = completedCrop.width * pixelRatio * scaleX
      const canvasHeight = completedCrop.height * pixelRatio * scaleY

      // Canvas boyut sınırlaması
      if (canvasWidth > 4000 || canvasHeight > 4000) {
        const maxSize = 4000
        const ratio = Math.min(maxSize / canvasWidth, maxSize / canvasHeight)
        canvas.width = canvasWidth * ratio
        canvas.height = canvasHeight * ratio
      } else {
        canvas.width = canvasWidth
        canvas.height = canvasHeight
      }

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      ctx.imageSmoothingQuality = 'high'

      const cropX = completedCrop.x * scaleX
      const cropY = completedCrop.y * scaleY

      const rotateRads = rotate * (Math.PI / 180)
      const centerX = image.naturalWidth / 2
      const centerY = image.naturalHeight / 2

      ctx.save()

      // Dönüşümler
      ctx.translate(-cropX, -cropY)
      ctx.translate(centerX, centerY)
      ctx.rotate(rotateRads)
      ctx.scale(flipHorizontal ? -scale : scale, flipVertical ? -scale : scale)
      ctx.translate(-centerX, -centerY)
      
      // Görseli çiz
      ctx.drawImage(
        image,
        0, 0, image.naturalWidth, image.naturalHeight,
        0, 0, image.naturalWidth, image.naturalHeight
      )

      ctx.restore()

      // Düzenleme ayarlarını uygula
      if (Object.values(adjustments).some(v => v !== 0 && v !== 1)) {
        applyAdjustments(canvas, ctx, adjustments)
      }

      // Bulanıklık efekti
      if (adjustments.blur > 0) {
        ctx.filter = `blur(${adjustments.blur * 10}px)`
        ctx.drawImage(canvas, 0, 0)
        ctx.filter = 'none'
      }

      // Keskinlik efekti
      if (adjustments.sharpness > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const sharpness = adjustments.sharpness * 2
        
        for (let y = 1; y < canvas.height - 1; y++) {
          for (let x = 1; x < canvas.width - 1; x++) {
            const idx = (y * canvas.width + x) * 4
            
            const r = data[idx] + sharpness * (data[idx] - data[idx - 4])
            const g = data[idx + 1] + sharpness * (data[idx + 1] - data[idx - 3])
            const b = data[idx + 2] + sharpness * (data[idx + 2] - data[idx - 2])
            
            data[idx] = Math.max(0, Math.min(255, r))
            data[idx + 1] = Math.max(0, Math.min(255, g))
            data[idx + 2] = Math.max(0, Math.min(255, b))
          }
        }
        
        ctx.putImageData(imageData, 0, 0)
      }

      const processedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
      
      // Geçmişe ekle
      setHistory(prev => [...prev.slice(0, historyIndex + 1), processedImageUrl])
      setHistoryIndex(prev => prev + 1)
      
      console.log('Gelişmiş görsel işleme tamamlandı')
      onCropComplete(processedImageUrl)
      
    } catch (error) {
      console.error('Görsel işleme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata'
      alert('Görsel işlenirken hata oluştu: ' + errorMessage)
    }
  }, [completedCrop, rotate, scale, flipHorizontal, flipVertical, adjustments, applyAdjustments, onCropComplete, historyIndex])

  // Önizleme oluştur
  const generatePreview = useCallback(async () => {
    const image = imgRef.current
    const previewCanvas = previewCanvasRef.current
    if (!image || !previewCanvas || !completedCrop) return

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = previewCanvas.getContext('2d')

    if (!ctx) return

    const pixelRatio = window.devicePixelRatio
    previewCanvas.width = completedCrop.width * pixelRatio * scaleX
    previewCanvas.height = completedCrop.height * pixelRatio * scaleY

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    const cropX = completedCrop.x * scaleX
    const cropY = completedCrop.y * scaleY

    const rotateRads = rotate * (Math.PI / 180)
    const centerX = image.naturalWidth / 2
    const centerY = image.naturalHeight / 2

    ctx.save()
    ctx.translate(-cropX, -cropY)
    ctx.translate(centerX, centerY)
    ctx.rotate(rotateRads)
    ctx.scale(flipHorizontal ? -scale : scale, flipVertical ? -scale : scale)
    ctx.translate(-centerX, -centerY)
    
    ctx.drawImage(
      image,
      0, 0, image.naturalWidth, image.naturalHeight,
      0, 0, image.naturalWidth, image.naturalHeight
    )

    ctx.restore()

    // Düzenleme ayarlarını uygula
    if (Object.values(adjustments).some(v => v !== 0 && v !== 1)) {
      applyAdjustments(previewCanvas, ctx, adjustments)
    }

    const previewUrl = previewCanvas.toDataURL('image/jpeg', 0.8)
    setPreviewImageUrl(previewUrl)
    setShowPreview(true)
  }, [completedCrop, rotate, scale, flipHorizontal, flipVertical, adjustments, applyAdjustments])

  // Geri al
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      const previousImage = history[historyIndex - 1]
      if (previousImage) {
        onCropComplete(previousImage)
      }
    }
  }, [historyIndex, history, onCropComplete])

  // İleri al
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      const nextImage = history[historyIndex + 1]
      if (nextImage) {
        onCropComplete(nextImage)
      }
    }
  }, [historyIndex, history, onCropComplete])

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wand2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-sm opacity-90">Profesyonel fotoğraf düzenleme aracı</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0} className="text-white hover:bg-white/20">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1} className="text-white hover:bg-white/20">
              <Redo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-120px)]">
          {/* Sol Panel - Araçlar */}
          <div className="w-80 bg-gray-50 border-r overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 m-4">
                <TabsTrigger value="crop" className="text-xs">
                  <CropIcon className="h-4 w-4 mr-1" />
                  Kırp
                </TabsTrigger>
                <TabsTrigger value="adjust" className="text-xs">
                  <Settings className="h-4 w-4 mr-1" />
                  Düzenle
                </TabsTrigger>
                <TabsTrigger value="filters" className="text-xs">
                  <Palette className="h-4 w-4 mr-1" />
                  Filtreler
                </TabsTrigger>
              </TabsList>

              {/* Kırpma Araçları */}
              <TabsContent value="crop" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CropIcon className="h-4 w-4" />
                      Kırpma ve Döndürme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ölçek: {Math.round(scale * 100)}%</label>
                      <Slider
                        value={[scale]}
                        onValueChange={([value]) => setScale(value)}
                        min={0.1}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Döndür: {rotate}°</label>
                      <Slider
                        value={[rotate]}
                        onValueChange={([value]) => setRotate(value)}
                        min={-180}
                        max={180}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFlipHorizontal(!flipHorizontal)}
                        className={flipHorizontal ? 'bg-blue-100' : ''}
                      >
                        <FlipHorizontal className="h-4 w-4 mr-1" />
                        Yatay
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFlipVertical(!flipVertical)}
                        className={flipVertical ? 'bg-blue-100' : ''}
                      >
                        <FlipVertical className="h-4 w-4 mr-1" />
                        Dikey
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Düzenleme Araçları */}
              <TabsContent value="adjust" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Görsel Düzenlemeleri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Parlaklık: {Math.round(adjustments.brightness * 100)}%
                      </label>
                      <Slider
                        value={[adjustments.brightness]}
                        onValueChange={([value]) => setAdjustments(prev => ({ ...prev, brightness: value }))}
                        min={-1}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Contrast className="h-4 w-4" />
                        Kontrast: {Math.round(adjustments.contrast * 100)}%
                      </label>
                      <Slider
                        value={[adjustments.contrast]}
                        onValueChange={([value]) => setAdjustments(prev => ({ ...prev, contrast: value }))}
                        min={-1}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Doygunluk: {Math.round(adjustments.saturation * 100)}%
                      </label>
                      <Slider
                        value={[adjustments.saturation]}
                        onValueChange={([value]) => setAdjustments(prev => ({ ...prev, saturation: value }))}
                        min={-1}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Renk Tonu: {Math.round(adjustments.hue)}°</label>
                      <Slider
                        value={[adjustments.hue]}
                        onValueChange={([value]) => setAdjustments(prev => ({ ...prev, hue: value }))}
                        min={-180}
                        max={180}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bulanıklık: {Math.round(adjustments.blur * 100)}%</label>
                      <Slider
                        value={[adjustments.blur]}
                        onValueChange={([value]) => setAdjustments(prev => ({ ...prev, blur: value }))}
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Keskinlik: {Math.round(adjustments.sharpness * 100)}%</label>
                      <Slider
                        value={[adjustments.sharpness]}
                        onValueChange={([value]) => setAdjustments(prev => ({ ...prev, sharpness: value }))}
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gamma: {adjustments.gamma.toFixed(2)}</label>
                      <Slider
                        value={[adjustments.gamma]}
                        onValueChange={([value]) => setAdjustments(prev => ({ ...prev, gamma: value }))}
                        min={0.1}
                        max={3}
                        step={0.01}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Filtreler */}
              <TabsContent value="filters" className="p-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Filtre Hazır Ayarları
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {FILTER_PRESETS.map((filter) => (
                        <Button
                          key={filter.name}
                          variant={activeFilter === filter.name ? "default" : "outline"}
                          size="sm"
                          onClick={() => applyFilter(filter.name)}
                          className="justify-start h-auto p-3"
                        >
                          <div className="flex flex-col items-center gap-1">
                            {filter.icon}
                            <span className="text-xs">{filter.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Orta Panel - Görsel Editörü */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 flex items-center justify-center p-4 bg-gray-100">
              <div className="relative">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspectRatio}
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    alt="Edit me"
                    src={imageUrl}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                      maxHeight: '70vh',
                      maxWidth: '100%'
                    }}
                    onLoad={onImageLoad}
                    className="rounded-lg shadow-lg"
                  />
                </ReactCrop>
              </div>
            </div>

            {/* Alt Panel - Önizleme ve Kontroller */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={generatePreview}
                    disabled={!completedCrop}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Önizleme
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Gelişmiş
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={onClose}>
                    İptal
                  </Button>
                  <Button 
                    onClick={processAndSaveImage}
                    disabled={!completedCrop}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gizli canvas'lar */}
        <canvas ref={previewCanvasRef} className="hidden" />
        <canvas ref={mainCanvasRef} className="hidden" />

        {/* Önizleme Modal */}
        {showPreview && (
          <ImagePreview
            imageUrl={previewImageUrl}
            title="Düzenlenmiş Görsel Önizlemesi"
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  )
}
