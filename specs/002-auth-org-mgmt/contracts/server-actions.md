# Server Action Contracts: Auth & Org Management

**Feature**: 002-auth-org-mgmt

All Server Actions follow this pattern:
1. `getAuthUser()` — auth guard (first line, always)
2. `schema.safeParse(input)` — Zod validation
3. `queryForOrg(orgId, userId, sql, params)` — scoped DB query
4. Return `{ error }` or `{ success, data }`

---

## signUp(input: unknown)

**File**: `src/lib/actions/auth.ts`
**Auth required**: No (public)

**Input**:
```typescript
{
  full_name: string   // min 2, max 100
  org_name:  string   // min 2, max 100
  email:     string   // valid email
  password:  string   // min 8, max 72
}
```

**Success response**:
```typescript
{ success: true }
```

**Error responses**:
```typescript
{ error: { email: ['An account with this email already exists'] } }
{ error: { _form: ['Account creation failed. Please try again.'] } }
{ error: { [field]: string[] } }  // Zod field errors
```

**Side effects**: Creates `orgs` row + `users` row in a single transaction. Role is always `'admin'`.

---

## inviteUser(input: unknown)

**File**: `src/lib/actions/auth.ts`
**Auth required**: Yes — role must be `'admin'`

**Input**:
```typescript
{
  email: string   // valid email
  role:  'admin' | 'member' | 'viewer'
}
```

**Success response**:
```typescript
{ success: true }
```

**Error responses**:
```typescript
{ error: 'Unauthorized' }
{ error: 'Insufficient permissions' }
{ error: { email: ['This person is already a member of your org'] } }
{ error: { _form: ['Failed to send invitation'] } }
```

**Side effects**: Creates `invitations` row. Sends invite email via Resend to `email` with a link to `/invite/[token]`.

---

## acceptInvite(input: unknown)

**File**: `src/lib/actions/auth.ts`
**Auth required**: No (public — invitee is not yet a user)

**Input**:
```typescript
{
  token:     string   // invitation token from URL
  full_name: string   // min 2, max 100
  password:  string   // min 8, max 72
}
```

**Success response**:
```typescript
{ success: true }
```

**Error responses**:
```typescript
{ error: 'Invitation not found or already used' }
{ error: 'This invitation has expired' }
{ error: { _form: ['Failed to create account'] } }
```

**Side effects**: Creates `users` row with `org_id` and `role` from invitation. Sets `invitations.accepted_at = now()`. Does NOT auto-login — client redirects to `/login`.

---

## updateMemberRole(input: unknown)

**File**: `src/lib/actions/auth.ts`
**Auth required**: Yes — role must be `'admin'`

**Input**:
```typescript
{
  userId: string   // target user's id
  role:   'admin' | 'member' | 'viewer'
}
```

**Success response**:
```typescript
{ success: true }
```

**Error responses**:
```typescript
{ error: 'Unauthorized' }
{ error: 'Insufficient permissions' }
{ error: 'Cannot demote the last admin' }
{ error: 'User not found in your org' }
```

**Side effects**: Updates `users.role`. Takes effect on the target user's next Server Action (JWT is not immediately invalidated — see note below).

> **Note on JWT invalidation**: NextAuth JWTs are stateless. Role changes take effect on the member's next login or session refresh (up to JWT expiry). For immediate enforcement, the action also sets a `role_updated_at` timestamp that Server Actions can check against session issue time. This is a known limitation of stateless JWTs and is acceptable for v1.

---

## removeMember(input: unknown)

**File**: `src/lib/actions/auth.ts`
**Auth required**: Yes — role must be `'admin'`

**Input**:
```typescript
{
  userId: string   // target user's id
}
```

**Success response**:
```typescript
{ success: true }
```

**Error responses**:
```typescript
{ error: 'Unauthorized' }
{ error: 'Insufficient permissions' }
{ error: 'Cannot remove the last admin' }
{ error: 'Cannot remove yourself' }
{ error: 'User not found in your org' }
```

**Side effects**: Deletes `users` row (CASCADE deletes org-scoped records per FK). The removed user's JWT remains valid until expiry but all Server Actions will return `'Unauthorized'` because `getAuthUser()` queries the DB to verify org membership.

---

## getAuthUser() — Helper (not a Server Action)

**File**: `src/lib/auth.ts`
**Used by**: Every Server Action as first line

**Returns**:
```typescript
{
  id:    string
  email: string
  orgId: string
  role:  'admin' | 'member' | 'viewer'
} | null
```

Returns `null` if no valid session exists. Server Actions must return `{ error: 'Unauthorized' }` immediately when `null`.
