# FreshCRM System State

> **READ THIS BEFORE STARTING ANY MODULE.**
> This is the live handoff document. Updated by `/speckit-handoff` after each module merges.

---

## Completed Modules

| # | Module | Summary | Branch |
|---|--------|---------|--------|
| 002 | Auth & Org Management | NextAuth CredentialsProvider + JWT (id/orgId/orgName/role), 5 Server Actions (signUp/inviteUser/acceptInvite/updateMemberRole/removeMember), auth pages (login/signup/invite), 66 unit tests, 6 E2E specs | feat/auth-actions |
| 003 | Layout Shell | Dashboard shell layout (Sidebar/Topbar/main), 7 shell components (Sidebar, SidebarNav, Topbar, TopbarSearch, UserAvatar, UserAvatarMenu, MobileNav), 18 unit tests, 22 E2E specs | feat/layout-shell |
| 004 | Shared Components | 11 reusable UI components in src/components/shared/ (DataTable, CrudForm, ActivityTimeline, StatusBadge, PriorityDot, EmptyState, ConfirmDialog, SearchInput, PageHeader, OwnerSelect, TagInput), barrel index.ts, 56 unit tests, 92%+ coverage | feat/shared-components |

---

## Database Schema

### orgs

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | DEFAULT gen_random_uuid() |
| `name` | text NOT NULL | Display name |
| `slug` | text NOT NULL UNIQUE | URL-safe, e.g. "acme-corp-a1b2c" |
| `plan` | text NOT NULL DEFAULT 'free' | CHECK IN ('free','pro','enterprise') |
| `created_at` | timestamptz NOT NULL | DEFAULT now() |
| `updated_at` | timestamptz NOT NULL | DEFAULT now() |

### users

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | DEFAULT gen_random_uuid() |
| `org_id` | uuid NOT NULL | FK → orgs(id) ON DELETE CASCADE |
| `auth_provider_id` | text UNIQUE NULLABLE | Future OAuth |
| `email` | text NOT NULL | Unique per org |
| `full_name` | text NOT NULL DEFAULT '' | |
| `avatar_url` | text NULLABLE | |
| `role` | text NOT NULL DEFAULT 'member' | CHECK IN ('admin','member','viewer') |
| `password_hash` | text NULLABLE | bcrypt hash; null for OAuth-only |
| `created_at` | timestamptz NOT NULL | DEFAULT now() |
| `updated_at` | timestamptz NOT NULL | DEFAULT now() |

**Unique**: `(org_id, email)` | **Indexes**: `idx_users_org(org_id)`, `idx_users_auth_id(auth_provider_id)`

### invitations

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | DEFAULT gen_random_uuid() |
| `org_id` | uuid NOT NULL | FK → orgs(id) ON DELETE CASCADE |
| `invited_by` | uuid NOT NULL | FK → users(id) ON DELETE CASCADE |
| `email` | text NOT NULL | Recipient |
| `role` | text NOT NULL | CHECK IN ('admin','member','viewer') |
| `token` | text NOT NULL UNIQUE | crypto.randomUUID() |
| `accepted_at` | timestamptz NULLABLE | Set on acceptance |
| `expires_at` | timestamptz NOT NULL | created_at + 7 days |
| `created_at` | timestamptz NOT NULL | DEFAULT now() |

**Indexes**: `idx_invitations_token(token)`, `idx_invitations_org(org_id)`

---

## Server Actions Inventory

All in `src/lib/actions/auth.ts` — `'use server'` directive.

| Action | Signature | Returns |
|--------|-----------|---------|
| `signUp` | `(input: unknown)` | `{ success: true } \| { error: FieldErrors }` |
| `inviteUser` | `(input: unknown)` | `{ success: true } \| { error: string \| FieldErrors }` |
| `acceptInvite` | `(input: unknown)` | `{ success: true } \| { error: string \| FieldErrors }` |
| `updateMemberRole` | `(input: unknown)` | `{ success: true } \| { error: string \| FieldErrors }` |
| `removeMember` | `(input: unknown)` | `{ success: true } \| { error: string \| FieldErrors }` |

`getAuthUser()` lives in `src/lib/auth.ts` — returns `{ id, email, orgId, role } | null` via `getServerSession`.

---

## Established Patterns

