# Data Model: Layout Shell

**Feature**: 003-layout-shell
**Date**: 2026-06-16

---

## Database Changes

**None.** The Layout Shell has no new DB tables, columns, or migrations.

All data displayed in the shell (user name, org name, avatar URL) is read directly from the NextAuth session JWT. This JWT is populated during login/signup by the auth module.

---

## Session Data Contract

The shell depends on these fields being present in the NextAuth session token (populated by 002-auth):

```ts
interface SessionUser {
  id: string       // UUID — user's DB row ID
  email: string    // user's email
  name: string     // user's full name — shown in sidebar + avatar dropdown
  orgId: string    // UUID — org the user belongs to
  orgName: string  // org's display name — shown in sidebar + avatar dropdown
  role: string     // 'owner' | 'admin' | 'member'
  image?: string   // avatar URL (optional) — falls back to initials if absent
}
```

**Inter-module dependency**: The `orgName` field is NOT part of NextAuth defaults. The auth module's `authorize` callback and JWT callback MUST be updated to include `orgName`. If `orgName` is missing from the token, the shell falls back to an empty string (silent graceful degradation).

---

## Static Nav Config

The nav items are defined in code (not DB). Structure:

```ts
interface NavItem {
  label: string    // e.g. "Contacts"
  href: string     // e.g. "/contacts"
  icon: string     // Lucide icon name, e.g. "Users"
}
```

Fixed set (7 items):
| label | href | icon |
|---|---|---|
| Dashboard | /dashboard | LayoutDashboard |
| Contacts | /contacts | Users |
| Leads | /leads | UserPlus |
| Deals | /deals | Handshake |
| Tickets | /tickets | Ticket |
| Reports | /reports | BarChart3 |
| Settings | /settings | Settings |
