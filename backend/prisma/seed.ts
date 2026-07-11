import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  console.log('🌱 Memulai proses seeding database...');

  // 1. Membuat atau Memperbarui data Role [cite: 2]
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'ADMIN' }, // Berelasi dengan RoleId 1 [cite: 2]
  });

  const userRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'USER' }, // Berelasi dengan RoleId 2 [cite: 2]
  });

  // Melakukan hashing password menggunakan bcryptjs
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // 2. Membuat atau Memperbarui data User 
  // Ditambahkan field 'name' sesuai dengan kebutuhan schema.prisma Anda 
  await prisma.user.upsert({
    where: { email: 'admin@mail.com' }, // Unik berdasarkan email 
    update: {},
    create: {
      email: 'admin@mail.com',
      password: adminPassword,
      name: 'Administrator Utama', // <--- Ditambahkan agar sesuai skema 
      roleId: adminRole.id, // Menyambungkan relasi FK ke Role [cite: 4]
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@mail.com' }, // Unik berdasarkan email 
    update: {},
    create: {
      email: 'user@mail.com',
      password: userPassword,
      name: 'Regular User', // <--- Ditambahkan agar sesuai skema 
      roleId: userRole.id, // Menyambungkan relasi FK ke Role [cite: 4]
    },
  });

  console.log('✅ Database seeding berhasil diselesaikan!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
