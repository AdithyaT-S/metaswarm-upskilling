# Server Action Contracts — 006 Leads

All actions in `src/app/actions/leads.ts`.

---

## getLeads(params)

**Input**: `LeadSearchSchema` (status, owner_id, q, page, pageSize)

**Output**: `{ data: { leads: Array<Lead & { contact_name: string }>, total: number } }`

**Query**: JOIN contacts on contact_id; WHERE org_id + optional filters; ILIKE on contact first_name||last_name if q present.

---

## getLead(id)

**Input**: `id: string`

**Output**: `{ data: { lead: Lead, contact: Contact } }`

**Query**: SELECT lead + JOIN contact.

---

## getContactsForPicker()

**Input**: none

**Output**: `{ data: Array<{ id: string; name: string }> }`

**Note**: Delegates to same query as `getContactOptions()` in contacts actions — or duplicated here for module independence.

---

## createLead(data)

**Input**: `CreateLeadSchema`

**Validation**: Verify contact_id belongs to same org.

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/leads')`

---

## updateLead(id, data)

**Input**: `UpdateLeadSchema` (no contact_id)

**Validation**: Check converted_at IS NULL; if converted, return error "Converted leads cannot be edited."

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/leads')`, `revalidatePath('/leads/[id]')`

---

## updateLeadStatus(id, data)

**Input**: `UpdateLeadStatusSchema` { id, status }

**Validation**: Check converted_at IS NULL.

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/leads')`

---

## deleteLead(id)

**Input**: `id: string`

**Validation**: user.role === 'admin'. Check converted_at IS NULL.

**Output**: `{ data: { success: true } }` or `{ error }`

**Side effects**: `revalidatePath('/leads')`

---

## convertLeadToDeal(id)

**Input**: `id: string`

**Action**: UPDATE leads SET converted_at = now(), status = 'Converted' WHERE id = $1 AND converted_at IS NULL.

**Output**: `{ data: { contactId: string, source: string | null } }` or `{ error }`

**Side effects**: `revalidatePath('/leads')`

**UI after**: `router.push('/deals/new?contactId=${contactId}&source=${source}')`
