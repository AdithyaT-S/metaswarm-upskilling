# Data Model: Auth & Org Management

**Feature**: 002-auth-org-mgmt
**Date**: 2026-06-16

---

## Entities

### orgs

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | |
| `name` | text | NOT NULL | Display name, e.g. "Acme Corp" |
| `slug` | text | NOT NULL, UNIQUE | URL-safe, e.g. "acme-corp-a1b2c" |
| `plan` | text | NOT NULL, DEFAULT 'free', CHECK IN ('free','pro','enterprise') | |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | |

### users

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | |
| `org_id` | uuid | NOT NULL, FK → orgs(id) ON DELETE CASCADE | |
| `auth_provider_id` | text | UNIQUE, NULLABLE | For future social/OAuth login |
| `email` | text | NOT NULL | |
| `full_name` | text | NOT NULL, DEFAULT '' | |
| `avatar_url` | text | NULLABLE | |
| `role` | text | NOT NULL, DEFAULT 'member', CHECK IN ('admin','member','viewer') | |
| `password_hash` | text | NULLABLE | bcrypt hash; null for OAuth-only users |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | |
| `updated_at` | timestamptz | NOT NULL, DEFAULT now() | |

**Unique constraint**: `(org_id, email)`

**Indexes**:
- `idx_users_org` ON `users(org_id)`
- `idx_users_auth_id` ON `users(auth_provider_id)`

### invitations

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK, DEFAULT gen_random_uuid() | |
| `org_id` | uuid | NOT NULL, FK → orgs(id) ON DELETE CASCADE | |
| `invited_by` | uuid | NOT NULL, FK → users(id) ON DELETE CASCADE | |
| `email` | text | NOT NULL | Recipient email |
| `role` | text | NOT NULL, CHECK IN ('admin','member','viewer') | Assigned role on accept |
| `token` | text | NOT NULL, UNIQUE | Secure random UUID |
| `accepted_at` | timestamptz | NULLABLE | Set when invitation is accepted |
| `expires_at` | timestamptz | NOT NULL | created_at + 7 days |
| `created_at` | timestamptz | NOT NULL, DEFAULT now() | |

**Indexes**:
- `idx_invitations_token` ON `invitations(token)`
- `idx_invitations_org` ON `invitations(org_id)`

---

## State Transitions

### Invitation lifecycle

```
PENDING (accepted_at IS NULL, expires_at > now())
    ↓ invitee opens link and sets password
ACCEPTED (accepted_at IS NOT NULL)
    ↓ invitee becomes a user in the org

EXPIRED (accepted_at IS NULL, expires_at < now())
    ↓ admin resends → new invitation record created (old stays)
```

### User role transitions (admin only)

```
admin → member (allowed if ≥2 admins in org)
admin → viewer (allowed if ≥2 admins in org)
member → admin
member → viewer
viewer → admin
viewer → member
```

**Guard**: `SELECT COUNT(*) FROM users WHERE org_id = $1 AND role = 'admin'` must be ≥ 2 before demoting an admin.

---

## RLS Policies

All tables require Row Level Security. The `current_org_id()` helper function reads `org_id` from the session context set at the start of each connection.

```sql
-- orgs: users can only read their own org
CREATE POLICY orgs_isolation ON orgs
  USING (id = current_org_id());

-- users: scoped to org
CREATE POLICY users_isolation ON users
  USING (org_id = current_org_id());

-- invitations: scoped to org
CREATE POLICY invitations_isolation ON invitations
  USING (org_id = current_org_id());
```

---

## Validation Rules (Zod)

### signupSchema
```
full_name:  string, min 2, max 100
org_name:   string, min 2, max 100
email:      string, valid email format
password:   string, min 8, max 72 (bcrypt limit)
```

### loginSchema
```
email:      string, valid email format
password:   string, min 8
```

### inviteSchema
```
email:      string, valid email format
role:       enum ['admin', 'member', 'viewer']
```

### acceptInviteSchema
```
token:      string, non-empty
full_name:  string, min 2, max 100
password:   string, min 8, max 72
```
