# Quickstart: Auth & Org Management

**Feature**: 002-auth-org-mgmt
**Prerequisites**: Docker running, `.env.local` configured, Next.js app initialized

---

## Setup

```bash
# 1. Start local Postgres
docker-compose up -d

# 2. Run auth migrations (000_extensions + 001_tables + 002_rls)
pnpm tsx scripts/migrate.ts

# 3. Start dev server
pnpm dev
```

`.env.local` required variables:
```
DB_PROVIDER=local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/freshcrm
NEXTAUTH_SECRET=<any-random-string-for-local>
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=<your-resend-key>   # needed for invite emails
INVITE_FROM_EMAIL=noreply@yourapp.com
```

---

## Validation Scenarios

### 1. Signup flow
1. Navigate to `http://localhost:3000/signup`
2. Fill: Full Name = "Alice Admin", Org Name = "Test Corp", Email = `alice@test.com`, Password = `password123`
3. Submit → redirected to `/dashboard`
4. **Expected**: org "Test Corp" created, Alice is admin, dashboard loads

### 2. Login + session persistence
1. Log out (`/api/auth/signout`)
2. Navigate to `http://localhost:3000/login`
3. Enter credentials → submit → redirected to `/dashboard`
4. Close browser tab, reopen `http://localhost:3000`
5. **Expected**: lands on `/dashboard` without login prompt (session persists)

### 3. Auth redirect
1. Log out
2. Navigate directly to `http://localhost:3000/contacts`
3. **Expected**: redirected to `/login?callbackUrl=%2Fcontacts`
4. Log in → **Expected**: lands on `/contacts`

### 4. Signup duplicate email
1. Try signing up with `alice@test.com` again
2. **Expected**: form shows "An account with this email already exists"

### 5. Invite flow
1. Log in as Alice (admin)
2. Navigate to `/settings/team` → click "Invite Member"
3. Enter email = `bob@test.com`, role = "Member" → submit
4. **Expected**: invite email sent, invitation record created
5. Open invite link from email → fill Full Name + Password → submit
6. **Expected**: Bob's account created with Member role, redirected to `/login`
7. Log in as Bob → **Expected**: dashboard loads, Bob is scoped to "Test Corp" org

### 6. Expired invite
1. In DB: `UPDATE invitations SET expires_at = now() - interval '1 day' WHERE email = 'bob@test.com'`
2. Navigate to the invite link
3. **Expected**: "This invitation has expired" message

### 7. Role enforcement
1. Log in as Bob (member)
2. Navigate to `/settings/team`
3. **Expected**: redirected with "Insufficient permissions" — cannot access team management

### 8. Last admin guard
1. Log in as Alice (only admin)
2. Try to change own role to Member via Settings
3. **Expected**: blocked with "There must be at least one admin in the org"

---

## Unit Test Coverage Targets

Per constitution (≥80% overall, every Server Action):

| Action | Test cases required |
|--------|-------------------|
| `signUp` | valid input ✓, duplicate email ✓, weak password ✓, DB error ✓ |
| `inviteUser` | valid ✓, not admin ✓, already member ✓, send failure ✓ |
| `acceptInvite` | valid ✓, expired token ✓, already used ✓, not found ✓ |
| `updateMemberRole` | valid ✓, not admin ✓, last admin guard ✓, user not in org ✓ |
| `removeMember` | valid ✓, not admin ✓, last admin guard ✓, remove self ✓ |
| Zod schemas | valid ✓, email format ✓, password length ✓, role enum ✓ |

---

## E2E Test Flows (Playwright)

| Flow | File |
|------|------|
| Signup → dashboard | `e2e/auth/signup.spec.ts` |
| Login → persist session | `e2e/auth/login.spec.ts` |
| Logout → redirect | `e2e/auth/logout.spec.ts` |
| Unauthenticated redirect | `e2e/auth/redirect.spec.ts` |
| Invite → accept → login | `e2e/auth/invite.spec.ts` |
| Role enforcement (viewer) | `e2e/auth/rbac.spec.ts` |
