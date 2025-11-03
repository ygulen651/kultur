const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// MDX dosyalarından duyuruları okuyup JSON'a çeviren script
async function syncAnnouncementsFromMDX() {
  const contentDir = path.join(__dirname, '../content/duyurular');
  const dataFile = path.join(__dirname, '../data/announcements.json');
  
  try {
    // MDX dosyalarını oku
    const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.mdx'));
    const announcements = [];
    
    for (const file of files) {
      const filePath = path.join(contentDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter, content } = matter(fileContent);
      
      // Slug'ı dosya adından oluştur
      const slug = file.replace('.mdx', '');
      
      // Duyuru objesini oluştur
      const announcement = {
        _id: slug,
        title: frontmatter.title || 'Başlık Yok',
        slug: slug,
        content: content,
        excerpt: frontmatter.description || content.slice(0, 150) + '...',
        publishedAt: frontmatter.date ? new Date(frontmatter.date).toISOString() : new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isFeatured: frontmatter.featured || false,
        tags: frontmatter.tags || [],
        coverImage: frontmatter.coverImage || null,
        image: {
          url: frontmatter.coverImage || '',
          publicId: ''
        }
      };
      
      announcements.push(announcement);
    }
    
    // JSON dosyasına yaz
    fs.writeFileSync(dataFile, JSON.stringify(announcements, null, 2), 'utf8');
    
    console.log(`✅ ${announcements.length} duyuru başarıyla senkronize edildi!`);
    console.log('Duyurular:');
    announcements.forEach((ann, i) => {
      console.log(`${i + 1}. ${ann.title} (${ann.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

// Script'i çalıştır
if (require.main === module) {
  syncAnnouncementsFromMDX();
}

module.exports = { syncAnnouncementsFromMDX };
