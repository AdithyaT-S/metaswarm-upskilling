import type { DBProviderImpl } from '../types'

export const neonProvider: DBProviderImpl = {
  async query() {
    throw new Error('neon provider not configured')
  },
  async transaction() {
    throw new Error('neon provider not configured')
  },
}
