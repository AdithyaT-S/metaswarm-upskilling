import { Phone, Mail, FileText, CheckSquare, Calendar } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'

export type ActivityType = 'call' | 'email' | 'note' | 'task' | 'meeting'

export interface ActivityTypeConfig {
  icon: LucideIcon
  bg: string
  label: string
}

export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, ActivityTypeConfig> = {
  call: { icon: Phone, bg: 'bg-blue-100 text-blue-600', label: 'Call' },
  email: { icon: Mail, bg: 'bg-purple-100 text-purple-600', label: 'Email' },
  note: { icon: FileText, bg: 'bg-gray-100 text-gray-600', label: 'Note' },
  task: { icon: CheckSquare, bg: 'bg-green-100 text-green-600', label: 'Task' },
  meeting: { icon: Calendar, bg: 'bg-orange-100 text-orange-600', label: 'Meeting' },
}
