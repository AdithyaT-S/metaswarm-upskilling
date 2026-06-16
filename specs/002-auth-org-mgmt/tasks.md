# Tasks: Auth & Org Management

**Feature**: 002-auth-org-mgmt
**Date**: 2026-06-16
**Depends on**: — (first module)
**Blocks**: all other modules

---

## Phase 0: Scaffold

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-0.1 | Initialise Next.js 14 app: `pnpm create next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"` | No | — |
| T-0.2 | Install dependencies: `next-auth bcryptjs @types/bcryptjs zod react-hook-form @hookform/resolvers resend tsx` | No | T-0.1 |
| T-0.3 | Install shadcn/ui: `npx shadcn-ui@latest init` then add `card input label button form toast` | No | T-0.1 |
| T-0.4 | Verify `src/lib/db/index.ts` provider router (already scaffolded — confirm `queryForOrg` signature matches actions) | Yes (with T-0.2) | T-0.1 |
| T-0.5 | Add `db:migrate`, `db:seed`, `db:migrate:reset`, `db:status` scripts to `package.json` (scripts already exist at `scripts/migrate.ts` + `scripts/seed.ts`) | Yes | T-0.2 |
| T-0.6 | Configure `.env.local`: set `DATABASE_URL`, `DB_PROVIDER=local`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Run `npm run db:migrate` to apply all pre-written migrations (000–004_settings). | No | T-0.2, T-0.5 |
| T-0.7 | Run `npm run db:seed` to seed demo org + 2 users + full CRM data. Verify login: `admin@demo.com / password123` | No | T-0.6 |
| T-0.8 | Re-enable `.github/workflows/ci.yml` (rename from `.disabled`) | Yes | T-0.1 |

---

## Phase 1: NextAuth Config

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-1.1 | Write `src/lib/auth.ts` — NextAuth config: CredentialsProvider, authorize callback (bcrypt compare), JWT callback (embed id/orgId/role/orgName), session callback | No | T-0.2, T-0.4 |
| T-1.2 | Write `src/app/api/auth/[...nextauth]/route.ts` — NextAuth route handler | No | T-1.1 |
| T-1.3 | Write `src/middleware.ts` — withAuth middleware protecting `(dashboard)` route group | No | T-1.1 |
| T-1.4 | Write `src/lib/validations/auth.ts` — Zod schemas: signUpSchema, loginSchema, inviteSchema | Yes (with T-1.1) | T-0.2 |

---

## Phase 2: Server Actions

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-2.1 | Write `src/lib/actions/auth.ts` — signUp (atomic: insert org + user + hash password), signIn redirect, inviteUser, acceptInvite, updateMemberRole, removeMember | No | T-1.1, T-1.4, T-0.6 |

---

## Phase 3: Auth Pages

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-3.1 | Write `src/app/(auth)/layout.tsx` — minimal centered layout | No | T-0.3 |
| T-3.2 | Write `src/app/(auth)/login/page.tsx` + `LoginForm.tsx` — email/password form, `signIn()` call | Yes | T-2.1, T-3.1 |
| T-3.3 | Write `src/app/(auth)/signup/page.tsx` + `SignupForm.tsx` — full name, org name, email, password + confirm | Yes | T-2.1, T-3.1 |
| T-3.4 | Write `src/app/(auth)/invite/[token]/page.tsx` — accept invite form (set password) | Yes | T-2.1, T-3.1 |

---

## Phase 4: Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-4.1 | Write unit tests — signUp action (success, dup email, dup org), signIn (valid, invalid password, unknown user), role guard (viewer blocked) | No | T-2.1 |
| T-4.2 | Write E2E tests — full signup→login→logout flow; invite flow (invite→accept→login) | Yes (with T-4.1) | T-3.2, T-3.3 |

---

## Swarm Agent Assignment

| Agent | Tasks |
|---|---|
| architect | T-1.1 (NextAuth config) |
| coder | T-0.1–T-0.8, T-1.2–T-1.4, T-2.1, T-3.1–T-3.4 |
| test-automator | T-4.1, T-4.2 |
| code-review | Verify bcrypt cost=12, JWT claims include orgName, RLS applied to orgs+users+invitations |
