// prisma.config.ts
// Prisma 7 — place at project ROOT (same level as package.json)
// Connection URLs live here instead of schema.prisma
// See: https://pris.ly/d/config-datasource

import { defineConfig, env } from 'prisma/config'
import "dotenv/config";


export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: `bun run prisma/seed.ts`,
  },
  datasource: {
    url: env('DATABASE_URL'),
    //directUrl: env('DIRECT_URL'),
  },
})
