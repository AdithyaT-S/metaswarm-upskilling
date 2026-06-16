# Tasks — 006 Leads

## Phase 1: DB & Server Actions

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| L1-01 | SQL migration: leads table, CHECK constraints, indexes, RLS | No | — |
| L1-02 | Implement getLeads, getLead, getContactsForPicker | No | L1-01 |
| L1-03 | Implement createLead, updateLead, updateLeadStatus | No | L1-01 |
| L1-04 | Implement deleteLead, convertLeadToDeal | No | L1-01 |
| L1-05 | Unit tests for all actions | Yes | L1-02, L1-03, L1-04 |

## Phase 2: Leads List Page

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| L2-01 | `columns.tsx`: TanStack columns with ScoreBadge, status badge, actions | No | L1-02 |
| L2-02 | `LeadsTable.tsx` + status/owner filter components | Yes | L2-01 |
| L2-03 | `leads/page.tsx` RSC: list + filters | No | L2-02 |
| L2-04 | loading.tsx + error.tsx | Yes | — |

## Phase 3: Create / Edit Forms

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| L3-01 | `ScoreBadge.tsx` component | Yes | — |
| L3-02 | `LeadForm.tsx`: contact Combobox, score, source, notes | No | L1-02 |
| L3-03 | `leads/new/page.tsx` | No | L3-02 |
| L3-04 | `leads/[id]/edit/page.tsx` with converted guard | No | L3-02 |

## Phase 4: Lead Detail Page

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| L4-01 | `ContactCard.tsx`: mini contact summary | Yes | — |
| L4-02 | `LeadStatusSelect.tsx`: client component, inline update | No | L1-03 |
| L4-03 | `ConvertButton.tsx`: client component, calls convertLeadToDeal + router.push | No | L1-04 |
| L4-04 | `ConvertedBanner.tsx`: static read-only notice | Yes | — |
| L4-05 | `leads/[id]/page.tsx` RSC: assemble detail view | No | L4-01..L4-04 |

## Phase 5: E2E Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| L5-01 | `e2e/leads/list.spec.ts` | Yes | L2-03 |
| L5-02 | `e2e/leads/create-edit.spec.ts` | Yes | L3-03, L3-04 |
| L5-03 | `e2e/leads/convert.spec.ts` | Yes | L4-05 |
| L5-04 | `e2e/leads/read-only.spec.ts` | Yes | L4-05 |

---

## Agent Assignment

| Agent | Tasks |
|-------|-------|
| architect | L1-01, schema design review |
| coder | L1-02 through L4-05 |
| test-automator | L1-05, L5-01 through L5-04 |
| code-review | convertLeadToDeal logic, converted-lead guard enforcement |