- **Server Action input validation**: Always `safeParse` FIRST before any auth check or DB call — prevents leaking auth status to unauthenticated callers.
- **Admin guard order**: `safeParse → getAuthUser() → role check → business logic` — never skip the order.
- **Compensating saga for email+DB**: Insert invitation row → try send email → on failure DELETE the row. True atomicity impossible across DB+HTTP; this is the established pattern.
- **`queryForOrg` for all org-scoped queries**: Pass `(orgId, userId, sql, params)` — never use raw `query()` for org-scoped data.
- **Forms**: `'use client'` + react-hook-form + zodResolver wired to the matching Zod schema from `src/lib/validations/`. Login uses NextAuth `signIn('credentials', ...)`, not a Server Action.
- **Coverage excludes**: `src/lib/auth.ts`, `src/lib/db/**`, shadcn `src/components/ui/**`, route handlers, layouts, pages — only business logic (actions, validations, form components, shell Client Components) is measured.
- **NextAuth session shape**: JWT + session callbacks embed `id`, `orgId`, `orgName`, `role` — access via `getAuthUser()` in Server Actions, `useSession()` in client components. `orgName` added in module 003 (JOIN with orgs table during authorize).
- **Shell architecture**: Server Component wrappers (Sidebar, Topbar) receive user props from layout and render Client Component children (SidebarNav, UserAvatarMenu, etc.). Server Components cannot be imported by Client Components.
- **Dashboard layout test pattern**: Async Server Components must be called as `await Component({children})` in tests, then `render(jsx)`. Mock `next-auth/next`, shadcn children, and shell components.
- **Shared component imports**: Always import from `@/components/shared` (barrel index), never from individual file paths. All 11 components re-exported from `src/components/shared/index.ts`.
- **DataTable pattern**: TanStack Table v8, `manualPagination: true`, `manualSorting: true`, `getCoreRowModel()` only. Server drives all pagination/sorting. Props: data, columns, isLoading, pageIndex, pageCount, onPageChange, onSortChange, emptyState, onRowClick.
- **CrudForm pattern**: Accepts `UseFormReturn<T>` prop — never calls `useForm()` internally. Consuming page owns Zod schema and `useForm()` call.
- **ACTIVITY_TYPE_CONFIG**: Lives in `src/lib/utils/activity.ts`. The `bg` field encodes both bg + text color as one Tailwind string (e.g. `'bg-blue-100 text-blue-600'`). Apply via `cn(config.bg)`.
- **cn() location**: `src/lib/utils.ts` (not `src/lib/utils/cn.ts`). Import as `@/lib/utils`. Utility files (activity.ts, format.ts) live in `src/lib/utils/`.
- **cmdk jsdom polyfills**: Tests using shadcn Command/OwnerSelect require `ResizeObserver` stub and `scrollIntoView` stub in `beforeAll`.

---

## Active Gotchas

- **`next.config.ts` is unsupported in Next.js 14** — must use `next.config.mjs`. TSC will happily parse `.ts` but Next.js will ignore it silently and use defaults.
- **`test.todo()` not in Playwright's TypeScript types** — use `test('description', async () => {})` with empty body for placeholder E2E tests instead.
- **Coverage includes `scripts/` at 0% unless excluded** — vitest picks up `scripts/migrate.ts` and `scripts/seed.ts` because they're in the project root. Add `include: ['src/**']` to coverage config to scope it properly.
- **Adversarial reviewer may misread DoD wording** — "All forms call the correct Server Action (signUp, acceptInvite)" was flagged as FAIL because login uses NextAuth `signIn()`. The DoD parenthetical names only the two forms that have Server Actions — clarify in future DoDs that login is NextAuth-native.
- **PowerShell `&&` not supported** — use separate statements or Bash tool for chained git commands. `git add "src/app/(auth)/"` must be quoted to prevent PowerShell from interpreting `(auth)` as a subexpression. Same applies to `(dashboard)` route group.
- **DB provider stubs required** — `src/lib/db/index.ts` references `./providers/pg`, `./providers/supabase`, `./providers/neon`. These stubs must exist even if unimplemented or build fails.
- **Async Server Component unit tests** — `DashboardLayout` is `async function`. In Vitest/JSDOM, render it by calling `await DashboardLayout({children})` to get the JSX, then `render(jsx)`. Must mock `next-auth/next` (`getServerSession`), `next/navigation` (`redirect`), and any child Server Components (Sidebar, Topbar).

---

## Planning Status

| # | Module | Spec | Plan | Tasks | Build |
|---|--------|------|------|-------|-------|
| 002 | Auth & Org Management | ✓ | ✓ | ✓ | ✓ DONE |
| 003 | Layout Shell | ✓ | ✓ | ✓ | ✓ DONE |
| 004 | Shared Components | ✓ | ✓ | ✓ | ✓ DONE |
| 005 | Contacts | ✓ | ✓ | ✓ | pending |
| 006 | Leads | ✓ | ✓ | ✓ | pending |
| 007 | Deals + Kanban | ✓ | ✓ | ✓ | pending |
| 008 | Tickets | ✓ | ✓ | ✓ | pending |
| 009 | Activities | ✓ | ✓ | ✓ | pending |
| 010 | Email | ✓ | ✓ | ✓ | pending |
| 011 | Reports | ✓ | ✓ | ✓ | pending |
| 012 | Settings | ✓ | ✓ | ✓ | pending |

**Next up: 005 — Contacts**

---

## Stack Reference

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (multi-provider via `DB_PROVIDER`) |
| Auth | NextAuth v4 (CredentialsProvider + bcryptjs, JWT + org_id + orgName + role) |
| Validation | Zod (every Server Action + form) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Email | Resend |

## Key File Locations

| File | Purpose |
|------|---------|
| `src/lib/db/index.ts` | Provider router — only place to import pg/supabase/neon |
| `src/lib/db/types.ts` | DBProvider type + OrgContext interface |
| `src/lib/auth.ts` | NextAuth config + `getAuthUser()` helper |
| `src/lib/validations/` | Zod schemas (one per entity) |
| `src/lib/actions/` | Server Actions (one file per module) |
| `src/components/shell/` | Dashboard shell components (Sidebar, Topbar, Nav, Avatar, MobileNav) |
| `src/components/shared/` | Shared UI components — check before building any UI |
| `src/components/ui/` | shadcn/ui auto-generated — never edit |
| `db/migrations/` | SQL migration files (000_extensions, 001_tables, 002_rls, ...) |
| `.specify/memory/constitution.md` | Governance principles |
| `docs/BRD.md` | Full requirements |
