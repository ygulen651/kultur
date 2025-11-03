/**
 * Admin kullanıcısını sıfırlama script'i
 * - E-posta/şifreyi ENV'den (ADMIN_EMAIL, ADMIN_PASSWORD) veya CLI argümanlarından alır
 *   Ör: node reset-admin.js --email=admin@example.com --password=YeniSifre123!
 * - Varsa admin kullanıcıyı günceller, yoksa oluşturur (upsert)
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// .env.local varsa onu yükle, yoksa .env (prod ortamında da çalışsın)
const envLocal = path.join(process.cwd(), '.env.local')
dotenv.config({ path: fs.existsSync(envLocal) ? envLocal : path.join(process.cwd(), '.env') })

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI bulunamadı. .env(.local) dosyanızı kontrol edin.')
  process.exit(1)
}

// Basit kullanıcı şeması (mevcut koleksiyonla uyumlu)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Sistem Yöneticisi' },
  role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date
}, { timestamps: true, collection: 'adminusers' })

const User = mongoose.models.User || mongoose.model('User', UserSchema)

function parseArg(name, fallback) {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`))
  return arg ? arg.split('=')[1] : fallback
}

async function resetAdmin() {
  try {
    const email = parseArg('email', process.env.ADMIN_EMAIL || 'admin@sendika.com')
    const plainPassword = parseArg('password', process.env.ADMIN_PASSWORD || 'admin123')

    console.log('🔄 Admin kullanıcısını sıfırlıyor...')
    await mongoose.connect(MONGODB_URI, { bufferCommands: false })
    console.log('✅ MongoDB bağlantısı başarılı!')

    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(plainPassword, salt)

    // Upsert: varsa güncelle, yoksa oluştur
    const result = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          password: hashedPassword,
          name: 'Sistem Yöneticisi',
          role: 'admin',
          isActive: true,
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    console.log('✅ Admin kullanıcı hazır!')
    console.log('📧 E-posta:', email)
    console.log('🔑 Yeni Şifre:', plainPassword)
    if (result?.createdAt && result?.updatedAt && result.createdAt.getTime() === result.updatedAt.getTime()) {
      console.log('🆕 Kullanıcı oluşturuldu.')
    } else {
      console.log('♻️  Mevcut kullanıcı güncellendi.')
    }
  } catch (error) {
    console.error('❌ Hata:', error)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
    console.log('📡 MongoDB bağlantısı kapatıldı')
    process.exit()
  }
}

resetAdmin()


