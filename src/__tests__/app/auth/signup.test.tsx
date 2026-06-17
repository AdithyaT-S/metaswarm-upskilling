import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SignupForm } from '@/app/(auth)/signup/SignupForm'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockSignUp = vi.fn()
vi.mock('@/lib/actions/auth', () => ({
  signUp: (...args: unknown[]) => mockSignUp(...args),
  acceptInvite: vi.fn(),
}))

describe('SignupForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all required fields', () => {
    render(<SignupForm />)
    expect(screen.getByLabelText(/full name/i)).toBeDefined()
    expect(screen.getByLabelText(/organisation name/i)).toBeDefined()
    expect(screen.getByLabelText(/email/i)).toBeDefined()
    expect(screen.getByLabelText(/password/i)).toBeDefined()
  })

  it('renders submit button', () => {
    render(<SignupForm />)
    expect(screen.getByRole('button', { name: /create account/i })).toBeDefined()
  })

  it('calls signUp with form data on submit', async () => {
    mockSignUp.mockResolvedValue({ success: true })
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Alice Smith' },
    })
    fireEvent.change(screen.getByLabelText(/organisation name/i), {
      target: { value: 'Acme Corp' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@acme.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        full_name: 'Alice Smith',
        org_name: 'Acme Corp',
        email: 'alice@acme.com',
        password: 'password123',
      })
    })
  })

  it('redirects to /login on success', async () => {
    mockSignUp.mockResolvedValue({ success: true })
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Alice Smith' },
    })
    fireEvent.change(screen.getByLabelText(/organisation name/i), {
      target: { value: 'Acme Corp' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@acme.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login')
    })
  })

  it('shows error message when signUp returns error', async () => {
    mockSignUp.mockResolvedValue({ error: { email: ['Email already exists'] } })
    render(<SignupForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Alice Smith' },
    })
    fireEvent.change(screen.getByLabelText(/organisation name/i), {
      target: { value: 'Acme Corp' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'alice@acme.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeDefined()
    })
  })
})
