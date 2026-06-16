# Quickstart Validation Guide: Layout Shell

**Feature**: 003-layout-shell
**Date**: 2026-06-16

---

## Prerequisites

- Auth module (002-auth) is fully built and working (login/signup functional)
- Next.js app running locally: `pnpm dev`
- A valid user account exists (created via signup)

---

## Scenario 1: Shell Renders for Authenticated Users

**Goal**: Confirm the sidebar and topbar appear on every dashboard page.

```bash
# 1. Log in at http://localhost:3000/login
# 2. Observe: redirected to /dashboard
# 3. Verify: sidebar visible with 7 nav items, topbar visible with search + avatar
```

**Expected**: Shell renders without errors. Console shows no React hydration errors.

---

## Scenario 2: Active Nav State

**Goal**: Confirm the active nav item changes with the route.

```bash
# 1. While logged in, navigate to http://localhost:3000/contacts
# 2. Verify: "Contacts" nav item is highlighted (different background/color)
# 3. Navigate to http://localhost:3000/deals
# 4. Verify: "Deals" is now highlighted; "Contacts" is no longer highlighted
# 5. Refresh the page at /deals
# 6. Verify: "Deals" is still highlighted after refresh
```

---

## Scenario 3: Logout

**Goal**: Confirm logout ends session and redirects to login.

```bash
# 1. While logged in, click the avatar in the topbar
# 2. Click "Log out"
# 3. Verify: redirected to /login
# 4. Navigate directly to http://localhost:3000/dashboard
# 5. Verify: redirected back to /login (session expired)
```

---

## Scenario 4: Mobile Nav

**Goal**: Confirm mobile nav toggle works at narrow viewport.

```bash
# 1. Open DevTools → set viewport to 375px wide
# 2. Refresh any dashboard page
# 3. Verify: sidebar is hidden; hamburger button is visible in topbar
# 4. Click the hamburger button
# 5. Verify: mobile nav drawer opens showing all 7 nav items
# 6. Tap "Contacts"
# 7. Verify: drawer closes; user is on /contacts
```

---

## Scenario 5: Missing Avatar Fallback

**Goal**: Confirm initials-based avatar shows when no image URL is present.

```bash
# 1. Ensure the logged-in user has no avatar URL in their profile
# 2. Open any dashboard page
# 3. Verify: topbar shows a circle with the user's initials (e.g. "JD" for "John Doe")
```

---

## Scenario 6: Long Name Truncation

**Goal**: Confirm long org names truncate with ellipsis.

```bash
# 1. If test org has a short name, temporarily update it in the DB to a 50+ character string
# 2. Load any dashboard page
# 3. Verify: name is truncated with "..." in the sidebar; full name visible on hover
```

---

## E2E Tests (Playwright)

```bash
pnpm playwright test --grep "layout-shell"
```

Expected test files:
- `e2e/layout-shell/navigation.spec.ts` — covers scenarios 1, 2
- `e2e/layout-shell/logout.spec.ts` — covers scenario 3
- `e2e/layout-shell/mobile-nav.spec.ts` — covers scenario 4

---

## Unit Tests (Vitest)

```bash
pnpm vitest run src/components/shell/
```

Expected coverage targets:
- `Sidebar.tsx` — nav item rendering, active state logic
- `UserAvatar.tsx` — fallback initials logic
- `TopbarSearch.tsx` — search form submission, navigation
