# Requirements Checklist — 007 Deals

## Quality Gates

- [x] Every Server Action calls `getAuthUser()` first
- [x] All inputs validated with Zod before DB write
- [x] All DB queries through `queryForOrg()`
- [x] No DB imports outside `src/lib/db/`
- [x] No TypeScript `any` except raw DB boundaries
- [x] RLS on `deals` table
- [x] moveDealStage validates stage belongs to same pipeline (DB check, not UI-only)
- [x] Free plan: 100 open deals checked in createDeal
- [x] deleteDeal: admin only
- [x] closeDeal: status constrained to 'won' | 'lost'
- [x] Kanban uses @dnd-kit/core for drag-and-drop
- [x] Deal detail as slide-over (Sheet) — no separate detail page route
- [x] Pipeline pre-check: at least one pipeline exists before showing deal form
- [x] Vitest unit tests for all actions
- [x] Playwright E2E for Kanban drag, create, close flows

## Scope Boundaries

- Pipeline and stage CRUD is in module 012-settings; deals module is read-only on pipelines.
- Multi-pipeline Kanban view is not in v1.
- List view of deals (non-Kanban) is optional, not required.
- Currency conversion is not in v1.
