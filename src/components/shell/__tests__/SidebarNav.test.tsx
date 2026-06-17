import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarNav } from '../SidebarNav'

const mockUsePathname = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, onClick, className }: {
    href: string
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}))

describe('<SidebarNav>', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/dashboard')
  })

  it('renders all 7 nav items', () => {
    render(<SidebarNav />)
    expect(screen.getByText('Dashboard')).toBeDefined()
    expect(screen.getByText('Contacts')).toBeDefined()
    expect(screen.getByText('Leads')).toBeDefined()
    expect(screen.getByText('Deals')).toBeDefined()
    expect(screen.getByText('Tickets')).toBeDefined()
    expect(screen.getByText('Reports')).toBeDefined()
    expect(screen.getByText('Settings')).toBeDefined()
  })

  it('active item gets active class when pathname matches', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<SidebarNav />)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboardLink.className).toContain('bg-gray-800')
    expect(dashboardLink.className).toContain('text-white')
  })

  it('non-active items do not get active class', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<SidebarNav />)
    const contactsLink = screen.getByRole('link', { name: /contacts/i })
    expect(contactsLink.className).toContain('text-gray-400')
    expect(contactsLink.className).not.toContain('bg-gray-800 text-white')
  })

  it('/dashboard route makes Dashboard active but not Contacts', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<SidebarNav />)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    const contactsLink = screen.getByRole('link', { name: /contacts/i })
    expect(dashboardLink.className).toContain('bg-gray-800')
    expect(contactsLink.className).not.toContain('bg-gray-800 text-white')
  })

  it('/contacts route makes Contacts active but not Dashboard', () => {
    mockUsePathname.mockReturnValue('/contacts')
    render(<SidebarNav />)
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
    const contactsLink = screen.getByRole('link', { name: /contacts/i })
    expect(contactsLink.className).toContain('bg-gray-800')
    expect(dashboardLink.className).not.toContain('bg-gray-800 text-white')
  })

  it('calls onNavigate callback when a nav item is clicked', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    const onNavigate = vi.fn()
    render(<SidebarNav onNavigate={onNavigate} />)
    fireEvent.click(screen.getByRole('link', { name: /contacts/i }))
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('onNavigate is optional — no error when not provided', () => {
    mockUsePathname.mockReturnValue('/dashboard')
    render(<SidebarNav />)
    expect(() => {
      fireEvent.click(screen.getByRole('link', { name: /contacts/i }))
    }).not.toThrow()
  })
})
