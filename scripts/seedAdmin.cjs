/**
 * scripts/seedAdmin.cjs
 * Bağımsız seed scripti — .env(.local)’den MongoDB URI alır, admin kullanıcı ekler
 */

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// .env.local varsa onu, yoksa .env dosyasını yükle
const envLocal = path.join(process.cwd(), ".env.local");
const envFile = fs.existsSync(envLocal) ? envLocal : path.join(process.cwd(), ".env");
dotenv.config({ path: envFile });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI bulunamadı, .env dosyasını kontrol et!");
  process.exit(1);
}

// Basit User şeması (uygun şekilde düzenle!)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
}, { collection: "users", timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  try {
    console.log("ℹ️ MongoDB’ye bağlanılıyor...");
    await mongoose.connect(MONGODB_URI);

    const email = "admin@sendika.com";
    const plainPassword = "admin123";

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      console.log(`✅ Admin zaten mevcut: ${email}`);
      await mongoose.disconnect();
      return;
    }

    const hash = await bcrypt.hash(plainPassword, 10);
    await User.create({ email, password: hash, role: "admin" });

    console.log("🎉 Admin eklendi:");
    console.log("   E-posta:", email);
    console.log("   Şifre :", plainPassword);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seed hatası:", err.message);
    process.exit(1);
  }
}

main();
