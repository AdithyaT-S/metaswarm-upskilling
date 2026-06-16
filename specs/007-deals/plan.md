# Implementation Plan — 007 Deals

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| Provider isolation | PASS | All DB in src/lib/db/ |
| Multi-tenancy | PASS | queryForOrg() in all actions; RLS on deals, pipelines |
| Zod everywhere | PASS | Create/Update/Move/Close schemas |
| No `any` | PASS | Raw rows typed at boundary |
| UI from Stitch | PASS | Stitch screen `49d332b5` fetched before design |
| Auth guard | PASS | getAuthUser() first in all actions |
| Admin check | PASS | deleteDeal guards user.role |
| Free plan | PASS | 100 open deals checked in createDeal |

---

## Source Code Structure

```
src/app/actions/deals.ts
src/app/(dashboard)/deals/
  page.tsx                       # RSC: Kanban container
  loading.tsx
  error.tsx
  new/page.tsx                   # Create deal form (also handles ?contactId pre-fill)
  _components/
    KanbanBoard.tsx              # Client component: @dnd-kit/core DndContext
    KanbanColumn.tsx             # Droppable column per stage
    DealCard.tsx                 # Draggable deal card
    DealSlideOver.tsx            # shadcn Sheet with deal details
    DealForm.tsx                 # Shared create/edit form
    PipelineSelector.tsx         # Pipeline dropdown at top
    CloseDealDialog.tsx          # Won/Lost dialog with lost_reason
src/app/actions/__tests__/deals.test.ts
e2e/deals/
```

---

## Implementation Phases

### Phase 1: DB + Server Actions
- SQL migrations: pipelines, pipeline_stages, deals tables + RLS
- Implement all 7 server actions
- Unit tests

### Phase 2: Kanban Board
- Install `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- `KanbanBoard`: DndContext with onDragEnd → calls moveDealStage + optimistic update
- `KanbanColumn`: SortableContext per stage, renders DealCards
- `DealCard`: useDraggable, displays name/value/contact/close_date
- `PipelineSelector`: dropdown to switch pipeline (updates URL param)

### Phase 3: Deal Slide-Over + Close Dialog
- `DealSlideOver`: Sheet opens on card click, calls getDeal(id), shows full details
- `CloseDealDialog`: Dialog with status radio + lost_reason textarea, calls closeDeal
- `DealSlideOver` includes Edit and Close buttons; Delete if admin

### Phase 4: Create / Edit Forms
- `DealForm`: pipeline select → stage select (filtered by pipeline), contact picker, value, close_date
- `deals/new/page.tsx`: reads searchParams for pre-fill (contactId, source from lead conversion)
- Edit form within slide-over (toggle edit mode)

### Phase 5: E2E Tests

---

## Key Implementation Notes

- `KanbanBoard` is a Client Component that receives initial `stages` + `deals` as props from the RSC. After drag, it updates local state optimistically then fires the server action.
- `PipelineSelector` updates a `?pipeline=<id>` URL param; the RSC reads it to load the correct pipeline.
- `ensureDefaultPipeline()` is called in the RSC before rendering to guarantee at least one pipeline exists.
- `DealSlideOver` uses a URL param `?dealId=<id>` (set by DealCard onClick via router.push) so the sheet survives page refresh and can be linked to directly.
- @dnd-kit requires `<DndContext>` and accessibility announcements — use the default Announcements config.
