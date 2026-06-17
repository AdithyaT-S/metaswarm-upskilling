import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { CrudForm } from '@/components/shared/CrudForm'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

function TestWrapper({
  onSubmit = vi.fn(),
  isPending = false,
  cancelHref,
}: {
  onSubmit?: (v: { name: string }) => void
  isPending?: boolean
  cancelHref?: string
}) {
  const form = useForm({ defaultValues: { name: '' } })
  return (
    <CrudForm
      form={form}
      onSubmit={onSubmit}
      title="Test Form"
      isPending={isPending}
      cancelHref={cancelHref}
    >
      <input {...form.register('name')} aria-label="name" />
    </CrudForm>
  )
}

describe('CrudForm', () => {
  it('renders title', () => {
    render(<TestWrapper />)
    expect(screen.getByText('Test Form')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<TestWrapper />)
    expect(screen.getByLabelText('name')).toBeInTheDocument()
  })

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn()
    render(<TestWrapper onSubmit={onSubmit} />)
    const form = document.querySelector('form')!
    fireEvent.submit(form)
    // react-hook-form calls onSubmit asynchronously
    await new Promise((r) => setTimeout(r, 0))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('isPending=true: submit button is disabled', () => {
    render(<TestWrapper isPending={true} />)
    const submitBtn = screen.getByRole('button', { name: /save/i })
    expect(submitBtn).toBeDisabled()
  })

  it('isPending=true: Loader2 spinner shown (check for animate-spin class)', () => {
    const { container } = render(<TestWrapper isPending={true} />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('cancelHref provided: Cancel link rendered with correct href', () => {
    render(<TestWrapper cancelHref="/back" />)
    const link = screen.getByRole('link', { name: /cancel/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/back')
  })

  it('cancelHref absent: no Cancel link', () => {
    render(<TestWrapper />)
    expect(screen.queryByRole('link', { name: /cancel/i })).not.toBeInTheDocument()
  })
})
