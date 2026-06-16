# Research — 006 Leads

## Decision Log

### D-1: Lead-Contact Relationship

**Decision**: Leads require a `contact_id` (NOT NULL FK). Contact picker uses `getContactOptions()` from the contacts module.

**Rationale**: A lead without a contact has no person to pursue. Forcing the link early ensures data quality and makes the convert-to-deal redirect straightforward (contactId already known).

**Alternatives**: Allow leads without a contact (create contact later) — rejected; complicates conversion flow and reporting.

---

### D-2: contact_id Immutability

**Decision**: Once a lead is created, `contact_id` cannot be changed. The `UpdateLeadSchema` omits `contact_id`.

**Rationale**: Changing the contact on a lead would confuse conversion history and activity attribution. If the wrong contact was chosen, delete and recreate.

**Alternatives**: Allow contact change — rejected; too much risk of data inconsistency.

---

### D-3: Converted Lead Read-Only Enforcement

**Decision**: Both the action layer (`updateLead`, `deleteLead`) and the UI enforce read-only for converted leads. Actions check `converted_at IS NOT NULL` and return an error.

**Rationale**: Defense in depth — UI restriction alone is insufficient since Server Actions can be called directly.

**Alternatives**: Soft-block in UI only — rejected; not safe.

---

### D-4: Convert-to-Deal Flow

**Decision**: `convertLeadToDeal` sets `converted_at`, returns `{ contactId, source }`. The calling UI does `router.push('/deals/new?contactId=X&source=Y')`. The deal form reads these query params to pre-fill.

**Rationale**: Keeps lead and deal modules decoupled. The deal module reads params independently.

**Alternatives**: Server-side create the deal directly in convertLeadToDeal — rejected; deal has required fields (name, stage) that need user input.

---

### D-5: Status vs. Full Edit

**Decision**: Provide two actions: `updateLead` (all editable fields) and `updateLeadStatus` (only status). The status dropdown on the list/detail triggers the lightweight action.

**Rationale**: Status changes happen frequently (inline on list page). A lightweight action avoids loading the full form schema for a single field change.

**Alternatives**: Single `updateLead` for everything — acceptable but the lightweight path is better UX.

---

### D-6: Score Color Coding

**Decision**: Score badge: < 40 → muted/grey, 40–70 → yellow, > 70 → green. Implemented via a `ScoreBadge` component using Tailwind conditional classes.

**Rationale**: Visual differentiation helps reps quickly identify hot leads without reading numbers.
