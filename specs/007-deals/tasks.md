# Tasks — 007 Deals

## Phase 1: DB & Server Actions

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| D1-01 | SQL migration: pipelines, pipeline_stages, deals tables + indexes + RLS | No | — |
| D1-02 | Implement getDealsForPipeline, getDeal | No | D1-01 |
| D1-03 | Implement createDeal (with free plan check + stage validation) | No | D1-01 |
| D1-04 | Implement updateDeal, moveDealStage, closeDeal, deleteDeal | No | D1-01 |
| D1-05 | Unit tests for all actions | Yes | D1-02, D1-03, D1-04 |

## Phase 2: Kanban Board

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| D2-01 | Install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities | No | — |
| D2-02 | `DealCard.tsx`: draggable card with name/value/contact/close_date | No | D2-01 |
| D2-03 | `KanbanColumn.tsx`: droppable column, renders DealCards | No | D2-02 |
| D2-04 | `KanbanBoard.tsx`: DndContext with optimistic onDragEnd + moveDealStage call | No | D2-03, D1-04 |
| D2-05 | `PipelineSelector.tsx`: pipeline dropdown, updates URL param | Yes | D1-02 |
| D2-06 | `deals/page.tsx` RSC: ensureDefaultPipeline + getDealsForPipeline → KanbanBoard | No | D2-04, D2-05 |

## Phase 3: Slide-Over + Close Dialog

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| D3-01 | `CloseDealDialog.tsx`: won/lost radio + lost_reason textarea + closeDeal call | No | D1-04 |
| D3-02 | `DealSlideOver.tsx`: Sheet with deal details, edit toggle, close/delete buttons | No | D3-01, D1-02 |
| D3-03 | Wire DealCard onClick → URL param → DealSlideOver open | No | D3-02, D2-02 |

## Phase 4: Create / Edit Forms

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| D4-01 | `DealForm.tsx`: pipeline→stage cascade select, value, contact, owner, close_date | No | D1-02 |
| D4-02 | `deals/new/page.tsx`: reads ?contactId and ?source from searchParams | No | D4-01 |
| D4-03 | Edit mode in DealSlideOver using DealForm | No | D4-01, D3-02 |

## Phase 5: E2E Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| D5-01 | `e2e/deals/kanban.spec.ts` | Yes | D2-06 |
| D5-02 | `e2e/deals/drag-drop.spec.ts` | Yes | D2-04 |
| D5-03 | `e2e/deals/create-close.spec.ts` | Yes | D4-02, D3-01 |
| D5-04 | `e2e/deals/slideover.spec.ts` | Yes | D3-02 |

---

## Agent Assignment

| Agent | Tasks |
|-------|-------|
| architect | D1-01, D2-04 (DnD architecture), D3-02 (slide-over URL pattern) |
| coder | D1-02 through D4-03 |
| test-automator | D1-05, D5-01 through D5-04 |
| code-review | moveDealStage validation, KanbanBoard optimistic update, RLS on pipeline_stages |
