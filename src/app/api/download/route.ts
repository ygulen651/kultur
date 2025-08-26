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

      // HTML sayfa ile dosya indirme linki ver
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Dosya İndiriliyor...</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .download-btn { background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .download-btn:hover { background: #0056b3; }
            .info { color: #666; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>📄 Dosya İndirme</h1>
            <div class="info">
              <p><strong>Dosya Adı:</strong> ${fileName || 'Bilinmeyen Dosya'}</p>
              <p><strong>Dosya Türü:</strong> ${path.extname(fileName || '') || 'Bilinmeyen'}</p>
            </div>
            <a href="${filePath}" class="download-btn" download="${fileName || 'dosya'}">
              📥 Dosyayı İndir
            </a>
            <p class="info">Eğer dosya otomatik indirilmediyse, yukarıdaki butona tıklayın.</p>
            <script>
              // Otomatik indirme dene
              setTimeout(() => {
                const link = document.createElement('a');
                link.href = '${filePath}';
                link.download = '${fileName || 'dosya'}';
                link.click();
              }, 1000);
            </script>
          </div>
        </body>
        </html>
      `

      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      })
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
