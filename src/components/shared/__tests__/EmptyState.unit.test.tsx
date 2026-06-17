import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/shared/EmptyState'

describe('EmptyState', () => {
  it('renders title text', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('does not render description when not provided', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.queryByText(/description/i)).not.toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState title="Nothing here" description="Try adding some items." />)
    expect(screen.getByText('Try adding some items.')).toBeInTheDocument()
  })

  it('does not render action when not provided', () => {
    render(<EmptyState title="Nothing here" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders action content when provided', () => {
    render(<EmptyState title="Nothing here" action={<button>Add Item</button>} />)
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument()
  })
})
