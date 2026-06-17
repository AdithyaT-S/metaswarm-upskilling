'use client'

import Image from 'next/image'

interface UserAvatarProps {
  name: string
  image?: string
  size?: 'sm' | 'md'
}

const SIZE_MAP = {
  sm: { px: 28, className: 'h-7 w-7 text-xs' },
  md: { px: 36, className: 'h-9 w-9 text-sm' },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function UserAvatar({ name, image, size = 'md' }: UserAvatarProps) {
  const { px, className } = SIZE_MAP[size]

  if (image) {
    return (
      <div className={`${className} rounded-full overflow-hidden shrink-0`}>
        <Image
          src={image}
          alt={name}
          width={px}
          height={px}
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={`${className} rounded-full bg-indigo-600 text-white flex items-center justify-center font-medium shrink-0`}
    >
      {getInitials(name)}
    </div>
  )
}
