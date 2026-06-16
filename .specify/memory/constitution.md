# FreshCRM Constitution

## Core Principles

### I. TypeScript Strict — No `any` Leakage
All code targets TypeScript 5 with `strict: true`. `any` is permitted only at raw DB row
boundaries (the return of `query<T>()` before casting to a typed interface). Structured data
crossing a function boundary more than once MUST use a Zod schema or a TypeScript interface —
never a bare `unknown` cast. Generated DB types live in `src/types/db.ts` and are never
hand-written.

**Rationale**: Strict types catch multi-tenant data shape bugs before runtime in a codebase
that evolves rapidly via AI-assisted iteration.

### II. YAGNI — No Premature Abstraction (NON-NEGOTIABLE)
Three similar lines beat a new helper, wrapper, or config flag. A shared module MAY be
extracted only when the same logic is needed in 2+ places. Generic "framework" code for a
single use case, feature toggles for hypothetical requirements, and pass-through wrapper
classes are PROHIBITED. Dead code MUST be deleted, not retained.

**Rationale**: Speculative abstractions accumulate faster than they pay off and make spec/plan
verification harder.

### III. Provider Architecture — SDK Isolation
`src/lib/db/index.ts` is the ONLY file that imports `pg`, `supabase-js`, or `neon`. All
application code (Server Actions, pages, components) calls `queryForOrg()` — never raw SDK
methods. Provider is selected via `DB_PROVIDER` env var: `local | rds | supabase | neon |
railway`. Scattered `if (process.env.DB_PROVIDER === 'x')` branching in application code is
PROHIBITED.

**Rationale**: G5 goal — switching DB provider in < 5 minutes with a single env var change,
zero application code change.

### IV. Multi-Tenancy — Every Query Scoped (NON-NEGOTIABLE)
Every DB query passes `orgId` from the authenticated session — never from user input or
request body. `queryForOrg(orgId, userId, sql, params)` is the standard pattern.
`current_org_id()` RLS enforced on every table (see `rls-policy` skill). Tests MUST verify
cross-org data is never returned. Any PR that queries without `org_id` scoping is blocked.

**Rationale**: G4 goal — no data leakage between tenants, verified by tests.

### V. Zod at Every Boundary
Every Server Action calls `schema.safeParse(input)` before any DB mutation. Every form uses
`zodResolver(schema)` via react-hook-form — no manual `if (!email)` guards. Zod schemas live
in `src/lib/validations/<entity>.ts`. `safeParse` is used (not `parse`) — return `{ error }`
to client, never throw unhandled errors to the browser.

**Rationale**: Prevents unvalidated input from reaching the DB and creates a consistent,
testable validation layer.

### VI. Auth Guard First
Every Server Action's first statement: `const user = await getAuthUser(); if (!user) return { error: 'Unauthorized' }`.
Every API route handler checks auth before any DB call. `org_id` always comes from
`user.org_id` in the session — never from the request body.

**Rationale**: Defense-in-depth. RLS is a backstop, not the first line of defense.

### VII. Test Gates (NON-NEGOTIABLE)
≥80% unit test coverage enforced in CI — PR blocked if below. Every Server Action has unit
tests covering: valid input ✓ | invalid input ✓ | auth guard ✓ | success ✓ | DB error ✓.
Every user-facing page or flow has a Playwright E2E test. Bug fixes MUST include a regression
test. Tests co-located in `__tests__/` next to the module they test.

**Rationale**: Coverage gates are the primary defense against AI-generated regressions.

### VIII. Stitch-First UI (NON-NEGOTIABLE)
Every frontend page and component is built from the Stitch design reference (Project ID: `10851584638320860726`).
Before writing any UI code, fetch the relevant screen via the `stitch-design` skill. Component names in
code MUST match Stitch: `DataTable`, `KanbanCard`, `StatusBadge`, `ActivityTimeline`, `CrudForm`.
Color: Indigo `#4F46E5` primary. Font: Inter. Background: `gray-50`. Surfaces: white.
Auth pages have no Stitch screen — use shadcn Card, `max-w-md mx-auto mt-24`.
See `docs/Stitch Instructions.md` for all screen IDs and `docs/STITCH_PROMPTS.md` for context.

**Rationale**: Consistent pixel-accurate UI across all modules without per-module design decisions.

## Technology & Architecture Constraints

- **Framework**: Next.js 14 App Router — no Pages Router, no `getServerSideProps`
- **Data fetching**: Server Components for reads; Server Actions for mutations; no `useEffect` for data loading
- **Styling**: Tailwind CSS only — no hardcoded hex values, no CSS modules, no inline styles
- **Components**: shadcn/ui in `src/components/ui/` (never edit); shared components in `src/components/shared/` (check before building)
- **Email**: Resend for transactional; inbound via webhook (never direct SMTP)
- **Auth**: Supabase Auth JWT with `org_id` custom claim — no other auth libraries

## Development Workflow & Quality Gates

Every PR MUST satisfy before merge:
1. `npx tsc --noEmit` passes with zero errors
2. `npx vitest run --coverage` passes with ≥80% coverage
3. `npx playwright test` passes — no skipped critical flows
4. No SDK import (`pg`, `supabase-js`, `neon`) outside `src/lib/db/`
5. No query without `org_id` scoping
6. No Server Action without auth guard as first statement
7. `/speckit-handoff` run after implementation — `SYSTEM_STATE.md` updated

For spec-driven work, `/speckit-plan` MUST include a Constitution Check gate verifying the
plan against Principles III–VI before Phase 0 research, and re-verify after Phase 1 design.

## Governance

This constitution supersedes ad-hoc conventions where they conflict. `SYSTEM_STATE.md` is the
live runtime complement — it tracks what exists; this document tracks what rules apply.

**Amendment procedure**: Direct edit + PR. Update version and Last Amended date. Changes to a
MUST/PROHIBITED rule require updating both this file and `SYSTEM_STATE.md` if affected.

**Version**: 1.0.0 | **Ratified**: 2026-06-16 | **Last Amended**: 2026-06-16
