# 005 — Contacts Module

## User Stories

**US-1**: As a sales rep, I can view a paginated, searchable list of contacts so I can quickly find someone to work with.

**Acceptance**: Given the contacts list, when I type in the search box, results filter by name/email/company in real time (debounced). Pagination controls appear when results exceed the page size.

**US-2**: As a sales rep, I can create and edit contacts, including assigning custom fields, so I can capture full prospect data.

**Acceptance**: The contact form validates required fields (first_name, email), enforces email uniqueness, and limits to 500 contacts on the free plan.

**US-3**: As a sales rep, I can view a contact's detail page showing their activity timeline, deal count, and custom fields.

**Acceptance**: Contact detail page shows all CRM fields, activity timeline sorted by created_at desc, and a deals count badge linking to filtered deals.

**US-4**: As an admin, I can import contacts via CSV so I can bulk-migrate data.

**Acceptance**: Uploading a valid CSV with headers (first_name, last_name, email, phone, company, job_title) creates contacts, skipping rows with duplicate emails and returning a summary.

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | List contacts with server-side search (ILIKE on first_name, last_name, email, company) |
| FR-02 | Filter contacts by owner_id and lead_source |
| FR-03 | Paginate results (default 25 per page) |
| FR-04 | Create contact; enforce 500-contact free plan limit |
| FR-05 | Email uniqueness: pg error 23505 → user-friendly message |
| FR-06 | Edit contact; all fields optional except first_name and email |
| FR-07 | Soft-delete contact (deleted_at = now()); deleted contacts excluded from all queries |
| FR-08 | Contact detail: show activities timeline (all types), deals count badge |
| FR-09 | Custom fields: render name/value pairs from CustomFieldDefinition + contact.custom_fields JSONB |
| FR-10 | CSV import: parse with papaparse server-side; skip duplicate emails; return {imported, skipped} |
| FR-11 | CSV import: enforce free plan limit across batch |
| FR-12 | Assign owner_id from org member list |
| FR-13 | Tags stored as text[] — support add/remove via multi-select UI |
| FR-14 | getContactOptions() returns minimal {id, name} for pickers in other modules |
| FR-15 | Activities on detail page link back to deal/ticket if linked |

---

## Key Entities

- `contacts` — primary table, soft-deleted
- `activities` — timeline entries linked via contact_id
- `deals` — count badge via contact_id FK
- `custom_field_definitions` — org-level field schema
- `users` — owner picker

---

## Success Criteria

1. Search returns results within 300 ms for orgs with ≤ 500 contacts.
2. CSV import of 100 rows completes without timeout; summary returned to UI.
3. Duplicate email on create returns field-level error message, not a 500.
4. Free plan blocks creation at 501st contact with a clear upgrade prompt.
5. Contact detail page loads activities and deal count in a single round-trip.

---

## Assumptions

- Custom field definitions are managed in Settings (module 012); contacts module only renders them.
- Tags are free-text strings; no tag taxonomy in v1.
- Deleted contacts are not recoverable from the UI in v1.
- CSV import does not update existing contacts — insert only.
- Phone format is not validated server-side in v1.
