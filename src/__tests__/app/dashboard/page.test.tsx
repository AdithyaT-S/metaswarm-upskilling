import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/(dashboard)/page'

describe('DashboardPage', () => {
  it('renders coming soon placeholder', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/dashboard coming soon/i)).toBeDefined()
  })
})
