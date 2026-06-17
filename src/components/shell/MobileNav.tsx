'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { SidebarNav } from './SidebarNav'

interface MobileNavProps {
  user: {
    name: string
    orgName: string
  }
}

export function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-gray-900 p-0 border-r-0">
        <SheetHeader className="px-4 py-5 border-b border-gray-800">
          <SheetTitle className="text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Organization</p>
            <p className="mt-1 text-sm font-semibold text-white truncate">{user.orgName}</p>
          </SheetTitle>
        </SheetHeader>
        <SidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
