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

## Planning Status

| # | Module | Spec | Plan | Tasks | Build |
|---|--------|------|------|-------|-------|
| 002 | Auth & Org Management | ✓ | ✓ | ✓ | pending |
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

**All 11 modules planned. Ready to build in BRD §9 order starting with 002-auth.**

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
| `src/lib/validations/` | Zod schemas (one per entity) |
| `src/lib/actions/` | Server Actions (one file per module) |
| `src/components/shared/` | Shared UI components — check before building any UI |
| `src/components/ui/` | shadcn/ui auto-generated — never edit |
| `db/migrations/` | SQL migration files (000_extensions, 001_tables, 002_rls, ...) |
| `.specify/memory/constitution.md` | Governance principles |
| `docs/BRD.md` | Full requirements |
