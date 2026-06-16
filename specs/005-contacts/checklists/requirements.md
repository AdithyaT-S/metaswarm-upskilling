# Requirements Checklist — 005 Contacts

## Quality Gates

- [x] Every Server Action calls `getAuthUser()` before any DB access
- [x] All inputs validated with Zod `safeParse()` before DB write
- [x] All DB queries go through `queryForOrg(orgId, userId, sql, params)`
- [x] No `pg`, `supabase-js`, or `neon` imported outside `src/lib/db/`
- [x] No TypeScript `any` except at raw DB row boundaries
- [x] RLS policies in place on `contacts` table
- [x] Free plan limit (500) checked in `createContact` action
- [x] Soft-delete used; `deleted_at IS NULL` filter in all queries
- [x] Email uniqueness error handled gracefully (pg 23505)
- [x] `revalidatePath` called after mutations
- [x] CSV import uses papaparse server-side; returns import summary
- [x] Vitest unit tests for all server actions
- [x] Playwright E2E for create, edit, search, import flows
- [x] Custom fields rendered from `CustomFieldDefinition` — no hardcoding
- [x] Contact detail loads via RSC (no client fetch waterfall)

## Scope Boundaries

- Custom field **definition** management is in module 012-settings.
- Email thread display on contact detail is added in module 010-email.
- Lead conversion badge is added when 006-leads is implemented.
