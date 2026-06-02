import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '~~/prisma/generated/client'

// Singleton Prisma client + pg pool, cached on globalThis so Nuxt HMR doesn't open a
// fresh pool on every save. Prisma 7's prisma-client generator requires an explicit
// driver adapter; @prisma/adapter-pg drives node-postgres.
const globalForPrisma = globalThis as unknown as {
  prisma: InstanceType<typeof PrismaClient> | undefined
  pool: Pool | undefined
}

// Read DATABASE_URL directly (not useRuntimeConfig) — this module initialises before
// Nuxt's runtime config is populated. The Prisma Postgres endpoint does the real
// connection pooling, so keep the per-process pool small: many serverless instances
// each opening a wide pool is what exhausts the database.
const pool = globalForPrisma.pool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })

// On Vercel Fluid Compute, hand the pool to the platform so it can be drained when an
// instance suspends (prevents leaked connections). Guarded by VERCEL and dynamically
// imported, so @vercel/functions is never loaded on Netlify / Fly / local — this stays
// a no-op everywhere else, keeping us free to deploy anywhere.
if (process.env.VERCEL) {
  void import('@vercel/functions')
    .then(({ attachDatabasePool }) => attachDatabasePool(pool))
    .catch(err => console.warn('[db] attachDatabasePool unavailable:', err))
}

const adapter = new PrismaPg(pool)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}
