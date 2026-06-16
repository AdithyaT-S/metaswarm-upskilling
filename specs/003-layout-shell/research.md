# Research: Layout Shell

**Date**: 2026-06-16
**Feature**: 003-layout-shell

---

## Decision 1: Stitch Screen — CRM Sales Dashboard

**Decision**: Fetch Stitch screen `e960e51133dd4a189eec69ab8a3c317c` (CRM Sales Dashboard) before building any shell component.

**Rationale**: Per Constitution Principle VIII. This screen defines the exact sidebar layout, topbar layout, spacing, icon style, color tokens, and nav item order. All shell components must match it pixel-for-pixel.

**Key design tokens from Stitch**:
- Primary: Indigo `#4F46E5`
- Background: `gray-50`
- Surfaces: white
- Font: Inter (`font-sans`)
- Sidebar width: fixed (not collapsible in v1)

---

## Decision 2: Route Group — `(dashboard)` layout

**Decision**: Use Next.js App Router route group `src/app/(dashboard)/layout.tsx` to wrap all authenticated pages with the shell.

**Rationale**: Route groups in Next.js 14 App Router allow a shared layout without affecting the URL. All module pages (`/contacts`, `/deals`, etc.) live under `(dashboard)/` and inherit the sidebar + topbar automatically. Auth pages (`/login`, `/signup`) live under `(auth)/` and get a different layout.

**Reference**: `C:\Works\anticlock` used this exact structure — `src/app/(dashboard)/layout.tsx`.

---

## Decision 3: No DB queries in Shell

**Decision**: The shell reads user name, org name, and avatar from the NextAuth session only. No `queryForOrg()` call.

**Rationale**: The session JWT already carries `id`, `orgId`, `role`, `name`, `email`. Fetching org name requires a DB query — but the org name is not in the JWT by default. Two options:
1. Add org name to JWT at login time (query once, store in token)
2. Fetch org name in a Server Component on every shell render

**Chosen**: Option 1 — add `orgName` to the NextAuth JWT callback during login/signup. This avoids a DB query on every page render. The auth module's `signUp` and `authorize` callbacks must include `orgName`.

**Impact on auth module**: `src/lib/auth.ts` JWT callback must include `orgName`. The auth module's `data-model.md` should note this. This is an inter-module dependency.

---

## Decision 4: Active Nav State

**Decision**: Use `usePathname()` from `next/navigation` in a Client Component to determine the active nav item. Compare `pathname.startsWith(item.href)`.

**Rationale**: Active state requires knowing the current route. In Next.js 14 App Router, `usePathname()` is the standard hook for this in Client Components. The sidebar can be a Server Component wrapper with a Client Component child for the active state logic.

---

## Decision 5: Mobile Nav — Sheet/Drawer pattern

**Decision**: Use shadcn `Sheet` component for the mobile nav drawer. Toggle via a hamburger button in the topbar on mobile viewports.

**Rationale**: shadcn `Sheet` provides an accessible slide-in panel. No custom CSS needed. Matches the Stitch mobile breakpoint behavior. Reference project used `MobileNav.tsx` with this pattern.

---

## Decision 6: Search — Contacts filter redirect (v1)

**Decision**: Search input in topbar navigates to `/contacts?search=<query>` on Enter.

**Rationale**: Full global search is out of scope for v1. Routing to contacts list with a query param is the minimal viable behaviour that matches the spec (FR-008).

---

## Decision 7: Notifications — Empty state only (v1)

**Decision**: Notifications bell opens a shadcn `Popover` showing "No notifications yet." No backend integration.

**Rationale**: FR-009 explicitly states v1 is empty state only. A `Popover` is simpler than a `Sheet` for a small panel.
