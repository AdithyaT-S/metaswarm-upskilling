# Active Plan — 002-auth-org-mgmt
<!-- approved: 2026-06-16 -->
<!-- gate-iterations: 0 -->
<!-- user-approved: true -->
<!-- status: in-progress -->

## Work Unit Decomposition

| WU | Beads ID | Title | Deps | Files |
|----|----------|-------|------|-------|
| WU-001 | anticlock-metaswarm-fap | Next.js scaffold + shadcn setup | — | package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs, vitest.config.ts, playwright.config.ts, components.json, src/lib/utils.ts, src/components/ui/*, src/app/layout.tsx, src/app/page.tsx |
| WU-002 | anticlock-metaswarm-3r5 | NextAuth config + Zod schemas + middleware | WU-001 | src/lib/auth.ts, src/app/api/auth/[...nextauth]/route.ts, src/middleware.ts, src/lib/validations/auth.ts |
| WU-003 | anticlock-metaswarm-wp5 | Server Actions | WU-002 | src/lib/actions/auth.ts |
| WU-004 | anticlock-metaswarm-f7h | Auth pages | WU-003 | src/app/(auth)/layout.tsx, src/app/(auth)/login/page.tsx, src/app/(auth)/login/LoginForm.tsx, src/app/(auth)/signup/page.tsx, src/app/(auth)/signup/SignupForm.tsx, src/app/(auth)/invite/[token]/page.tsx, src/app/(dashboard)/layout.tsx, src/app/(dashboard)/dashboard/page.tsx |
| WU-005 | anticlock-metaswarm-31w | Unit + E2E tests | WU-003 | src/__tests__/auth/schemas.test.ts, src/__tests__/auth/actions.test.ts, e2e/auth/*.spec.ts |

## DoD Items (module level)
- [ ] pnpm install succeeds
- [ ] pnpm tsc --noEmit passes
- [ ] pnpm vitest run passes with ≥80% coverage
- [ ] signUp / signIn / logout flow works
- [ ] Invite flow works (token → accept → login)
- [ ] Role guards enforced (admin-only actions return 'Unauthorized' for non-admin)
- [ ] Last-admin guard prevents demoting/removing sole admin
- [ ] Middleware redirects unauthenticated users to /login

## Coverage Thresholds
lines: 80, branches: 80, functions: 80, statements: 80

## Constitution Constraints
- Provider isolation: no pg/supabase-js/neon outside src/lib/db/
- Multi-tenancy: queryForOrg() for all org-scoped queries
- Zod everywhere: every SA input validated
- No `any` except raw DB row boundaries
- TypeScript strict mode
