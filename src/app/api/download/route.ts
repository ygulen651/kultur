import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { Readable } from 'stream'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('file')
    const fileName = searchParams.get('name')
    
    if (!filePath) {
      return NextResponse.json({ error: 'Dosya yolu belirtilmedi' }, { status: 400 })
    }
    
    // Cloudinary URL kontrolü
    if (filePath.includes('cloudinary.com')) {
      console.log('Cloudinary URL tespit edildi:', filePath)
      console.log('Dosya adı:', fileName)

      try {
        // Dosyayı doğrudan indir
        const response = await fetch(filePath)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        console.log('Dosya boyutu:', buffer.length, 'bytes')

        const ext = path.extname(fileName || 'file').toLowerCase()
        console.log('Dosya uzantısı:', ext)

        // Dosya türünü belirle
        let contentType = 'application/octet-stream'
        switch (ext) {
          case '.pdf':
            contentType = 'application/pdf'
            break
          case '.doc':
            contentType = 'application/msword'
            break
          case '.docx':
            contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            break
          case '.xls':
            contentType = 'application/vnd.ms-excel'
            break
          case '.xlsx':
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            break
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg'
            break
          case '.png':
            contentType = 'image/png'
            break
        }

        console.log('Content-Type:', contentType)

        // Response oluştur - dosya adı düzgün olacak
        const downloadResponse = new NextResponse(buffer, {
          headers: {
            'Content-Disposition': `attachment; filename="${fileName || 'dosya'}"`,
            'Content-Type': contentType,
            'Content-Length': buffer.length.toString()
          }
        })

        console.log('Cloudinary dosya başarıyla indirildi')
        return downloadResponse

      } catch (error) {
        console.error('Cloudinary dosya indirme hatası:', error)
        return NextResponse.json({
          error: 'Cloudinary dosyası indirilemedi',
          details: error instanceof Error ? error.message : 'Bilinmeyen hata'
        }, { status: 500 })
      }
    }
    
    // Yerel dosya kontrolü - sadece uploads ve documents klasörlerinden dosya indirilebilir
    if (!filePath.startsWith('/uploads/') && !filePath.startsWith('/documents/')) {
      return NextResponse.json({ error: 'Geçersiz dosya yolu' }, { status: 400 })
    }
    
    // Dosya yolunu public klasörüne ekle
    const fullPath = path.join(process.cwd(), 'public', filePath)
    
    // Dosyanın var olup olmadığını kontrol et
    try {
      await fs.access(fullPath)
    } catch {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 })
    }
    
    // Dosyayı oku
    const fileBuffer = await fs.readFile(fullPath)
    
    // Dosya türünü belirle
    const ext = path.extname(filePath).toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.doc':
        contentType = 'application/msword'
        break
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case '.xls':
        contentType = 'application/vnd.ms-excel'
        break
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        break
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
    }
    
    // Response oluştur
    const response = new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName || path.basename(filePath)}"`,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString()
      }
    })
    
    return response
    
  } catch (error) {
    console.error('Dosya indirme hatası:', error)
    return NextResponse.json({ error: 'Dosya indirilemedi' }, { status: 500 })
  }
}
