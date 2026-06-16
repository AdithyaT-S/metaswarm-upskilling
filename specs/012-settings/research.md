# Research: Settings

**Date**: 2026-06-16

---

## Decision 1: Tab Navigation — shadcn Tabs

**Decision**: Use shadcn `Tabs` component for the 5 settings tabs. Active tab stored in URL param (`?tab=team`).

**Rationale**: URL-driven tabs are bookmarkable. shadcn Tabs is already installed. No extra client state needed.

---

## Decision 2: Invite — Create User Directly (No Email in v1)

**Decision**: `inviteMember` creates a user row with email + role + name-from-email. No invite email sent. No invite token. The invited user receives their credentials out-of-band.

**Rationale**: BRD §4.1 mentions email invites but this is the reference project implementation. Email infrastructure (Resend) exists but is deprioritised for v1 team invites to avoid the token/expiry complexity. Documented as known gap.

**Known gap**: Invited users have no way to set their own password in v1 — admin must communicate credentials separately. This is acceptable for v1 internal teams.

---

## Decision 3: Pipeline Reorder — @dnd-kit

**Decision**: Stage reordering in Pipelines tab uses `@dnd-kit/core` + `@dnd-kit/sortable` (same library as Deals Kanban). Drag-and-drop calls `reorderStages({ pipeline_id, stage_ids: string[] })`.

**Rationale**: Same DnD library as Deals — no additional dependency. Reorder is a list sort (vertical), which is simpler than Kanban (horizontal).

---

## Decision 4: Custom Fields — JSONB + Definition Table

**Decision**: Custom field *definitions* are in `custom_field_definitions` table. Field *values* are stored in `contacts.custom_fields` (JSONB) keyed by `field_name`.

**Rationale**: Schema-less JSONB for values means adding/removing fields doesn't require migrations. The definition table provides type info for rendering forms and display. `entity_type='contact'` only in v1.

---

## Decision 5: Role Guards — Server Action + UI

**Decision**: Role checks happen in both the Server Action (`if (user.role !== 'admin') return { error }`) AND in the UI (hide/disable buttons for non-admin). Server-side check is authoritative; UI check is UX convenience.

---

## Decision 6: Remove Member — Cascade Nullify

**Decision**: `removeMember` uses a multi-step transaction: nullify owner_id on contacts/leads/deals and assignee_id on tickets, then delete the user row. Done in sequence (not a DB transaction) — acceptable because partial failure leaves orphaned null owners, not orphaned user IDs.

**Trade-off**: Not fully atomic. A real transaction would be safer. Acceptable for v1 because member removal is rare and auditable.

---

## Decision 7: Billing Tab — Read-Only, No Stripe

**Decision**: Billing tab reads org plan from `orgs.plan` column and computes usage from count queries. No Stripe integration, no upgrade flow in v1. "Upgrade to Pro" shows a mailto or placeholder.

**Rationale**: Payment integration is complex and out of scope for v1. The billing display still provides value by showing users when they're approaching limits.
