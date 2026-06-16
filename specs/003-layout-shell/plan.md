# Implementation Plan: Layout Shell

**Feature**: 003-layout-shell
**Date**: 2026-06-16
**Depends on**: 002-auth (NextAuth session with `orgName` in JWT)
**Blocks**: 004-shared-components, all UI modules (004–011)

---

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. TypeScript Strict | PASS | All components typed; no `any` |
| II. YAGNI | PASS | No collapsible sidebar, no real notifications — v1 only |
| III. Provider Architecture | PASS | No DB calls in shell; `queryForOrg` not used |
| IV. Multi-Tenancy | PASS | `orgId` flows through session; no standalone queries to scope |
| V. Zod at Every Boundary | PASS | No Server Actions; search is client-side nav only |
| VI. Auth Guard First | PASS | `(dashboard)` layout calls `getServerSession` at top; redirects if null |
| VII. Test Gates | PASS | E2E covers logout + nav; unit tests cover active state + fallback avatar |
| VIII. Stitch-First UI | PASS | CRM Sales Dashboard screen `e960e51133dd4a189eec69ab8a3c317c` fetched before any component |

All 8 principles: **PASS**

---

## Source Code Structure

```
src/
  app/
    (dashboard)/
      layout.tsx              # Shell layout — getServerSession, redirect if null
      page.tsx                # /dashboard placeholder page
  components/
    shell/
      Sidebar.tsx             # Server Component wrapper + nav config
      SidebarNav.tsx          # Client Component — usePathname for active state
      Topbar.tsx              # Server Component — passes session to children
      TopbarSearch.tsx        # Client Component — search form, router.push
      UserAvatar.tsx          # Client Component — avatar or initials fallback
      UserAvatarMenu.tsx      # Client Component — DropdownMenu with logout
      MobileNav.tsx           # Client Component — Sheet with hamburger toggle
```

---

## Phase 0: Stitch Design Reference

Before writing any component:
1. Fetch Stitch screen `e960e51133dd4a189eec69ab8a3c317c` (CRM Sales Dashboard)
2. Extract: sidebar width, nav item styles, topbar height, icon set (Lucide), color tokens
3. Record exact Tailwind class equivalents for all design tokens

Key tokens (from Stitch + reference project):
- Sidebar bg: `bg-white border-r border-gray-200`
- Active nav: `bg-indigo-50 text-indigo-700`
- Inactive nav: `text-gray-600 hover:bg-gray-50`
- Topbar bg: `bg-white border-b border-gray-200`
- Primary: `indigo-600`

---

## Phase 1: Dashboard Route Group Layout

**File**: `src/app/(dashboard)/layout.tsx`

```ts
// Server Component
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/shell/Sidebar'
import { Topbar } from '@/components/shell/Topbar'

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session.user} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar user={session.user} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
```

---

## Phase 2: Sidebar Components

**Sidebar.tsx** (Server Component — receives `user` prop from layout)
- Renders org name, user name at bottom
- Renders `<SidebarNav />` (Client)
- Renders `<MobileNav />` (Client, hidden on desktop)

**SidebarNav.tsx** (Client Component)
- `'use client'`
- `const pathname = usePathname()`
- Maps over fixed `NAV_ITEMS` array
- Each item: `pathname.startsWith(item.href)` → active styles

**NAV_ITEMS** (static constant, co-located in `Sidebar.tsx`):
```ts
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Contacts', href: '/contacts', icon: Users },
  { label: 'Leads', href: '/leads', icon: UserPlus },
  { label: 'Deals', href: '/deals', icon: Handshake },
  { label: 'Tickets', href: '/tickets', icon: Ticket },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings2 },
]
```

---

## Phase 3: Topbar Components

**Topbar.tsx** (Server Component)
- Renders `<TopbarSearch />` and `<UserAvatarMenu user={user} />`
- On mobile: renders hamburger button that triggers `<MobileNav>`

**TopbarSearch.tsx** (Client Component)
- `'use client'`
- `<form onSubmit={handleSearch}>` → `router.push('/contacts?search=' + query)`
- shadcn `Input` component

**UserAvatarMenu.tsx** (Client Component)
- shadcn `DropdownMenu`
- Shows: user name, org name, "Profile Settings" link, "Log out" button
- Log out: `signOut({ callbackUrl: '/login' })`

**UserAvatar.tsx** (Client Component)
- If `user.image` → `<Image src={user.image} ... />`
- Else → circle with initials: `name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()`

---

## Phase 4: Mobile Nav

**MobileNav.tsx** (Client Component)
- shadcn `Sheet` (side="left")
- State: `isOpen` toggle
- Hamburger button in topbar on mobile (`md:hidden`)
- Sheet contains same `<SidebarNav />` — close sheet on nav item click

---

## Phase 5: Dashboard Placeholder Page

**File**: `src/app/(dashboard)/page.tsx`

```tsx
export default function DashboardPage() {
  return (
    <div className="flex items-center justify-center h-full text-gray-400">
      <p>Dashboard coming soon</p>
    </div>
  )
}
```

No data fetching. Placeholder only.

---

## Phase 6: Tests

**Unit (Vitest)**:
- `SidebarNav.test.tsx` — active class applied for current route; not applied for others
- `UserAvatar.test.tsx` — initials derived from name; image rendered when URL present
- `TopbarSearch.test.tsx` — form submit navigates to `/contacts?search=<query>`

**E2E (Playwright)**:
- `navigation.spec.ts` — each of 7 nav items navigates to correct route and shows active state
- `logout.spec.ts` — logout from 3 different routes redirects to login; revisiting /dashboard redirects back
- `mobile-nav.spec.ts` — hamburger toggle at 375px viewport; drawer opens, nav item closes it

---

## Inter-Module Dependency Note

**Auth module (002) must add `orgName` to the NextAuth JWT before this module works end-to-end.**

If 003 is built before 002 is complete, use a hardcoded `orgName: 'Acme Corp'` in the session for local dev. The auth module's task list must include: "Add `orgName` to JWT callback."
