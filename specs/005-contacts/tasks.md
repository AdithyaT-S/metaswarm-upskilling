# Tasks — 005 Contacts

## Phase 1: DB & Server Actions

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| C1-01 | Write SQL migration: contacts table, partial unique index on email, RLS policy | No | — |
| C1-02 | Implement `getContacts`, `getContact`, `getContactOptions`, `getOrgMembers` actions | No | C1-01 |
| C1-03 | Implement `createContact`, `updateContact`, `deleteContact` actions with Zod | No | C1-01 |
| C1-04 | Implement `importContactsCSV` action (papaparse server-side) | No | C1-01 |
| C1-05 | Unit tests for all server actions | Yes | C1-02, C1-03, C1-04 |

## Phase 2: Contacts List Page

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| C2-01 | `columns.tsx`: TanStack Table column definitions | No | C1-02 |
| C2-02 | `ContactSearchBar.tsx` + `ContactFilters.tsx` (URL params + debounce) | Yes | — |
| C2-03 | `ContactsTable.tsx` DataTable wrapper with pagination | No | C2-01 |
| C2-04 | `contacts/page.tsx` RSC: assemble list + search + filters | No | C2-02, C2-03 |
| C2-05 | `loading.tsx` skeleton + `error.tsx` boundary | Yes | — |

## Phase 3: Create / Edit Forms

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| C3-01 | `ContactForm.tsx`: react-hook-form + shadcn/ui fields, tags Combobox, owner picker | No | C1-02 |
| C3-02 | `contacts/new/page.tsx` using ContactForm | No | C3-01 |
| C3-03 | `contacts/[id]/edit/page.tsx` using ContactForm (pre-populated) | No | C3-01 |

## Phase 4: Contact Detail Page

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| C4-01 | `ActivityTimeline.tsx`: render activities with type icon + body | No | C1-02 |
| C4-02 | `CustomFieldsPanel.tsx`: merge definitions + JSONB, render by type | No | C1-02 |
| C4-03 | `DealsCountBadge.tsx`: link to `/deals?contactId=<id>` | Yes | — |
| C4-04 | `contacts/[id]/page.tsx` RSC: getContact() → assemble detail view | No | C4-01, C4-02, C4-03 |

## Phase 5: CSV Import

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| C5-01 | Install papaparse + types | No | — |
| C5-02 | `ImportCSVButton.tsx`: file input, calls importContactsCSV, shows toast | No | C1-04, C5-01 |
| C5-03 | Wire ImportCSVButton into contacts list page | No | C5-02, C2-04 |

## Phase 6: E2E Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| C6-01 | `e2e/contacts/list.spec.ts`: search, filter, pagination | Yes | C2-04 |
| C6-02 | `e2e/contacts/create-edit.spec.ts`: create, edit, delete | Yes | C3-02, C3-03 |
| C6-03 | `e2e/contacts/import.spec.ts`: CSV import happy path + duplicate skip | Yes | C5-03 |
| C6-04 | `e2e/contacts/detail.spec.ts`: activity timeline, deals badge | Yes | C4-04 |

---

## Agent Assignment

| Agent | Tasks |
|-------|-------|
| architect | C1-01, review data-model decisions |
| coder | C1-02 through C5-03 |
| test-automator | C1-05, C6-01 through C6-04 |
| code-review | Final review of ContactForm, importContactsCSV, RLS migration |
