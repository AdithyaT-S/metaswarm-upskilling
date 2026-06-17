import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OwnerSelect } from '@/components/shared/OwnerSelect'
import { type OrgMember } from '@/types/crm'

// cmdk uses ResizeObserver and scrollIntoView internally — stub them for jsdom
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.HTMLElement.prototype.scrollIntoView = () => {}
})

const users: OrgMember[] = [
  { id: 'u1', name: 'Alice Smith', email: 'alice@example.com' },
  { id: 'u2', name: 'Bob Jones', email: 'bob@example.com' },
]

describe('OwnerSelect', () => {
  it('renders trigger button with placeholder when no value selected', () => {
    render(<OwnerSelect users={users} onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Select owner…')
  })

  it('renders selected user name in trigger when value matches a user id', () => {
    render(<OwnerSelect users={users} value="u1" onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Alice Smith')
  })

  it('clicking an option calls onChange with the user\'s id', () => {
    const onChange = vi.fn()
    render(<OwnerSelect users={users} onChange={onChange} />)
    // Open the popover
    fireEvent.click(screen.getByRole('combobox'))
    // Click on Alice Smith option (rendered in the popover content)
    const option = screen.getByText('Alice Smith')
    fireEvent.click(option)
    expect(onChange).toHaveBeenCalledWith('u1')
  })
})
