# Tasks — 009 Activities

## Phase 1: DB & Server Actions

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| A1-01 | SQL migration: activities table full schema + indexes + RLS (idempotent with 008) | No | — |
| A1-02 | Implement listActivities, getActivity | No | A1-01 |
| A1-03 | Implement createActivity, updateActivity (FormData) | No | A1-01 |
| A1-04 | Implement deleteActivity (auth check), toggleTaskCompletion, getDealOptions | No | A1-01 |
| A1-05 | Unit tests: all 7 actions + auth + toggle logic | Yes | A1-02, A1-03, A1-04 |

## Phase 2: Global Activity Feed

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| A2-01 | `ActivityTypeIcon.tsx`: lucide icon map per type | Yes | — |
| A2-02 | `ActivityFilters.tsx`: type chips, owner, date range, entity pickers | No | A1-02 |
| A2-03 | `ActivityList.tsx`: table with icons, entity links, actions | No | A2-01 |
| A2-04 | `activities/page.tsx` RSC: assemble feed | No | A2-02, A2-03, A1-02 |
| A2-05 | loading.tsx + error.tsx | Yes | — |

## Phase 3: Create / Edit Forms

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| A3-01 | `ActivityForm.tsx`: type select, body, entity pickers, due_at conditional | No | A1-02 |
| A3-02 | `activities/new/page.tsx` (with ?contactId pre-fill) | No | A3-01 |
| A3-03 | `activities/[id]/edit/page.tsx` | No | A3-01 |

## Phase 4: Task List View

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| A4-01 | `TaskToggle.tsx`: completion checkbox, calls toggleTaskCompletion | No | A1-04 |
| A4-02 | `TaskList.tsx`: grouped tasks (overdue/today/upcoming/completed) | No | A4-01 |
| A4-03 | Wire task view into activities page (tab or filter) | No | A4-02, A2-04 |

## Phase 5: Shared ActivityTimeline Extension

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| A5-01 | Update `ActivityTimeline.tsx` to accept dealId/ticketId filter props | No | A1-02 |
| A5-02 | Add ActivityTimeline to deal slide-over (007-deals) | No | A5-01 |
| A5-03 | Verify ActivityTimeline on contact detail still works | Yes | A5-01 |

## Phase 6: E2E Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| A6-01 | `e2e/activities/list.spec.ts` | Yes | A2-04 |
| A6-02 | `e2e/activities/create.spec.ts` | Yes | A3-02 |
| A6-03 | `e2e/activities/tasks.spec.ts` | Yes | A4-03 |
| A6-04 | `e2e/activities/delete.spec.ts` | Yes | A2-04 |

---

## Agent Assignment

| Agent | Tasks |
|-------|-------|
| architect | A1-01 (idempotent migration strategy), A5-01 (timeline prop extension) |
| coder | A1-02 through A5-03 |
| test-automator | A1-05, A6-01 through A6-04 |
| code-review | deleteActivity auth logic, toggleTaskCompletion type guard |
