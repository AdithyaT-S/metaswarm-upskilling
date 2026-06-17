import { cn } from '@/lib/utils'

const PRIORITY_COLOR_MAP: Record<string, string> = {
  Low:    'bg-gray-400',
  Medium: 'bg-amber-400',
  High:   'bg-orange-400',
  Urgent: 'bg-red-500',
}

interface PriorityDotProps {
  priority: string
  showLabel?: boolean
  className?: string
}

export function PriorityDot({ priority, showLabel = false, className }: PriorityDotProps) {
  const dotColor = PRIORITY_COLOR_MAP[priority] ?? 'bg-gray-400'
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('h-2 w-2 rounded-full flex-shrink-0', dotColor)} />
      {showLabel && <span className="text-sm text-gray-700">{priority}</span>}
    </span>
  )
}
