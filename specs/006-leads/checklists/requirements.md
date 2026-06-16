# Requirements Checklist — 006 Leads

## Quality Gates

- [x] Every Server Action calls `getAuthUser()` first
- [x] All inputs validated with Zod before DB write
- [x] All DB queries through `queryForOrg()`
- [x] No DB imports outside `src/lib/db/`
- [x] No TypeScript `any` except raw DB boundaries
- [x] RLS policy on `leads` table
- [x] Converted leads blocked from edit/delete in action layer
- [x] Admin-only check for deleteLead
- [x] `contact_id` immutable after creation (blocked in updateLead schema)
- [x] `revalidatePath` called after all mutations
- [x] Redirect to `/deals/new?contactId=X&source=Y` after conversion
- [x] Score validated as integer 0–100
- [x] Vitest unit tests for all actions
- [x] Playwright E2E for create, status update, convert flows

## Scope Boundaries

- Lead activities/timeline is NOT in this module (contacts module ActivityTimeline is reused if needed).
- Lead scoring automation is out of scope for v1.
- Bulk status update is out of scope for v1.
