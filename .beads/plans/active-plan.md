# Active Plan — 004-shared-components
<!-- approved: 2026-06-17 -->
<!-- gate-iterations: 0 -->
<!-- user-approved: true -->
<!-- status: completed -->

## Work Unit Decomposition

| WU | Beads ID | Title | Deps | Files |
|----|----------|-------|------|-------|
| WU-001 | anticlock-metaswarm-2cp | Phase 0 — Install deps + utility files | — | src/lib/utils/activity.ts, src/lib/utils/format.ts, src/types/crm.ts |
| WU-002 | anticlock-metaswarm-117 | Phase 1 — Display components | WU-001 | src/components/shared/EmptyState.tsx, PageHeader.tsx, StatusBadge.tsx, PriorityDot.tsx, ActivityTimeline.tsx |
| WU-003 | anticlock-metaswarm-41a | Phase 2 — DataTable | WU-001, WU-002 | src/components/shared/DataTable.tsx |
| WU-004 | anticlock-metaswarm-qha | Phase 3 — CrudForm | WU-001 | src/components/shared/CrudForm.tsx |
| WU-005 | anticlock-metaswarm-3or | Phase 4 — Interactive components | WU-001 | src/components/shared/ConfirmDialog.tsx, SearchInput.tsx, OwnerSelect.tsx, TagInput.tsx |
| WU-006 | anticlock-metaswarm-707 | Phase 5 — Unit tests | WU-003, WU-004, WU-005 | src/components/shared/__tests__/*.unit.test.tsx (11 files) |
| WU-007 | anticlock-metaswarm-83a | Phase 6 — Barrel export | WU-006 | src/components/shared/index.ts |

## Notes
- cn() already exists in src/lib/utils.ts — no cn.ts to create
- Already installed: shadcn button, card, form, input, label, avatar, dropdown-menu, sheet, alert
- Missing shadcn: table, skeleton, alert-dialog, badge, popover, command
- Missing package: @tanstack/react-table
