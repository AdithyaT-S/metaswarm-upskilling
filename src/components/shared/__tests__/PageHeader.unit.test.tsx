import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PageHeader } from '@/components/shared/PageHeader'

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="My Page" />)
    expect(screen.getByText('My Page')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<PageHeader title="My Page" subtitle="A description" />)
    expect(screen.getByText('A description')).toBeInTheDocument()
  })

  it('does not render subtitle when absent', () => {
    render(<PageHeader title="My Page" />)
    expect(screen.queryByText('A description')).not.toBeInTheDocument()
  })

  it('renders actions slot content when provided', () => {
    render(<PageHeader title="My Page" actions={<button>Create</button>} />)
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument()
  })

  it('does not render actions when absent', () => {
    render(<PageHeader title="My Page" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
