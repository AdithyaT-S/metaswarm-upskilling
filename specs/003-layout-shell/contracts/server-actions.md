# Server Action Contracts: Layout Shell

**Feature**: 003-layout-shell
**Date**: 2026-06-16

---

## No Server Actions

The Layout Shell has **no Server Actions**.

The shell is a read-only UI wrapper. All data comes from the existing NextAuth session (no DB queries needed). The one write operation — logout — is handled by NextAuth's built-in `signOut()` client call, not a custom Server Action.

---

## Client-Side Operations

### Logout

**Trigger**: User clicks "Log out" in the avatar dropdown menu.

**Implementation**: Call `signOut({ callbackUrl: '/login' })` from `next-auth/react` in a Client Component.

**Not a Server Action** — NextAuth handles session teardown and redirect internally.

### Search Navigation

**Trigger**: User submits the topbar search input.

**Implementation**: Client Component calls `router.push('/contacts?search=' + encodeURIComponent(query))` on form submit (Enter key or submit button).

**Not a Server Action** — pure client-side navigation.

---

## Interfaces Consumed from Auth Module

The shell reads the session via `getServerSession(authOptions)` (Server Component) or `useSession()` (Client Component). These are NextAuth APIs, not FreshCRM Server Actions.

```ts
// Server Component usage (e.g. DashboardLayout)
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
// session.user.name, session.user.orgName, session.user.image available
```
