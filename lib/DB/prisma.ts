// lib/DB/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }

  const log: ('error' | 'warn')[] =
    process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'];

  // Neon serverless adapter: Vercel / Neon hosts
  if (url.includes('neon.tech') && process.env.DB_DRIVER !== 'pg') {
    const adapter = new PrismaNeon({ connectionString: url });
    return new PrismaClient({ adapter, log });
  }

  // Plain PostgreSQL over TCP: cPanel / local dev
  const adapter = new PrismaPg({
    connectionString: url,
    max: Number(process.env.DB_POOL_MAX ?? 5),
  });
  return new PrismaClient({ adapter, log });
}

export const db = global.prisma ?? createPrismaClient();
export const prisma = db;

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db;
}