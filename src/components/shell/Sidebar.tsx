import { SidebarNav } from './SidebarNav'

interface SidebarProps {
  user: {
    name: string
    orgName: string
  }
}

export function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-64 bg-gray-900 flex-col shrink-0">
      <div className="px-4 py-5 border-b border-gray-800">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Organization</p>
        <p className="mt-1 text-sm font-semibold text-white truncate">{user.orgName}</p>
      </div>

      <SidebarNav />

      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 truncate">{user.name}</p>
      </div>
    </aside>
  )
}
