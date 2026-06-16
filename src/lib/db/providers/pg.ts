import type { DBProviderImpl } from '../types'

export const pgProvider: DBProviderImpl = {
  async query() {
    throw new Error('pg provider not configured')
  },
  async transaction() {
    throw new Error('pg provider not configured')
  },
}
