// lib/prisma.ts
// Prisma 7 + NeonDB — plain PrismaClient, connection handled by prisma.config.ts

import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export const prisma = new PrismaClient({ adapter });
