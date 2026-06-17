import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TopbarSearch } from '../TopbarSearch'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

describe('<TopbarSearch>', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a search input', () => {
    render(<TopbarSearch />)
    expect(screen.getByRole('searchbox')).toBeDefined()
  })

  it('typing into input updates the displayed value', () => {
    render(<TopbarSearch />)
    const input = screen.getByRole('searchbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'hello world' } })
    expect(input.value).toBe('hello world')
  })

  it('submitting the form with "hello world" calls router.push with encoded URL', () => {
    render(<TopbarSearch />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'hello world' } })
    fireEvent.submit(input.closest('form')!)
    expect(mockPush).toHaveBeenCalledWith('/contacts?search=hello%20world')
  })

  it('submitting with empty string does not call router.push', () => {
    render(<TopbarSearch />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.submit(input.closest('form')!)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('pressing Enter submits the form and navigates', () => {
    render(<TopbarSearch />)
    const input = screen.getByRole('searchbox')
    fireEvent.change(input, { target: { value: 'alice' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
    fireEvent.submit(input.closest('form')!)
    expect(mockPush).toHaveBeenCalledWith('/contacts?search=alice')
  })
})
