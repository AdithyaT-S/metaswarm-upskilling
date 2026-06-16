# Tasks: Settings

**Feature**: 012-settings
**Date**: 2026-06-16

---

## Phase 1 — DB Migration

| ID | Task | Swarm | Depends |
|----|------|-------|---------|
| T-1.1 | Write migration: `custom_field_definitions` table + RLS policy | architect | — |
| T-1.2 | Verify existing tables (`users.role`, `orgs.plan`, `pipelines`, `pipeline_stages`) present | architect | T-1.1 |

---

## Phase 2 — Server Actions

| ID | Task | Swarm | Depends |
|----|------|-------|---------|
| T-2.1 | Implement `getMyProfile` + `updateProfile` in `src/lib/actions/settings.ts` | coder | T-1.2 |
| T-2.2 | Implement `getTeamMembers` + `inviteMember` + `updateMemberRole` + `removeMember` | coder | T-1.2 |
| T-2.3 | Implement pipeline actions: `getPipelines`, `getPipelineWithStages`, `createPipeline`, `updatePipeline`, `deletePipeline` | coder | T-1.2 |
| T-2.4 | Implement stage actions: `createStage`, `updateStage`, `deleteStage`, `reorderStages` | coder | T-2.3 |
| T-2.5 | Implement `getCustomFields` + `createCustomField` + `updateCustomField` + `deleteCustomField` | coder | T-1.1 |
| T-2.6 | Implement `getBillingInfo` (usage count queries for contacts/users/deals/emails) | coder | T-1.2 |

> T-2.1 through T-2.6 can run in parallel once T-1.2 is done.

---

## Phase 3 — Page Shell

| ID | Task | Swarm | Depends |
|----|------|-------|---------|
| T-3.1 | Create `src/app/(dashboard)/settings/page.tsx` (Server Component, reads `?tab`, fetches initial data) | coder | T-2.1, T-2.2, T-2.3, T-2.5, T-2.6 |
| T-3.2 | Create `src/components/settings/settings-client.tsx` (shadcn Tabs + URL param sync) | coder | T-3.1 |

---

## Phase 4 — Tab Components (parallel)

| ID | Task | Swarm | Depends |
|----|------|-------|---------|
| T-4.1 | Build `profile-tab.tsx` (CrudForm + `updateProfile`) | coder | T-3.2 |
| T-4.2 | Build `team-tab.tsx` (member list + invite form + role dropdown + ConfirmDialog remove) | coder | T-3.2 |
| T-4.3 | Build `pipelines-tab.tsx` (pipeline accordion + stage list + @dnd-kit sortable) | coder | T-3.2 |
| T-4.4 | Build `custom-fields-tab.tsx` (field list + add field form with type selector) | coder | T-3.2 |
| T-4.5 | Build `billing-tab.tsx` (usage bars from `getBillingInfo`, free plan limits) | coder | T-3.2 |

> T-4.1 through T-4.5 are **parallel**.

---

## Phase 5 — Tests

| ID | Task | Swarm | Depends |
|----|------|-------|---------|
| T-5.1 | Unit tests: `updateProfile` Zod validation + happy path | test-automator | T-2.1 |
| T-5.2 | Unit tests: team actions — role guard (non-admin), self-protection, free plan limit | test-automator | T-2.2 |
| T-5.3 | Unit tests: pipeline/stage actions — role guard, cascade-close on deletePipeline | test-automator | T-2.3, T-2.4 |
| T-5.4 | Unit tests: custom field actions — role guard, duplicate name error | test-automator | T-2.5 |
| T-5.5 | E2E: full team lifecycle (invite → role change → remove) | test-automator | T-4.2 |
| T-5.6 | E2E: pipeline create + stage add + reorder reflects in Deals Kanban | test-automator | T-4.3 |
| T-5.7 | E2E: custom field add → verify in Contact create form | test-automator | T-4.4 |

> T-5.1 through T-5.4 are **parallel**. T-5.5 through T-5.7 are **parallel**.

---

## Phase 6 — Code Review

| ID | Task | Swarm | Depends |
|----|------|-------|---------|
| T-6.1 | Code review: role guards consistent across all 5 tabs; Zod on all mutations; `reorderStages` edge cases | code-review | T-5.1–T-5.7 |

---

## Swarm Assignment Summary

| Agent | Tasks |
|-------|-------|
| architect | T-1.1, T-1.2 |
| coder | T-2.1–T-2.6, T-3.1, T-3.2, T-4.1–T-4.5 |
| test-automator | T-5.1–T-5.7 |
| code-review | T-6.1 |
