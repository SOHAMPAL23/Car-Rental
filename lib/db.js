import { neon } from '@neondatabase/serverless'

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING
export const hasDatabase = Boolean(databaseUrl)
const client = databaseUrl ? neon(databaseUrl) : null

export const sql = (...args) => {
  if (!client) {
    throw new Error(
      'Database connection is not configured. Set DATABASE_URL or POSTGRES_URL in .env.local.'
    )
  }

  return client(...args)
}
