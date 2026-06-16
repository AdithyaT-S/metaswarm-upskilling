# Research: Auth & Org Management

**Date**: 2026-06-16
**Feature**: 002-auth-org-mgmt

---

## Decision 1: Auth Library — NextAuth (Auth.js) v4, NOT Supabase Auth

**Decision**: Use NextAuth v4 with CredentialsProvider + bcryptjs. Do NOT use Supabase Auth JWT.

**Rationale**: The reference implementation (`C:\Works\anticlock`) uses NextAuth throughout. The BRD mentions "Supabase Auth JWT" but the actual implementation proves NextAuth works cleanly with the multi-provider DB abstraction. Supabase Auth would create a hard dependency on Supabase as the auth provider, violating the provider-switching goal (BRD G5). NextAuth + local Postgres keeps auth provider-agnostic.

**Alternatives considered**:
- Supabase Auth JWT — rejected: requires Supabase-specific session handling; breaks provider isolation
- Auth.js v5 (beta) — rejected: API is unstable; reference project uses v4
- Lucia Auth — rejected: less ecosystem support; reference project not using it

**Key implementation facts from reference**:
```typescript
// src/lib/auth.ts pattern
session: { strategy: 'jwt' }
// JWT stores: id, orgId, role
// getAuthUser() → { id, email, orgId, role } | null
```

---

## Decision 2: Password Hashing — bcryptjs at cost factor 12

**Decision**: `bcrypt.hash(password, 12)` via `bcryptjs` npm package.

**Rationale**: bcrypt is the industry standard for password hashing. Cost factor 12 balances security and performance (~300ms on modern hardware). Reference implementation uses this exact configuration.

**Alternatives considered**:
- Argon2 — stronger but requires native bindings; bcrypt is simpler in Next.js serverless
- scrypt — similar tradeoff; bcrypt has wider ecosystem support

---

## Decision 3: Session Strategy — JWT (stateless)

**Decision**: `session: { strategy: 'jwt' }` in NextAuth config. No database session storage.

**Rationale**: Stateless JWTs work across serverless deployments (Vercel) without a Redis/DB session store. The JWT carries `id`, `orgId`, `role` — all that Server Actions need. Reference implementation uses this strategy.

**JWT payload shape**:
```typescript
interface JWT {
  id: string       // users.id
  orgId: string    // users.org_id
  role: 'admin' | 'member' | 'viewer'
}
```

**Alternatives considered**:
- Database sessions — rejected: requires session table, adds latency, complicates deployments

---

## Decision 4: Route Protection — NextAuth Middleware (`withAuth`)

**Decision**: Use `withAuth` from `next-auth/middleware` in `src/middleware.ts`.

**Rationale**: Single file protects all routes. The matcher pattern excludes `/login`, `/signup`, `api/auth`, `_next/static`, `_next/image`, `favicon.ico`. Reference implementation uses this exact pattern.

**Matcher pattern**:
```typescript
matcher: ['/((?!login|signup|api/auth|_next/static|_next/image|favicon\\.ico).*)']
```

---

## Decision 5: Signup — Atomic Transaction (Org + User)

**Decision**: Create org and user in a single `transaction()` call. If either fails, both are rolled back.

**Rationale**: Prevents orphaned orgs (org created, user insert fails) or orphaned users (user without org). Reference implementation uses `transaction(async (q) => { ... })` pattern.

**Org slug generation**: `slugify(org_name) + random 5-char suffix` → guarantees uniqueness without a separate lookup.

---

## Decision 6: Team Invitations — New Feature (Not in Reference)

**Decision**: Implement invitations as a separate `invitations` table with a unique token + 7-day expiry. Send invite email via Resend. Accept via a `/invite/[token]` page.

**Rationale**: The reference project did not implement invitations. This is new scope from BRD §4.1. The pattern follows standard SaaS invite flows: generate token → email link → accept → create user record.

**Invitation table fields**:
- `id` (uuid PK)
- `org_id` (uuid FK → orgs)
- `invited_by` (uuid FK → users)
- `email` (text) — recipient
- `role` (text) — admin/member/viewer
- `token` (text UNIQUE) — secure random token
- `accepted_at` (timestamptz) — null until accepted
- `expires_at` (timestamptz) — created_at + 7 days
- `created_at` (timestamptz)

**Token generation**: `crypto.randomUUID()` or `crypto.getRandomValues()` — URL-safe, unguessable.

---

## Decision 7: Role Enforcement — Server Action Guard Pattern

**Decision**: Every Server Action begins with `const user = await getAuthUser(); if (!user) return { error: 'Unauthorized' }`. Role checks come immediately after.

**Rationale**: Defense-in-depth. Middleware blocks unauthenticated users at the edge; Server Actions re-verify on every mutation. Role is read from the JWT (not from a DB query) to avoid a round-trip on every action.

**Pattern**:
```typescript
export async function someAction(input: unknown) {
  const user = await getAuthUser()
  if (!user) return { error: 'Unauthorized' }
  if (user.role !== 'admin') return { error: 'Insufficient permissions' }
  // ... proceed
}
```

---

## Decision 8: No `password_hash` in users table — Stored Directly

**Decision**: Add `password_hash text` column to the `users` table. Nullable to support future OAuth users (auth_provider_id path).

**Rationale**: Reference implementation selects `password_hash` from users. The `auth_provider_id` column allows future social login without schema changes.
