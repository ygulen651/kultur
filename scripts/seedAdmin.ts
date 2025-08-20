import dbConnect from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

async function seed() {
  try {
    await dbConnect();

    const email = 'admin@sendika.com';
    const password = 'admin123';
    const role = 'admin';
    const name = 'Admin';
    const isActive = true;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('✅ Admin zaten var:', existingUser.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashedPassword,
      role,
      name,
      isActive
    });

    console.log('🎉 Admin kullanıcısı başarıyla oluşturuldu -> admin@sendika.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed sırasında hata:', err);
    process.exit(1);
  }
}

seed();
