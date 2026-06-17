import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import DashboardLayout from '@/app/(dashboard)/layout'

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      id: 'user-1',
      email: 'admin@acme.com',
      name: 'Admin User',
      orgId: 'org-1',
      orgName: 'Acme Corp',
      role: 'admin',
      image: undefined,
    },
  }),
}))

vi.mock('@/lib/auth', () => ({
  authOptions: {},
  getAuthUser: vi.fn(),
}))

vi.mock('@/components/shell/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />,
}))

vi.mock('@/components/shell/Topbar', () => ({
  Topbar: () => <div data-testid="topbar" />,
}))

describe('DashboardLayout', () => {
  it('renders children inside the shell', async () => {
    const jsx = await DashboardLayout({ children: <div>dashboard content</div> })
    render(jsx)
    expect(screen.getByText('dashboard content')).toBeDefined()
    expect(screen.getByTestId('sidebar')).toBeDefined()
    expect(screen.getByTestId('topbar')).toBeDefined()
  })
})
