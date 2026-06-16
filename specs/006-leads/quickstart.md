# Quickstart & Validation — 006 Leads

## Validation Scenarios

### Scenario 1: Create a Lead

1. Ensure at least one contact exists (create via /contacts/new if needed).
2. Navigate to `/leads/new`.
3. Select contact "Jane Doe", set Score=75, Source="Website", Status="New".
4. Submit → redirected to `/leads/<id>`.
5. Verify: detail page shows contact card with Jane Doe's name, email, company.
6. Verify: score badge is green (>70).

### Scenario 2: Update Lead Status Inline

1. On `/leads`, find the lead created in Scenario 1.
2. Click the status badge dropdown → select "Contacted".
3. Verify: badge updates to "Contacted" without page reload (optimistic or revalidated).

### Scenario 3: Converted Lead Read-Only

1. Convert a lead (Scenario 4 below).
2. Navigate to the converted lead's detail page.
3. Verify: "Converted" banner displayed. Edit button absent or disabled.
4. Attempt direct action call to updateLead → verify returns error "Converted leads cannot be edited."

### Scenario 4: Convert to Deal

1. Open a lead detail page with Status="Qualified".
2. Click "Convert to Deal".
3. Verify: redirected to `/deals/new?contactId=<id>&source=<source>`.
4. Verify: deal creation form has contact and source pre-filled.
5. Navigate back to `/leads` → lead shows "Converted" status.

### Scenario 5: Delete Restricted to Admin

1. Log in as a member (not admin).
2. Open a non-converted lead detail page.
3. Verify: Delete button absent or returns error "Unauthorized" when called.
4. Log in as admin → verify Delete button present and functional.

---

## Unit Test Targets (`src/app/actions/__tests__/leads.test.ts`)

- `createLead`: requires valid contact_id in same org
- `updateLead`: blocks on converted leads
- `updateLeadStatus`: validates status enum, blocks on converted
- `deleteLead`: admin-only enforcement
- `convertLeadToDeal`: sets converted_at, returns contactId + source; idempotent on already-converted

## E2E Test Files

- `e2e/leads/list.spec.ts` — filter by status, owner, search
- `e2e/leads/create-edit.spec.ts` — create, edit flows
- `e2e/leads/convert.spec.ts` — convert to deal redirect
- `e2e/leads/read-only.spec.ts` — converted lead UI restrictions
