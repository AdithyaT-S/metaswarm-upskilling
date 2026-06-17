import { Skeleton } from '@/components/ui/skeleton'
import { ACTIVITY_TYPE_CONFIG } from '@/lib/utils/activity'
import { formatDateTime } from '@/lib/utils/format'
import { type Activity } from '@/types/crm'

interface ActivityTimelineProps {
  activities: Activity[]
  isLoading?: boolean
}

export function ActivityTimeline({ activities, isLoading = false }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return <p className="text-sm text-gray-500">No activity yet.</p>
  }

  return (
    <ol className="space-y-4">
      {activities.map((activity) => {
        const config = ACTIVITY_TYPE_CONFIG[activity.type]
        const Icon = config.icon
        return (
          <li key={activity.id} className="flex items-start gap-3">
            <span
              className={`inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${config.bg}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              {activity.description && (
                <p className="mt-0.5 text-sm text-gray-500">{activity.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">{formatDateTime(activity.createdAt)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
