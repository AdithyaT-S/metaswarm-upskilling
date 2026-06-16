# Tasks: Shared Components

**Feature**: 004-shared-components
**Date**: 2026-06-16
**Depends on**: 003-layout-shell (route group); no runtime dependency on auth module for these components

---

## Phase 0: Design Reference + Dependencies

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-0.1 | Fetch Stitch screens: Design System (`asset-stub-assets_0c364825aa6640ddb1dd32c3ab87ab81`) and CRM Contacts List (`c744ca79a3b14fb49ca284b552f1c7f0`) via `stitch-design` skill. Extract color tokens, table row height, column header style, pagination control placement. | No | — |
| T-0.2 | Install shadcn/ui components: `table`, `skeleton`, `form`, `button`, `card`, `alert-dialog`, `input`, `badge`, `popover`, `command`. Run: `npx shadcn-ui@latest add <components>`. | Yes (with T-0.1) | — |
| T-0.3 | Install TanStack Table: `pnpm add @tanstack/react-table`. | Yes (with T-0.1) | — |
| T-0.4 | Write `src/lib/utils/cn.ts` — className merge utility (`clsx` + `tailwind-merge`). | Yes (with T-0.1) | — |
| T-0.5 | Write `src/lib/utils/activity.ts` — `ACTIVITY_TYPE_CONFIG` constant with icon + bg for call/email/note/task/meeting. | No | T-0.1 |
| T-0.6 | Write `src/lib/utils/format.ts` — `formatDateTime`, `formatDate`, `formatRelative` utilities. | Yes (with T-0.5) | — |
| T-0.7 | Write `src/types/crm.ts` — stub `Activity` type and `OrgMember` type. | Yes (with T-0.5) | — |

---

## Phase 1: Display Components (all parallel)

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-1.1 | Write `src/components/shared/EmptyState.tsx` — centered title + description + optional action. Server Component. | Yes | T-0.1 |
| T-1.2 | Write `src/components/shared/PageHeader.tsx` — title + subtitle + actions slot. Server Component. | Yes | T-0.1 |
| T-1.3 | Write `src/components/shared/StatusBadge.tsx` — colored pill, colorMap for all known statuses, gray fallback. | Yes | T-0.1 |
| T-1.4 | Write `src/components/shared/PriorityDot.tsx` — colored dot for Low/Medium/High/Urgent + optional label. | Yes | T-0.1 |
| T-1.5 | Write `src/components/shared/ActivityTimeline.tsx` — vertical timeline with icon per type, skeleton, empty state. Uses `ACTIVITY_TYPE_CONFIG` and `formatDateTime`. | Yes | T-0.5, T-0.6, T-0.7 |

---

## Phase 2: DataTable

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-2.1 | Write `src/components/shared/DataTable.tsx` — TanStack Table v8, `manualPagination`, `manualSorting`, skeleton loading, `EmptyState` fallback, prev/next + page number controls. Client Component. | No | T-0.2, T-0.3, T-1.1 |

---

## Phase 3: CrudForm

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-3.1 | Write `src/components/shared/CrudForm.tsx` — shadcn Form wrapper, accepts `UseFormReturn<T>` prop, card layout, submit + spinner, optional cancel link. Client Component. | No | T-0.2 |

---

## Phase 4: Interactive Components (all parallel after T-1.1)

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-4.1 | Write `src/components/shared/ConfirmDialog.tsx` — shadcn AlertDialog wrapper, `destructive` variant, `onConfirm`/`onCancel` callbacks. Client Component. | Yes | T-0.2 |
| T-4.2 | Write `src/components/shared/SearchInput.tsx` — debounced input (useRef + setTimeout), configurable `debounceMs`. Client Component. | Yes | T-0.2 |
| T-4.3 | Write `src/components/shared/OwnerSelect.tsx` — shadcn Popover + Command combobox, receives `users` prop, fires `onChange(userId)`. Client Component. | Yes | T-0.2 |
| T-4.4 | Write `src/components/shared/TagInput.tsx` — controlled `value: string[]` + `onChange`, Enter/comma adds, `×` removes, case-insensitive duplicate check. Client Component. | Yes | T-0.2 |

---

## Phase 5: Unit Tests (parallel — all at once)

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-5.1 | Write `__tests__/DataTable.unit.test.tsx` — data render, loading skeleton, empty state, sort callback, row click, pagination controls. | Yes | T-2.1 |
| T-5.2 | Write `__tests__/CrudForm.unit.test.tsx` — submit fires onSubmit, isPending disables button + shows spinner, cancelHref renders Cancel link. | Yes | T-3.1 |
| T-5.3 | Write `__tests__/ActivityTimeline.unit.test.tsx` — correct icon per type, skeleton state, empty state message. | Yes | T-1.5 |
| T-5.4 | Write `__tests__/StatusBadge.unit.test.tsx` — each known status has correct color class; unknown status → gray. | Yes | T-1.3 |
| T-5.5 | Write `__tests__/PriorityDot.unit.test.tsx` — all 4 priorities render correct color; showLabel renders text. | Yes | T-1.4 |
| T-5.6 | Write `__tests__/EmptyState.unit.test.tsx` — title always rendered; description optional; action optional. | Yes | T-1.1 |
| T-5.7 | Write `__tests__/ConfirmDialog.unit.test.tsx` — opens, confirm fires callback, cancel closes, destructive variant has red button. | Yes | T-4.1 |
| T-5.8 | Write `__tests__/SearchInput.unit.test.tsx` — onChange not called immediately; called after debounce (fake timers). | Yes | T-4.2 |
| T-5.9 | Write `__tests__/PageHeader.unit.test.tsx` — title rendered; subtitle optional; actions slot rendered. | Yes | T-1.2 |
| T-5.10 | Write `__tests__/OwnerSelect.unit.test.tsx` — users listed, filter works, onChange fires with userId. | Yes | T-4.3 |
| T-5.11 | Write `__tests__/TagInput.unit.test.tsx` — add tag on Enter, remove on ×, duplicate ignored (case-insensitive). | Yes | T-4.4 |

---

## Phase 6: Barrel Export

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-6.1 | Write `src/components/shared/index.ts` — re-export all 11 components. | No | T-1.1–T-1.5, T-2.1, T-3.1, T-4.1–T-4.4 |

---

## Swarm Agent Assignment

| Agent | Tasks |
|---|---|
| architect | T-0.1 (Stitch fetch + design token extraction), T-0.7 (type definitions) |
| coder | T-0.2–T-0.6, T-1.1–T-1.5, T-2.1, T-3.1, T-4.1–T-4.4, T-6.1 |
| test-automator | T-5.1–T-5.11 (all parallel) |
| code-review | Final review: check all imports use `@/components/shared`, no duplication, all props typed |
