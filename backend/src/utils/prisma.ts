import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// 1. Inisialisasi Database Connection Pool menggunakan driver 'pg' bawaan Node
const pool = new pg.Pool({
  connectionString: process.env["DATABASE_URL"],
});

// 2. Bungkus pool ke dalam PrismaPg Adapter (Wajib untuk PostgreSQL di Prisma 7)
const adapter = new PrismaPg(pool);

// 3. Masukkan adapter ke dalam constructor PrismaClient
const prisma = new PrismaClient({
  adapter: adapter,
  log: ['query', 'info', 'warn', 'error'],
});

// Fungsi pembantu untuk mematikan koneksi secara bersih
const disconnect = async () => {
  await prisma.$disconnect();
  await pool.end(); // Pastikan pool dari driver 'pg' juga ditutup secara bersih
  console.log('Prisma and PG Pool disconnected cleanly.');
};

// Panggil fungsi disconnect() di dalam setiap penangkap sinyal agar koneksi tidak menggantung di database
process.on('SIGINT', async () => {
  console.log('\nSIGINT received (Ctrl+C). Closing database connection...');
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nSIGTERM received. Shutting down database connection...');
  await disconnect();
  process.exit(0);
});

process.on('unhandledRejection', async (reason) => {
  console.error('Unhandled Rejection detected:', reason);
  await disconnect();
  process.exit(1);
});

export default prisma;