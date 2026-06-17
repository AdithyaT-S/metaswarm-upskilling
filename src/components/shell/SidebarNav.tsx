'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Handshake,
  Ticket,
  BarChart3,
  Settings2,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Contacts',  href: '/contacts',  icon: Users },
  { label: 'Leads',     href: '/leads',     icon: UserPlus },
  { label: 'Deals',     href: '/deals',     icon: Handshake },
  { label: 'Tickets',   href: '/tickets',   icon: Ticket },
  { label: 'Reports',   href: '/reports',   icon: BarChart3 },
  { label: 'Settings',  href: '/settings',  icon: Settings2 },
]

interface SidebarNavProps {
  onNavigate?: () => void
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={
              isActive
                ? 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-gray-800 text-white'
                : 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors'
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
