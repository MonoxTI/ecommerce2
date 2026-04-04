// lib/DB/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  // Neon serverless adapter — used on Vercel / production
  if (process.env.DATABASE_URL?.includes('neon.tech')) {
    const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  // Standard PostgreSQL — local dev
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const db     = global.prisma ?? createPrismaClient();
export const prisma = db;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}