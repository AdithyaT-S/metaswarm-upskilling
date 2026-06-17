import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AuthLayout from '@/app/(auth)/layout'

describe('AuthLayout', () => {
  it('renders children inside centered wrapper', () => {
    render(<AuthLayout><div>test child</div></AuthLayout>)
    expect(screen.getByText('test child')).toBeDefined()
  })

  it('has min-h-screen and flex centering classes', () => {
    const { container } = render(<AuthLayout><div>child</div></AuthLayout>)
    const outer = container.firstElementChild as HTMLElement
    expect(outer.className).toContain('min-h-screen')
    expect(outer.className).toContain('flex')
    expect(outer.className).toContain('items-center')
    expect(outer.className).toContain('justify-center')
  })
})
