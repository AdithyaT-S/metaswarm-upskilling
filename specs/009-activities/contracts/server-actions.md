# Server Action Contracts — 009 Activities

All actions in `src/app/actions/activities.ts`.

---

## listActivities(params)

**Input**: `ActivitySearchSchema`

**Output**: `{ data: { activities: Activity[], total: number } }`

**Query**: WHERE org_id + optional filters (type, owner_id, contact_id, deal_id, ticket_id, date_from, date_to); ILIKE on body if q present. ORDER BY created_at DESC.

---

## getActivity(id)

**Input**: `id: string`

**Output**: `{ data: { activity: Activity } }`

---

## createActivity(formData)

**Input**: `FormData` → parsed to `CreateActivitySchema`

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/activities')`, plus linked entity path if contact_id/deal_id/ticket_id set.

---

## updateActivity(id, formData)

**Input**: `id: string`, `FormData` → `UpdateActivitySchema` (no type field)

**Validation**: Verify activity.org_id === user.orgId (via RLS) and optionally that owner = user or admin.

**Output**: `{ data: { id: string } }` or `{ error }`

**Side effects**: `revalidatePath('/activities')`

---

## deleteActivity(id)

**Input**: `id: string`

**Validation**: Fetch activity; check user.id === activity.owner_id OR user.role === 'admin'. If neither, return `{ error: { message: 'You can only delete your own activities.' } }`.

**Output**: `{ data: { success: true } }` or `{ error }`

**Side effects**: `revalidatePath('/activities')`

---

## toggleTaskCompletion(id)

**Input**: `id: string`

**Validation**: Fetch activity; verify type === 'task'. If not task, return error.

**Action**: If done_at IS NULL → SET done_at = now(). Else → SET done_at = NULL.

**Output**: `{ data: { done_at: string | null } }` or `{ error }`

**Side effects**: `revalidatePath('/activities')`

---

## getDealOptions()

**Input**: none

**Output**: `{ data: Array<{ id: string; name: string; contact_name: string | null }> }`

**Query**: SELECT deals.id, deals.name, contacts.first_name || ' ' || contacts.last_name AS contact_name FROM deals LEFT JOIN contacts ON deals.contact_id = contacts.id WHERE deals.org_id = current_org AND deals.status = 'open'.
