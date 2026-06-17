import { TopbarSearch } from './TopbarSearch'
import { UserAvatarMenu } from './UserAvatarMenu'
import { MobileNav } from './MobileNav'

interface TopbarProps {
  user: {
    name: string
    orgName: string
    image?: string
  }
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 gap-4 shrink-0">
      <MobileNav user={user} />
      <div className="flex-1">
        <TopbarSearch />
      </div>
      <UserAvatarMenu user={user} />
    </header>
  )
}
