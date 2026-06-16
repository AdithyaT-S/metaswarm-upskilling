# Implementation Plan — 005 Contacts

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| Provider isolation | PASS | All DB in `src/lib/db/`, papaparse server-side only |
| Multi-tenancy | PASS | Every query uses `queryForOrg()`; RLS on contacts table |
| Zod everywhere | PASS | CreateContactSchema, UpdateContactSchema, ContactSearchSchema |
| No `any` | PASS | Raw DB rows typed as `unknown`, mapped to Contact type |
| UI from Stitch | PASS | Stitch screen `c744ca79` (list) + `b2ac0c02` (detail) fetched before design |
| Auth guard | PASS | `getAuthUser()` first line of every action |
| Soft delete | PASS | deleted_at pattern, excluded in all queries |
| Free plan limits | PASS | 500 contact cap checked in createContact and importContactsCSV |

---

## Source Code Structure

```
src/app/actions/contacts.ts           # All server actions
src/app/(dashboard)/contacts/
  page.tsx                            # RSC: list + search
  loading.tsx
  error.tsx
  columns.tsx                         # TanStack Table column defs
  new/page.tsx                        # Create form
  [id]/page.tsx                       # Contact detail RSC
  [id]/edit/page.tsx                  # Edit form
  _components/
    ContactForm.tsx                   # Shared create/edit form
    ContactsTable.tsx                 # DataTable wrapper
    ContactSearchBar.tsx              # Debounced search input
    ContactFilters.tsx                # Owner + source filters
    ActivityTimeline.tsx              # Renders activities list
    CustomFieldsPanel.tsx             # Renders custom_fields JSONB
    ImportCSVButton.tsx               # Upload trigger + result toast
    DealsCountBadge.tsx               # Link to filtered deals
src/app/actions/__tests__/contacts.test.ts
e2e/contacts/
```

---

## Implementation Phases

### Phase 1: DB + Server Actions
- Write SQL migration (contacts table, partial unique index, RLS)
- Implement all 8 server actions with Zod validation
- Unit tests for all actions

### Phase 2: Contacts List Page
- RSC list page with server-side search/filter/pagination
- `ContactsTable` with TanStack Table columns (name, email, company, owner, created_at, actions)
- `ContactSearchBar` + `ContactFilters` components
- `loading.tsx` skeleton, `error.tsx` boundary

### Phase 3: Create / Edit Forms
- `ContactForm` component (shadcn/ui form + react-hook-form + Zod)
- `new/page.tsx` and `[id]/edit/page.tsx` using the shared form
- Tags multi-select (Combobox pattern)
- Owner picker dropdown from `getOrgMembers()`

### Phase 4: Contact Detail Page
- `[id]/page.tsx` RSC — calls `getContact(id)`
- `ActivityTimeline` — sorted list of activities with type icons
- `CustomFieldsPanel` — merges CustomFieldDefinitions with contact.custom_fields
- `DealsCountBadge` — links to `/deals?contactId=<id>`

### Phase 5: CSV Import
- Install papaparse: `npm install papaparse @types/papaparse`
- `ImportCSVButton` — file input → calls `importContactsCSV(formData)` → toast result
- E2E tests for import

### Phase 6: E2E Tests
- Playwright tests for all 6 validation scenarios

---

## Key Implementation Notes

- `ContactSearchBar` should use `useRouter` + `useSearchParams` with a `useDebounce(300)` hook. On change, push new URL params; page RSC re-renders with new params.
- The partial unique index on `(org_id, email) WHERE deleted_at IS NULL` means re-creating a soft-deleted contact's email is currently blocked — acceptable in v1.
- `ActivityTimeline` renders activities only; email thread display is added in module 010.
- `CustomFieldsPanel` handles all four field types: text (plain), number (formatted), date (locale date), boolean (checkbox display), select (badge).
