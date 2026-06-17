import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AcceptInviteForm } from '@/app/(auth)/invite/[token]/AcceptInviteForm'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockAcceptInvite = vi.fn()
vi.mock('@/lib/actions/auth', () => ({
  signUp: vi.fn(),
  acceptInvite: (...args: unknown[]) => mockAcceptInvite(...args),
}))

describe('AcceptInviteForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders full_name and password fields', () => {
    render(<AcceptInviteForm token="test-token-123" />)
    expect(screen.getByLabelText(/full name/i)).toBeDefined()
    expect(screen.getByLabelText(/password/i)).toBeDefined()
  })

  it('renders submit button', () => {
    render(<AcceptInviteForm token="test-token-123" />)
    expect(screen.getByRole('button', { name: /accept invitation/i })).toBeDefined()
  })

  it('calls acceptInvite with token and form data', async () => {
    mockAcceptInvite.mockResolvedValue({ success: true })
    render(<AcceptInviteForm token="abc-token-xyz" />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Bob Jones' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'securepass123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /accept invitation/i }))

    await waitFor(() => {
      expect(mockAcceptInvite).toHaveBeenCalledWith({
        token: 'abc-token-xyz',
        full_name: 'Bob Jones',
        password: 'securepass123',
      })
    })
  })

  it('redirects to /login on success', async () => {
    mockAcceptInvite.mockResolvedValue({ success: true })
    render(<AcceptInviteForm token="abc-token-xyz" />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Bob Jones' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'securepass123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /accept invitation/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('shows error when acceptInvite returns error string', async () => {
    mockAcceptInvite.mockResolvedValue({ error: 'Invitation not found or already used' })
    render(<AcceptInviteForm token="bad-token" />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Bob Jones' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'securepass123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /accept invitation/i }))

    await waitFor(() => {
      expect(screen.getByText(/invitation not found or already used/i)).toBeDefined()
    })
  })
})
