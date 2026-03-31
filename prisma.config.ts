// prisma.config.ts
import { defineConfig } from 'prisma/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
 migrations: {
  path: "prisma/migrations",
  seed: "npx tsx prisma/seed.ts",
},
  datasource: {
    url: process.env.DIRECT_URL!, // direct URL for migrations & seed
  },
});