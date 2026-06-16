# 007 — Deals Module

## User Stories

**US-1**: As a sales rep, I can view my deals in a Kanban board grouped by pipeline stage so I can see the state of my pipeline at a glance.

**Acceptance**: Kanban renders one column per stage in the selected pipeline. Deal cards show name, value, contact, and close date.

**US-2**: As a sales rep, I can drag a deal card to a different stage column and have the stage update immediately.

**Acceptance**: Dropping a card on a stage column calls `moveDealStage`. Target stage must belong to the same pipeline. Card stays in the new column after drop.

**US-3**: As a sales rep, I can create a deal, specifying pipeline, stage, value, contact, and close date.

**Acceptance**: Deal form enforces the 100 open-deal free plan limit. Required: name, pipeline_id, stage_id.

**US-4**: As a sales rep, I can close a deal as Won or Lost from the deal slide-over panel.

**Acceptance**: "Close Deal" action requires status (won/lost) and optional lost_reason. Closed deals are removed from Kanban (status != 'open').

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | Kanban board: columns = stages of selected pipeline, sorted by position |
| FR-02 | Deal cards in each column sorted by updated_at DESC |
| FR-03 | Pipeline selector dropdown at top; default pipeline loaded on mount |
| FR-04 | Drag-and-drop via @dnd-kit/core; drop triggers moveDealStage |
| FR-05 | Deal detail opens as a slide-over panel (Sheet from shadcn/ui), not a new page |
| FR-06 | Create deal: enforce 100 open-deal free plan limit |
| FR-07 | Create deal from lead conversion: pre-fill contactId and source from URL params |
| FR-08 | Edit deal: update name, value, currency, close_date, contact, owner |
| FR-09 | moveDealStage: validates target stage belongs to same pipeline |
| FR-10 | closeDeal: status 'won' or 'lost'; lost_reason optional but recommended |
| FR-11 | Closed deals (won/lost) excluded from Kanban by default; viewable in a list/filter |
| FR-12 | deleteDeal: admin only |
| FR-13 | Deal slide-over shows linked contact name, email; deal value formatted as currency |
| FR-14 | Pipelines (create/edit) are managed in Settings module (012); deals module reads them |
| FR-15 | getContactOptions() + getOrgMembers() used for contact/owner pickers |

---

## Key Entities

- `deals` — primary table
- `pipelines` + `pipeline_stages` — read-only in this module
- `contacts` — contact picker
- `users` — owner picker

---

## Success Criteria

1. Kanban loads all stages and deals in a single server call.
2. Drag-and-drop completes stage move within 500 ms (optimistic update on client).
3. Free plan blocks creation at 101st open deal.
4. Won/lost deals do not appear in the Kanban by default.
5. Deal creation from lead conversion page has contact and source pre-filled.

---

## Assumptions

- Only one pipeline is viewed at a time on the Kanban; multi-pipeline view is not in v1.
- Currency is stored as a string (e.g., "USD"); no FX conversion in v1.
- Deal value is displayed as `Intl.NumberFormat` formatted number.
- Kanban is the primary view; a list view is optional and not required in v1.
- Pipelines must be created in Settings before deals can be created.
