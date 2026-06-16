# Implementation Plan — 009 Activities

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| Provider isolation | PASS | All DB in src/lib/db/ |
| Multi-tenancy | PASS | queryForOrg() in all actions; RLS on activities |
| Zod everywhere | PASS | Create/Update/Search schemas; FormData parsed via Zod |
| No `any` | PASS | Raw rows typed at boundary |
| UI from Stitch | PASS | Sales Dashboard screen used for global feed layout |
| Auth guard | PASS | getAuthUser() first in all actions |
| Delete auth | PASS | owner OR admin enforced in action layer |
| Task toggle | PASS | type='task' validated before toggle |

---

## Source Code Structure

```
src/app/actions/activities.ts
src/app/(dashboard)/activities/
  page.tsx                        # RSC: global activity feed
  loading.tsx
  error.tsx
  new/page.tsx                    # Create activity form
  [id]/edit/page.tsx              # Edit activity form
  _components/
    ActivityList.tsx              # Table/list view
    ActivityTypeIcon.tsx          # Icon per type (lucide icons)
    ActivityFilters.tsx           # Type, owner, date, entity filters
    ActivityForm.tsx              # Shared create/edit form
    TaskList.tsx                  # Grouped task view (overdue/today/upcoming)
    TaskToggle.tsx                # Completion toggle button
src/components/shared/ActivityTimeline.tsx  # Already in 005; extended here for deal/ticket
src/app/actions/__tests__/activities.test.ts
e2e/activities/
```

---

## Implementation Phases

### Phase 1: DB + Server Actions
- SQL migration: ensure activities table has all required columns + indexes
- Implement all 7 server actions
- Unit tests (including delete auth + task toggle)

### Phase 2: Global Activity Feed
- RSC with multi-filter URL params
- `ActivityList`: table columns (type icon, body excerpt, linked entity, owner, date, actions)
- `ActivityTypeIcon`: lucide icon per type (Phone, Mail, FileText, CheckSquare, Users)
- `ActivityFilters`: type chips, owner select, date range picker, entity search

### Phase 3: Create / Edit Forms
- `ActivityForm`: type select (immutable on edit), body textarea, entity link pickers (contact Combobox, deal select, ticket select), owner picker, due_at datetime (conditional on type='task')
- `activities/new/page.tsx` — supports `?contactId=X` pre-fill from contact detail pages
- `activities/[id]/edit/page.tsx`

### Phase 4: Task List View
- `TaskList.tsx`: groups tasks by overdue/today/upcoming/no-date
- `TaskToggle.tsx`: checkbox client component calling `toggleTaskCompletion`
- Accessible via `/activities?type=task` filter (same RSC) OR a dedicated tab at top of activities page

### Phase 5: E2E Tests

---

## Key Implementation Notes

- `ActivityForm` uses a hidden `type` input on edit (immutable). The type select is only editable on create.
- `ActivityFilters` should use Combobox for contact/deal/ticket entity pickers, not full list dropdowns.
- Task grouping: in `TaskList`, sort fetched tasks by due_at ASC, then group in component:
  - Overdue: `due_at < now() AND done_at IS NULL`
  - Today: `due_at::date = today AND done_at IS NULL`
  - Upcoming: `due_at > today AND done_at IS NULL`
  - Completed: `done_at IS NOT NULL`
- `ActivityTimeline` (from 005-contacts) is extended to accept `dealId` or `ticketId` as filter — the same component works for all three entity detail pages.
- `/activities/new?contactId=X` pre-fills the contact link picker using `useSearchParams`.
