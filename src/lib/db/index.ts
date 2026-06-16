/**
 * src/lib/db/index.ts
 *
 * THE ONLY FILE your app imports for database access.
 *
 * import { db } from '@/lib/db'
 *
 * Switch providers by changing DB_PROVIDER in .env.
 * Your server actions never change — only this file and
 * the provider implementations below it change.
 *
 * Supported:
 *   local     → Docker Postgres (pg pool, no SSL)
 *   rds       → AWS RDS Postgres (pg pool, SSL, IAM optional)
 *   supabase  → Supabase cloud (Supabase JS client + service role)
 *   neon      → Neon serverless (neon HTTP driver)
 *   railway   → Railway Postgres (pg pool, SSL)
 */

import type { DBProvider } from './types'

const provider = (process.env.DB_PROVIDER ?? 'local') as DBProvider

async function loadProvider() {
  switch (provider) {
    case 'local':
    case 'rds':
    case 'railway':
      return (await import('./providers/pg')).pgProvider
    case 'supabase':
      return (await import('./providers/supabase')).supabaseProvider
    case 'neon':
      return (await import('./providers/neon')).neonProvider
    default:
      throw new Error(`Unknown DB_PROVIDER: "${provider}". Valid: local|rds|supabase|neon|railway`)
  }
}

let _provider: Awaited<ReturnType<typeof loadProvider>> | null = null

async function getDB() {
  if (!_provider) _provider = await loadProvider()
  return _provider
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
  context?: { orgId: string; userId: string }
): Promise<T[]> {
  const db = await getDB()
  return db.query<T>(sql, params, context)
}

export async function transaction<T>(
  fn: (q: typeof query) => Promise<T>,
  context?: { orgId: string; userId: string }
): Promise<T> {
  const db = await getDB()
  return db.transaction(fn, context)
}

export async function queryForOrg<T = Record<string, unknown>>(
  orgId: string,
  userId: string,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  return query<T>(sql, params, { orgId, userId })
}

export { provider }
export type { DBProvider }
