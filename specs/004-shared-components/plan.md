# Implementation Plan: Shared Components

**Feature**: 004-shared-components
**Date**: 2026-06-16
**Depends on**: 003-layout-shell (route group layout + session)
**Blocks**: 004-contacts (uses DataTable, CrudForm, SearchInput, TagInput, PageHeader, ActivityTimeline, OwnerSelect, StatusBadge, ConfirmDialog)

---

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. TypeScript Strict | PASS | All component props typed; generics on DataTable/CrudForm; no `any` |
| II. YAGNI | PASS | 11 components scoped to what modules 004–011 actually need |
| III. Provider Architecture | PASS | No DB calls; pure UI — no sdk imports anywhere |
| IV. Multi-Tenancy | PASS | No queries; org context flows through props from parent pages |
| V. Zod at Every Boundary | PASS | No Server Actions; CrudForm accepts Zod-validated form via react-hook-form |
| VI. Auth Guard First | PASS | No auth logic in shared components; guard is in (dashboard)/layout.tsx |
| VII. Test Gates | PASS | One unit test file per component (11 files); ≥80% coverage gate |
| VIII. Stitch-First UI | PASS | Design System + CRM Contacts List screens fetched before any component |

All 8 principles: **PASS**

---

## Source Code Structure

```
src/
  components/
    shared/
      DataTable.tsx
      CrudForm.tsx
      ActivityTimeline.tsx
      StatusBadge.tsx
      PriorityDot.tsx
      EmptyState.tsx
      ConfirmDialog.tsx
      SearchInput.tsx
      PageHeader.tsx
      OwnerSelect.tsx
      TagInput.tsx
      __tests__/
        DataTable.unit.test.tsx
        CrudForm.unit.test.tsx
        ActivityTimeline.unit.test.tsx
        StatusBadge.unit.test.tsx
        PriorityDot.unit.test.tsx
        EmptyState.unit.test.tsx
        ConfirmDialog.unit.test.tsx
        SearchInput.unit.test.tsx
        PageHeader.unit.test.tsx
        OwnerSelect.unit.test.tsx
        TagInput.unit.test.tsx
  lib/
    utils/
      activity.ts        # ACTIVITY_TYPE_CONFIG constant
      format.ts          # formatDateTime, formatDate, formatRelative
      cn.ts              # className merge utility
  types/
    crm.ts              # Activity stub type (full type from module 008)
```

---

## Phase 0: Design Reference + Dependencies

1. Fetch Stitch screen `asset-stub-assets_0c364825aa6640ddb1dd32c3ab87ab81` (Design System)
2. Fetch Stitch screen `c744ca79a3b14fb49ca284b552f1c7f0` (CRM Contacts List — DataTable in context)
3. Install missing shadcn/ui components:
   ```bash
   npx shadcn-ui@latest add table skeleton form button card alert-dialog input badge popover command
   ```
4. Install TanStack Table:
   ```bash
   pnpm add @tanstack/react-table
   ```
5. Write utility files: `src/lib/utils/activity.ts`, `src/lib/utils/format.ts`, `src/lib/utils/cn.ts`
6. Write `src/types/crm.ts` stub with `Activity` and `OrgMember` types

---

## Phase 1: Data + Display Components (parallel)

These have no dependencies on each other. All can be built in parallel by the swarm.

### EmptyState

```tsx
// Server Component (no state needed)
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
```

### PageHeader

```tsx
// Server Component
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) { ... }
```

### StatusBadge

Color map covers all lead, deal, and ticket status strings. Falls back to `bg-gray-100 text-gray-700`.

### PriorityDot

```tsx
const PRIORITY_COLORS = {
  Low: 'bg-gray-400',
  Medium: 'bg-amber-400',
  High: 'bg-orange-400',
  Urgent: 'bg-red-500',
}
```

### ActivityTimeline

Uses `ACTIVITY_TYPE_CONFIG` from `src/lib/utils/activity.ts`. Renders skeleton when `isLoading`. Renders "No activity yet." when empty.

---

## Phase 2: DataTable

Largest component. Uses TanStack Table v8 with `manualPagination` and `manualSorting` — server handles all data logic.

Key implementation notes:
- `getCoreRowModel()` only — no client-side sort/filter/pagination row models needed
- Pagination controls: always show prev/next + up to 5 page number buttons
- `isLoading` renders 5 skeleton rows matching the column count
- `emptyState` prop falls through to `<EmptyState>` if not provided

---

## Phase 3: CrudForm

Wraps shadcn `Form` with a card, title, children slot, and submit/cancel controls. Accepts `UseFormReturn<T>` — does NOT call `useForm()` internally. The Zod schema and `useForm()` call live in the consuming page.

---

## Phase 4: Interactive Components (parallel after EmptyState)

### ConfirmDialog

shadcn `AlertDialog` wrapper. `destructive` prop switches confirm button from `variant="default"` to `variant="destructive"`.

### SearchInput

`'use client'`. Debounce via `useRef<ReturnType<typeof setTimeout>>`. Input value is local state; the debounced value fires `onChange`.

### OwnerSelect

`'use client'`. shadcn `Popover` + `Command` (combobox pattern). Receives `users` array as prop — no DB call.

### TagInput

`'use client'`. Controlled: `value: string[]` + `onChange`. Enter/comma adds tag. `×` removes. Duplicate check: case-insensitive.

---

## Phase 5: Unit Tests (parallel with Phase 1–4)

One test file per component. Test-automator agent handles all 11 files simultaneously (swarm parallel dispatch).

Coverage targets per component:
- `DataTable`: 3 states (data, loading, empty) × sort × pagination
- `CrudForm`: submit, pending, cancel
- `ActivityTimeline`: 3 states × activity types
- `StatusBadge`: known statuses, fallback
- `PriorityDot`: all 4 priorities
- `EmptyState`: with/without description, with/without action
- `ConfirmDialog`: open, confirm, cancel, destructive variant
- `SearchInput`: debounce timing (fake timers), value propagation
- `PageHeader`: with/without subtitle/actions
- `OwnerSelect`: filter behavior, onChange
- `TagInput`: add, remove, duplicate prevention

---

## Phase 6: Exports

Add barrel export from `src/components/shared/index.ts`:

```ts
export { DataTable } from './DataTable'
export { CrudForm } from './CrudForm'
export { ActivityTimeline } from './ActivityTimeline'
export { StatusBadge } from './StatusBadge'
export { PriorityDot } from './PriorityDot'
export { EmptyState } from './EmptyState'
export { ConfirmDialog } from './ConfirmDialog'
export { SearchInput } from './SearchInput'
export { PageHeader } from './PageHeader'
export { OwnerSelect } from './OwnerSelect'
export { TagInput } from './TagInput'
```

All consuming modules import from `@/components/shared` (not from individual files).
