# FreshCRM System State

> **READ THIS BEFORE STARTING ANY MODULE.**
> This is the live handoff document. Updated by `/speckit-handoff` after each module merges.

---

## Completed Modules

| # | Module | Summary | Branch |
|---|--------|---------|--------|
| 002 | Auth & Org Management | NextAuth CredentialsProvider + JWT, 5 Server Actions, auth pages (login/signup/invite), 66 unit tests, 6 E2E specs | feat/auth-actions |

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
- **Coverage excludes**: `src/lib/auth.ts`, `src/lib/db/**`, shadcn `src/components/ui/**`, route handlers, layouts, pages — only business logic (actions, validations, form components) is measured.
- **NextAuth session shape**: JWT + session callbacks embed `id`, `orgId`, `role` — access via `getAuthUser()` in Server Actions, `useSession()` in client components.

---

## Active Gotchas

- **`next.config.ts` is unsupported in Next.js 14** — must use `next.config.mjs`. TSC will happily parse `.ts` but Next.js will ignore it silently and use defaults.
- **`test.todo()` not in Playwright's TypeScript types** — use `test('description', async () => {})` with empty body for placeholder E2E tests instead.
- **Coverage includes `scripts/` at 0% unless excluded** — vitest picks up `scripts/migrate.ts` and `scripts/seed.ts` because they're in the project root. Add `include: ['src/**']` to coverage config to scope it properly.
- **Adversarial reviewer may misread DoD wording** — "All forms call the correct Server Action (signUp, acceptInvite)" was flagged as FAIL because login uses NextAuth `signIn()`. The DoD parenthetical names only the two forms that have Server Actions — clarify in future DoDs that login is NextAuth-native.
- **PowerShell `&&` not supported** — use separate statements or Bash tool for chained git commands. `git add "src/app/(auth)/"` must be quoted to prevent PowerShell from interpreting `(auth)` as a subexpression.
- **DB provider stubs required** — `src/lib/db/index.ts` references `./providers/pg`, `./providers/supabase`, `./providers/neon`. These stubs must exist even if unimplemented or build fails.

---

## Planning Status

| # | Module | Spec | Plan | Tasks | Build |
|---|--------|------|------|-------|-------|
| 002 | Auth & Org Management | ✓ | ✓ | ✓ | ✓ DONE |
| 003 | Layout Shell | ✓ | ✓ | ✓ | pending |
| 004 | Shared Components | ✓ | ✓ | ✓ | pending |
| 005 | Contacts | ✓ | ✓ | ✓ | pending |
| 006 | Leads | ✓ | ✓ | ✓ | pending |
| 007 | Deals + Kanban | ✓ | ✓ | ✓ | pending |
| 008 | Tickets | ✓ | ✓ | ✓ | pending |
| 009 | Activities | ✓ | ✓ | ✓ | pending |
| 010 | Email | ✓ | ✓ | ✓ | pending |
| 011 | Reports | ✓ | ✓ | ✓ | pending |
| 012 | Settings | ✓ | ✓ | ✓ | pending |

**Next up: 003 — Layout Shell**

---

## Stack Reference

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (multi-provider via `DB_PROVIDER`) |
| Auth | NextAuth v4 (CredentialsProvider + bcryptjs, JWT + org_id + role) |
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
| `src/components/shared/` | Shared UI components — check before building any UI |
| `src/components/ui/` | shadcn/ui auto-generated — never edit |
| `db/migrations/` | SQL migration files (000_extensions, 001_tables, 002_rls, ...) |
| `.specify/memory/constitution.md` | Governance principles |
| `docs/BRD.md` | Full requirements |
