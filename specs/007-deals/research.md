# Research — 007 Deals

## Decision Log

### D-1: Kanban Drag-and-Drop Library

**Decision**: Use `@dnd-kit/core` with `@dnd-kit/sortable`.

**Rationale**: Actively maintained, accessibility-first, tree-shakable. Works well with Next.js App Router (no document-level side effects during SSR).

**Alternatives**: `react-beautiful-dnd` — archived, unmaintained. `react-dnd` — heavier, older API.

---

### D-2: Optimistic Updates for Drag-and-Drop

**Decision**: On card drop, immediately move the card to the new column in local state (via `useState`), then call `moveDealStage`. On error, revert to original position and show a toast.

**Rationale**: Instant visual feedback is essential for drag-and-drop. Server round-trip latency would make DnD feel broken.

**Alternatives**: Wait for server response before updating UI — rejected; unacceptable UX.

---

### D-3: Deal Detail as Slide-Over (Sheet)

**Decision**: Deal detail opens in a shadcn/ui `Sheet` (slide-over panel) triggered from the Kanban card click. No `/deals/[id]` page route.

**Rationale**: Matches Stitch screen design. Keeps context of the Kanban board visible while viewing deal details. Avoids navigation away from the board.

**Alternatives**: Separate page route — simpler routing but poorer UX for a Kanban-focused workflow.

---

### D-4: Stage Validation on Move

**Decision**: `moveDealStage` server action validates that the target `stage_id` belongs to the deal's pipeline by querying `pipeline_stages WHERE id = $stage_id AND pipeline_id = $deal.pipeline_id`.

**Rationale**: Prevents cross-pipeline stage assignment that would corrupt the Kanban state. Must be enforced server-side.

**Alternatives**: UI-only constraint — insufficient; Server Actions can be called directly.

---

### D-5: Closed Deals Visibility

**Decision**: Kanban filters `status = 'open'` by default. Closed deals can be viewed in a separate "Closed Deals" tab or by adding a filter toggle.

**Rationale**: Closed deals pollute the Kanban and create noise. Reps want to focus on active deals.

**Alternatives**: Show all deals with visual distinction — makes Kanban unwieldy for active orgs.

---

### D-6: ensureDefaultPipeline on First Visit

**Decision**: The Kanban page RSC calls `ensureDefaultPipeline()` from `pipelines.ts` before loading deals. This creates a default pipeline if none exists.

**Rationale**: New orgs would see an empty/broken Kanban without a default pipeline. `ensureDefaultPipeline` is idempotent.
