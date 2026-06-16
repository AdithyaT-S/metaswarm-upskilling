# 006 — Leads Module

## User Stories

**US-1**: As a sales rep, I can view a list of leads filtered by status and owner so I can prioritize my pipeline.

**Acceptance**: Leads list shows status badge, score, linked contact name, and owner. Filtering by status (New/Contacted/Qualified/Unqualified/Converted) narrows results.

**US-2**: As a sales rep, I can create a lead linked to an existing contact and assign it a score and source.

**Acceptance**: Lead form requires contact selection. Score defaults to 0. Lead saved with status=New.

**US-3**: As a sales rep, I can update a lead's status inline (e.g., New → Contacted) and add notes.

**Acceptance**: Status dropdown on detail page triggers `updateLeadStatus`. Converted leads show a read-only banner and cannot be edited.

**US-4**: As a sales rep, I can convert a qualified lead to a deal, which pre-fills the deal creation form.

**Acceptance**: "Convert to Deal" button calls `convertLeadToDeal`, sets `converted_at`, then redirects to `/deals/new?contactId=X&source=Y`.

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | List leads with status filter, owner filter, search on contact name |
| FR-02 | Paginate results (25 per page) |
| FR-03 | Create lead: contact_id required, status defaults to 'New', score 0–100 |
| FR-04 | Lead must be linked to an existing contact (contact picker) |
| FR-05 | Edit lead: all fields except contact_id (immutable after creation) |
| FR-06 | Converted lead (converted_at IS NOT NULL): display as read-only, no edit/delete |
| FR-07 | updateLeadStatus: only updates status field; used for quick inline status change |
| FR-08 | convertLeadToDeal: sets converted_at, returns contactId + source for redirect |
| FR-09 | Delete lead: admin only; converted leads cannot be deleted |
| FR-10 | Lead detail shows linked contact card (name, email, company) |
| FR-11 | Lead detail shows notes field (text area) |
| FR-12 | Score displayed as numeric badge (0–100); color: <40 grey, 40–70 yellow, >70 green |
| FR-13 | Source constrained to LEAD_SOURCES enum |
| FR-14 | Leads are scoped to org via RLS |

---

## Key Entities

- `leads` — primary table
- `contacts` — linked via contact_id (required)
- `users` — owner picker + filter

---

## Success Criteria

1. Lead created and appears in list within one navigation.
2. Status update reflected immediately after `updateLeadStatus` (revalidatePath triggers refresh).
3. Convert-to-deal sets `converted_at` and redirects to deal creation page with pre-filled query params.
4. Converted lead shows "Converted" banner; edit actions disabled.
5. Deleting a lead is blocked for non-admin users.

---

## Assumptions

- Leads do not have their own custom fields in v1.
- A contact can have multiple leads (not one-to-one).
- Lead score is manually set; no automated scoring in v1.
- Conversion does not automatically create the deal — it only redirects to the deal form.
- Converted leads remain visible in the list (status filter can hide them).
