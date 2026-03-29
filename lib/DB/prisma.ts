// lib/DB/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create Neon adapter using the POOLED connection string
// - DATABASE_URL  = pooled (with -pooler in hostname) → used at runtime
// - DIRECT_URL    = direct (no -pooler)               → used for migrations only
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prismaInstance =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Hot-reload fix — prevents multiple PrismaClient instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaInstance;
}

// Export as both 'prisma' and 'db' for compatibility across your codebase
export const prisma = prismaInstance;
export const db = prismaInstance;