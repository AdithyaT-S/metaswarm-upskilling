# Implementation Plan: Settings

**Feature**: 012-settings
**Date**: 2026-06-16
**Status**: Planning complete — ready for Metaswarm build

---

## Constitution Check

| Rule | Status | Notes |
|------|--------|-------|
| Provider isolation | PASS | No pg/supabase/neon imports outside `src/lib/db/` |
| Multi-tenancy (`queryForOrg`) | PASS | All queries scoped via `queryForOrg(orgId, userId, ...)` |
| Zod everywhere | PASS | All 5-tab schemas defined in data-model.md |
| No `any` | PASS | Typed from `crm.ts`; `any` only at raw DB row boundary |
| UI from Stitch | PASS | Settings page uses standard shadcn Tabs + existing shared components |
| Library docs via Context7 | PASS | @dnd-kit used for stage reorder (same as Deals Kanban) |
| SYSTEM_STATE.md read | PASS | Checked — `custom_field_definitions` may need migration |
| RLS on new tables | PASS | `custom_field_definitions` gets `org_id = current_org_id()` RLS |

All 8 checks PASS. No blockers.

---

## Source Structure

```
src/
  app/
    (dashboard)/
      settings/
        page.tsx                  # Server Component: loads session, fetches data for active tab
        settings-client.tsx       # 'use client': Tabs wrapper with URL param routing
  components/
    settings/
      profile-tab.tsx             # Profile form (react-hook-form + CrudForm)
      team-tab.tsx                # Team list + InviteForm + role/remove inline controls
      pipelines-tab.tsx           # Pipeline list + stage management + @dnd-kit reorder
      custom-fields-tab.tsx       # Custom field list + AddFieldForm
      billing-tab.tsx             # Usage bars (read-only)
  lib/
    actions/
      settings.ts                 # All settings Server Actions (all tabs)
```

---

## Phase 1 — DB Migration

- Create `custom_field_definitions` table (if not already by prior module)
- Add RLS policy: `org_id = current_org_id()`
- Verify `users.role`, `orgs.plan`, `pipelines`, `pipeline_stages` all exist (from auth + earlier modules)

**Verify**: `\d custom_field_definitions` in psql; RLS shows in `\dp`

---

## Phase 2 — Server Actions (`src/lib/actions/settings.ts`)

Implement all 19 actions across 5 tabs. Apply `safeParse` on every mutating action. Role guards first — reject early if not admin where required.

Order:
1. `getMyProfile`, `updateProfile`
2. `getTeamMembers`, `inviteMember`, `updateMemberRole`, `removeMember`
3. `getPipelines`, `getPipelineWithStages`, `createPipeline`, `updatePipeline`, `deletePipeline`, `createStage`, `updateStage`, `deleteStage`, `reorderStages`
4. `getCustomFields`, `createCustomField`, `updateCustomField`, `deleteCustomField`
5. `getBillingInfo`

**Verify**: Unit tests for each action (role guards, Zod rejection, happy path)

---

## Phase 3 — Settings Page + Tab Shell

- `src/app/(dashboard)/settings/page.tsx` — Server Component reads `?tab` param, calls appropriate fetch action, passes data as props to client
- `src/components/settings/settings-client.tsx` — `Tabs` from shadcn, URL param sync via `useSearchParams` + `useRouter`

**Verify**: Navigating to `/settings?tab=team` renders Team tab; changing tab updates URL

---

## Phase 4 — Tab Components (parallel)

All 5 components can be built in parallel once Phase 3 shell is done.

- **Profile tab**: shadcn Form + CrudForm. `updateProfile` on submit.
- **Team tab**: table of members. Invite form (controlled). Role dropdown inline. Remove with ConfirmDialog.
- **Pipelines tab**: accordion/list of pipelines. Stage list with @dnd-kit sortable. Create/rename/delete for both pipeline and stage.
- **Custom Fields tab**: list with type badges. Modal or inline add form.
- **Billing tab**: static usage bars. Reads from `getBillingInfo`.

**Verify**: Each tab renders, forms submit, optimistic feedback shown

---

## Phase 5 — Tests + E2E

- Unit: role guard rejection (non-admin cannot mutate), self-protection (cannot remove self), plan limit (free plan ≥3 users)
- E2E (Playwright): full team lifecycle, pipeline create + stage reorder, custom field add + verify in Contact form, billing read-only

**Verify**: All unit tests pass; E2E scenarios from quickstart.md pass

---

## Phase 6 — Code Review

- Swarm `code-review` agent: checks role guards consistent across all 5 tabs, Zod present on all mutations, no logic duplication between tabs, `reorderStages` handles empty array gracefully

---

## Dependencies

- **Blocks nothing** — settings is the last module (012)
- **Depends on**: auth (002) for session; contacts (005) for custom field display; deals (008) for pipeline/stage data; pipelines table from prior migration
- **Inter-module**: `custom_field_definitions` additions appear in Contact create/edit form (module 005 reads them)
