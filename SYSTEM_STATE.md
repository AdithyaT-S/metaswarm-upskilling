# FreshCRM System State

> **READ THIS BEFORE STARTING ANY MODULE.**
> This is the live handoff document. Updated by `/speckit-handoff` after each module merges.

---

## Completed Modules

_(none yet)_

---

## Database Schema

_(none yet — populated as migrations are written and merged)_

---

## Server Actions Inventory

_(none yet — populated after each module's actions are implemented)_

---

## Established Patterns

_(none yet — populated from plan.md + research.md after each module)_

---

## Active Gotchas

_(none yet — populated from implementation discoveries)_

---

## Next Up

- [ ] **001-auth** — Authentication & Org Management (BRD §4.1)
  - Email + password signup with org creation
  - Login / logout / session refresh
  - Role-based access: admin, member, viewer
  - Invite team members by email
  - Supabase Auth JWT with `org_id` claim

---

## Stack Reference

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (multi-provider via `DB_PROVIDER`) |
| Auth | Supabase Auth (JWT + org_id claim) |
| Validation | Zod (every Server Action + form) |
| Testing | Vitest (unit) + Playwright (E2E) |
| Email | Resend |

## Key File Locations

| File | Purpose |
|------|---------|
| `src/lib/db/index.ts` | Provider router — only place to import pg/supabase/neon |
| `src/lib/db/types.ts` | DBProvider type + OrgContext interface |
| `src/lib/validations/` | Zod schemas (one per entity) |
| `src/lib/actions/` | Server Actions (one file per module) |
| `src/components/shared/` | Shared UI components — check before building any UI |
| `src/components/ui/` | shadcn/ui auto-generated — never edit |
| `supabase/migrations/` | SQL migration files |
| `.specify/memory/constitution.md` | Governance principles |
| `docs/BRD.md` | Full requirements |
