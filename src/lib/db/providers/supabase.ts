import type { DBProviderImpl } from '../types'

export const supabaseProvider: DBProviderImpl = {
  async query() {
    throw new Error('supabase provider not configured')
  },
  async transaction() {
    throw new Error('supabase provider not configured')
  },
}
