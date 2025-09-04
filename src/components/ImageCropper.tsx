'use client'

import { useState, useRef, useCallback } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { Button } from '@/components/ui/button'
import { X, RotateCw, ZoomIn, ZoomOut, Crop as CropIcon, Eye } from 'lucide-react'
import ImagePreview from './ImagePreview'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedImageUrl: string) => void
  onClose: () => void
  aspectRatio?: number
  title?: string
}

export default function ImageCropper({ 
  imageUrl, 
  onCropComplete, 
  onClose, 
  aspectRatio = 16/9,
  title = "Görsel"
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

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

  const onDownloadCropClick = useCallback(async () => {
    const image = imgRef.current
    const previewCanvas = previewCanvasRef.current
    if (!image || !previewCanvas || !completedCrop) {
      return
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = previewCanvas.getContext('2d')

    if (!ctx) {
      return
    }

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

    // 5) Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY)
    // 4) Move the origin to the center of the original position
    ctx.translate(centerX, centerY)
    // 3) Rotate around the origin
    ctx.rotate(rotateRads)
    // 2) Scale the image
    ctx.scale(flipHorizontal ? -scale : scale, flipVertical ? -scale : scale)
    // 1) Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    )

    ctx.restore()

    const croppedImageUrl = previewCanvas.toDataURL('image/jpeg', 0.9)
    onCropComplete(croppedImageUrl)
  }, [completedCrop, rotate, scale, flipHorizontal, flipVertical, onCropComplete])

  // Önizleme için kırpılmış görseli oluştur
  const generatePreviewImage = useCallback(async () => {
    const image = imgRef.current
    const previewCanvas = previewCanvasRef.current
    if (!image || !previewCanvas || !completedCrop) {
      return
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = previewCanvas.getContext('2d')

    if (!ctx) {
      return
    }

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

    // 5) Move the crop origin to the canvas origin (0,0)
    ctx.translate(-cropX, -cropY)
    // 4) Move the origin to the center of the original position
    ctx.translate(centerX, centerY)
    // 3) Rotate around the origin
    ctx.rotate(rotateRads)
    // 2) Scale the image
    ctx.scale(flipHorizontal ? -scale : scale, flipVertical ? -scale : scale)
    // 1) Move the center of the image to the origin (0,0)
    ctx.translate(-centerX, -centerY)
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight
    )

    ctx.restore()

    const previewUrl = previewCanvas.toDataURL('image/jpeg', 0.9)
    setPreviewImageUrl(previewUrl)
    setShowPreview(true)
  }, [completedCrop, rotate, scale, flipHorizontal, flipVertical])

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <CropIcon className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Görsel Kırp ve Düzenle</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Ölçek:</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600">{Math.round(scale * 100)}%</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Döndür:</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={rotate}
                onChange={(e) => setRotate(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-600">{rotate}°</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlipHorizontal(!flipHorizontal)}
                className={flipHorizontal ? 'bg-blue-100' : ''}
              >
                Yatay Çevir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFlipVertical(!flipVertical)}
                className={flipVertical ? 'bg-blue-100' : ''}
              >
                Dikey Çevir
              </Button>
            </div>
          </div>

          {/* Image Crop Area */}
          <div className="flex justify-center">
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
                alt="Crop me"
                src={imageUrl}
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                  maxHeight: '60vh',
                  maxWidth: '100%'
                }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          </div>

          {/* Preview */}
          {completedCrop && (
            <div className="text-center">
              <h3 className="text-sm font-medium mb-2">Önizleme:</h3>
              <canvas
                ref={previewCanvasRef}
                className="border rounded-lg max-w-xs mx-auto"
                style={{
                  display: 'block',
                  maxHeight: '200px'
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t">
          <Button 
            variant="outline"
            onClick={generatePreviewImage}
            disabled={!completedCrop}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Önizleme
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button 
              onClick={onDownloadCropClick}
              disabled={!completedCrop}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CropIcon className="h-4 w-4 mr-2" />
              Kırp ve Kaydet
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <ImagePreview
          imageUrl={previewImageUrl}
          title={title}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}
