import { cn } from '@/lib/utils'

const STATUS_COLOR_MAP: Record<string, string> = {
  // Lead statuses
  'New Lead':      'bg-blue-100 text-blue-700',
  'Contacted':     'bg-indigo-100 text-indigo-700',
  'Qualified':     'bg-green-100 text-green-700',
  'Unqualified':   'bg-red-100 text-red-700',
  // Deal statuses
  'New Deal':      'bg-sky-100 text-sky-700',
  'In Progress':   'bg-amber-100 text-amber-700',
  'Won':           'bg-emerald-100 text-emerald-700',
  'Lost':          'bg-rose-100 text-rose-700',
  'Closed Won':    'bg-green-100 text-green-700',
  'Closed Lost':   'bg-gray-200 text-gray-600',
  // Ticket statuses
  'Open Ticket':       'bg-blue-100 text-blue-700',
  'In Progress Ticket': 'bg-amber-100 text-amber-700',
  'Resolved':          'bg-teal-100 text-teal-700',
  'Closed':            'bg-gray-200 text-gray-600',
}

const FALLBACK = 'bg-gray-100 text-gray-600'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = STATUS_COLOR_MAP[status] ?? FALLBACK
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        colors,
        className,
      )}
    >
      {status}
    </span>
  )
}
