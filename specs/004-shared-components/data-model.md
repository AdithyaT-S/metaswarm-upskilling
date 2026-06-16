# Data Model: Shared Components

**Feature**: 004-shared-components
**Date**: 2026-06-16

---

## Database Changes

**None.** Shared components are pure UI — no new tables, columns, or migrations.

---

## TypeScript Types

These types are consumed by shared components and must be defined in `src/types/crm.ts` or imported from the relevant module types. They are not new entities — they will be fleshed out by the modules that own them.

### Activity (consumed by ActivityTimeline)

```ts
// Defined in src/types/crm.ts (stub for 004; full type from module 008)
interface Activity {
  id: string
  type: 'call' | 'email' | 'note' | 'task' | 'meeting'
  title: string
  description?: string
  occurred_at: string  // ISO datetime
  owner_id: string
}
```

### OrgMember (consumed by OwnerSelect)

```ts
// Minimal shape consumed by OwnerSelect; full type from module 002
interface OrgMember {
  id: string
  name: string
}
```

---

## Utility Files In Scope

The following utility files are created as part of this module (not in prior modules):

### `src/lib/utils/activity.ts`

```ts
import { Phone, Mail, FileText, CheckSquare, Calendar, LucideIcon } from 'lucide-react'

interface ActivityTypeConfig {
  Icon: LucideIcon
  bg: string
}

export const ACTIVITY_TYPE_CONFIG: Record<string, ActivityTypeConfig> = {
  call:    { Icon: Phone,       bg: 'bg-blue-50 text-blue-600' },
  email:   { Icon: Mail,        bg: 'bg-purple-50 text-purple-600' },
  note:    { Icon: FileText,    bg: 'bg-gray-50 text-gray-600' },
  task:    { Icon: CheckSquare, bg: 'bg-green-50 text-green-600' },
  meeting: { Icon: Calendar,    bg: 'bg-amber-50 text-amber-600' },
}
```

### `src/lib/utils/format.ts`

```ts
// Date formatting utilities used by ActivityTimeline and other modules
export function formatDateTime(iso: string): string
export function formatDate(iso: string): string
export function formatRelative(iso: string): string  // "2 hours ago"
```

### `src/lib/utils/cn.ts`

```ts
// Already used in reference project — conditional className merge
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]): string
```
