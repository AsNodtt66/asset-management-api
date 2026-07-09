import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: ['query', 'info', 'warn', 'error'],
});

// Handle graceful shutdown
const disconnect = async () => {
  await prisma.$disconnect();
  console.log('Prisma disconnected');
};

// Disconnect on process termination
process.on('SIGINT', async () => {
  console.log('\nSIGINT received');
  await disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nSIGTERM received');
  await disconnect();
  process.exit(0);
});

// Disconnect on unhandled rejection
process.on('unhandledRejection', async (reason) => {
  console.error('Unhandled Rejection:', reason);
  await disconnect();
  process.exit(1);
});

export default prisma;