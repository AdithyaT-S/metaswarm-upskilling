# Quickstart & Validation — 005 Contacts

## Validation Scenarios

### Scenario 1: Create a Contact

1. Log in as a member of an org with < 500 contacts.
2. Navigate to `/contacts/new`.
3. Fill in First Name: "Jane", Email: "jane@acme.com", Company: "Acme".
4. Submit → redirected to `/contacts/<new-id>`.
5. Verify: detail page shows "Jane", "acme.com", deal count badge = 0.

### Scenario 2: Email Uniqueness Error

1. Create a contact with email "dup@test.com".
2. Attempt to create a second contact with the same email.
3. Verify: form shows field-level error "A contact with this email already exists". No 500 error.

### Scenario 3: Search and Filter

1. Navigate to `/contacts`.
2. Type "acme" in search box → results show only contacts with "acme" in name/email/company.
3. Select an owner from the Owner filter dropdown → results further narrowed.
4. Clear filters → all contacts return.

### Scenario 4: CSV Import

1. Prepare `contacts.csv` with headers: `first_name,last_name,email,phone,company`.
2. Navigate to `/contacts` → click "Import CSV".
3. Upload file → verify toast shows "Imported 5 contacts, skipped 0".
4. Upload same file again → verify "Imported 0, skipped 5" (duplicate emails).

### Scenario 5: Free Plan Limit

1. Using a test org with exactly 500 contacts.
2. Attempt to create contact 501.
3. Verify: action returns error "Your plan allows up to 500 contacts." and contact is not created.

### Scenario 6: Soft Delete

1. Open an existing contact detail page.
2. Click Delete → confirm dialog → confirm.
3. Verify: redirected to `/contacts`; deleted contact absent from list.
4. Verify: activities referencing contact still exist (DB check or admin view).

---

## Unit Test Targets (`src/app/actions/__tests__/contacts.test.ts`)

- `createContact`: validates schema, enforces limit, handles 23505
- `updateContact`: partial update, email uniqueness on update
- `deleteContact`: sets deleted_at; subsequent getContacts excludes it
- `importContactsCSV`: parses CSV, skips dupes, respects limit

## E2E Test Files

- `e2e/contacts/list.spec.ts` — search, filter, pagination
- `e2e/contacts/create-edit.spec.ts` — create, edit, delete flows
- `e2e/contacts/import.spec.ts` — CSV import happy path + duplicate skip
- `e2e/contacts/detail.spec.ts` — activity timeline, deals count badge
