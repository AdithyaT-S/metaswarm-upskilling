import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardLayout from '@/app/(dashboard)/layout'

describe('DashboardLayout', () => {
  it('renders children', () => {
    render(<DashboardLayout><div>dashboard content</div></DashboardLayout>)
    expect(screen.getByText('dashboard content')).toBeDefined()
  })
})
