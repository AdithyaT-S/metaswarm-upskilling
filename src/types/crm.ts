import { type ActivityType } from '@/lib/utils/activity'

export interface Activity {
  id: string
  type: ActivityType
  title: string
  description?: string
  createdAt: Date | string
  userId: string
}

export interface OrgMember {
  id: string
  name: string
  email: string
  avatarUrl?: string
}
