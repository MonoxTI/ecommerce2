// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter for direct connection
const adapter = new PrismaPg(pool);

// Instantiate PrismaClient with adapter
const prismaInstance = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// ✅ Export as BOTH 'prisma' and 'db' for compatibility
export const prisma = prismaInstance;
export const db = prismaInstance; // 👈 Alias for auth code

// Hot-reload fix for development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaInstance;
}