# Server Action Contracts — 005 Contacts

All actions in `src/app/actions/contacts.ts`. All follow: auth check → Zod parse → queryForOrg → revalidatePath → return.

---

## getContacts(params)

**Input**: `ContactSearchSchema` (q, owner_id, lead_source, page, pageSize)

**Output**: `{ data: { contacts: Contact[], total: number, page: number, pageSize: number } }`

**Query**: SELECT with WHERE deleted_at IS NULL + ILIKE on name/email/company if q present. ORDER BY created_at DESC. LIMIT/OFFSET by page.

**Side effects**: none

---

## getContact(id)

**Input**: `id: string` (UUID)

**Output**: `{ data: { contact: Contact, activities: Activity[], dealsCount: number } }`

**Query**: 3 queries — fetch contact, fetch activities WHERE contact_id=id ORDER BY created_at DESC, COUNT deals WHERE contact_id=id AND deleted_at IS NULL.

**Side effects**: none

---

## getContactOptions()

**Input**: none

**Output**: `{ data: Array<{ id: string; name: string }> }`

**Query**: SELECT id, first_name || ' ' || COALESCE(last_name,'') FROM contacts WHERE deleted_at IS NULL ORDER BY first_name.

---

## getOrgMembers()

**Input**: none

**Output**: `{ data: Array<{ id: string; name: string; email: string }> }`

**Query**: SELECT id, name, email FROM users WHERE org_id = current org.

---

## createContact(data)

**Input**: `CreateContactSchema`

**Validation**: Check contact count for org < 500 (free plan). Email uniqueness caught via pg error 23505.

**Output**: `{ data: { id: string } }` or `{ error: { message: string } | ZodFlattenedError }`

**Side effects**: `revalidatePath('/contacts')`

---

## updateContact(id, data)

**Input**: `id: string`, `UpdateContactSchema` (all fields optional)

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/contacts')`, `revalidatePath('/contacts/[id]')`

---

## deleteContact(id)

**Input**: `id: string`

**Action**: UPDATE contacts SET deleted_at = now() WHERE id = $1

**Output**: `{ data: { success: true } }` or `{ error }`

**Side effects**: `revalidatePath('/contacts')`

---

## importContactsCSV(formData)

**Input**: `FormData` with key `file` (CSV File)

**Process**:
1. Read file as text
2. Parse with `papaparse.parse(text, { header: true, skipEmptyLines: true })`
3. Check current contact count; limit batch so total ≤ 500
4. For each row: validate required fields, attempt INSERT, catch 23505 → skip
5. Return summary

**Output**: `{ data: { imported: number, skipped: number, errors: string[] } }`

**Side effects**: `revalidatePath('/contacts')`
