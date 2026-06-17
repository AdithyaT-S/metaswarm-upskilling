import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/shared/StatusBadge'

describe('StatusBadge', () => {
  it('renders text "New Lead" with a colored class (not gray)', () => {
    render(<StatusBadge status="New Lead" />)
    const el = screen.getByText('New Lead')
    expect(el).toBeInTheDocument()
    expect(el.className).toMatch(/blue/)
  })

  it('renders "Closed Won" with a colored class (not gray)', () => {
    render(<StatusBadge status="Closed Won" />)
    const el = screen.getByText('Closed Won')
    expect(el).toBeInTheDocument()
    expect(el.className).toMatch(/green/)
  })

  it('renders unknown status "Foo Bar" with gray fallback class', () => {
    render(<StatusBadge status="Foo Bar" />)
    const el = screen.getByText('Foo Bar')
    expect(el).toBeInTheDocument()
    expect(el.className).toMatch(/gray/)
  })
})
