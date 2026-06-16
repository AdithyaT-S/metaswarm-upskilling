# Implementation Plan — 006 Leads

## Constitution Check

| Principle | Status | Note |
|-----------|--------|------|
| Provider isolation | PASS | All DB in src/lib/db/ |
| Multi-tenancy | PASS | queryForOrg() in every action; RLS on leads |
| Zod everywhere | PASS | Create/Update/Status/Search schemas |
| No `any` | PASS | Raw rows typed at DB boundary |
| UI from Stitch | PASS | Stitch screen `219d7f6e` fetched before design |
| Auth guard | PASS | getAuthUser() first in all actions |
| Immutability | PASS | contact_id excluded from UpdateLeadSchema |
| Converted guard | PASS | Both action and UI layers enforce read-only |

---

## Source Code Structure

```
src/app/actions/leads.ts
src/app/(dashboard)/leads/
  page.tsx                       # RSC: leads list
  loading.tsx
  error.tsx
  columns.tsx                    # TanStack Table columns
  new/page.tsx                   # Create lead form
  [id]/page.tsx                  # Lead detail
  [id]/edit/page.tsx             # Edit lead (blocked if converted)
  _components/
    LeadForm.tsx                 # Shared create/edit form
    LeadsTable.tsx               # DataTable wrapper
    LeadStatusSelect.tsx         # Inline status dropdown
    ScoreBadge.tsx               # Score with color coding
    ContactCard.tsx              # Mini contact summary
    ConvertedBanner.tsx          # Read-only warning
    ConvertButton.tsx            # Convert to deal CTA
src/app/actions/__tests__/leads.test.ts
e2e/leads/
```

---

## Implementation Phases

### Phase 1: DB + Server Actions
- SQL migration for leads table with CHECK constraints and indexes
- Implement all 7 server actions
- Unit tests

### Phase 2: Leads List Page
- RSC with status/owner filters + search (URL params)
- `columns.tsx`: contact name, status badge, score badge, source, owner, created_at, actions
- Loading + error boundaries

### Phase 3: Create / Edit Forms
- `LeadForm.tsx`: contact picker (Combobox from getContactsForPicker), score input, source select, notes textarea
- `new/page.tsx` and `[id]/edit/page.tsx`
- Edit page checks converted_at in RSC; shows ConvertedBanner if set

### Phase 4: Lead Detail Page
- `[id]/page.tsx`: calls getLead(id); shows ContactCard, ScoreBadge, status, notes
- ConvertButton (if not converted) → calls convertLeadToDeal → router.push
- LeadStatusSelect for inline status update
- ConvertedBanner (if converted)

### Phase 5: E2E Tests
- All 4 E2E spec files

---

## Key Implementation Notes

- `ConvertButton` is a Client Component: calls the server action, awaits result, then uses `useRouter().push()` with the returned contactId and source.
- `LeadStatusSelect` is a Client Component: calls `updateLeadStatus` with transition, shows optimistic status.
- The edit page RSC should call `getLead(id)` and if `converted_at` is set, render `ConvertedBanner` and disable the form rather than redirect away — the user can still view the data.
- DELETE is only shown when `user.role === 'admin'` — check in RSC via `getAuthUser()`.
