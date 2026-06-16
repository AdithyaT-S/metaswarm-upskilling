# Tasks: Layout Shell

**Feature**: 003-layout-shell
**Date**: 2026-06-16
**Depends on**: 002-auth (must be planned; implementation can proceed in parallel with auth build if `orgName` is stubbed)

---

## Phase 0: Design Reference

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-0.1 | Fetch Stitch screen `e960e51133dd4a189eec69ab8a3c317c` via `stitch-design` skill. Extract sidebar width, nav item styles, topbar height, icon names, color tokens, Tailwind class equivalents. | No | — |

---

## Phase 1: Route Group Layout

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-1.1 | Create `src/app/(dashboard)/layout.tsx` — Server Component. Call `getServerSession(authOptions)`. Redirect to `/login` if null. Render `<Sidebar>` + `<Topbar>` + `<main>`. | No | T-0.1 |
| T-1.2 | Create `src/app/(dashboard)/page.tsx` — placeholder page with "Dashboard coming soon" text. | Yes (with T-1.1) | T-0.1 |

---

## Phase 2: Sidebar Components

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-2.1 | Create `src/components/shell/Sidebar.tsx` — Server Component. Accepts `user` prop. Renders org name + user name at bottom. Renders `<SidebarNav />`. | No | T-1.1 |
| T-2.2 | Create `src/components/shell/SidebarNav.tsx` — Client Component. `usePathname()` for active state. Map over `NAV_ITEMS` constant. Apply active/inactive Tailwind classes. | Yes (with T-2.1) | T-2.1 |

---

## Phase 3: Topbar Components

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-3.1 | Create `src/components/shell/Topbar.tsx` — Server Component. Passes `user` to `<UserAvatarMenu>` and renders `<TopbarSearch>`. | No | T-1.1 |
| T-3.2 | Create `src/components/shell/TopbarSearch.tsx` — Client Component. Search form on submit navigates to `/contacts?search=<query>`. Use shadcn `Input`. | Yes (with T-3.1) | T-3.1 |
| T-3.3 | Create `src/components/shell/UserAvatar.tsx` — Client Component. Renders `<Image>` if `user.image` present; else renders initials circle (first 2 initials from `user.name`). | Yes (with T-3.1) | T-3.1 |
| T-3.4 | Create `src/components/shell/UserAvatarMenu.tsx` — Client Component. shadcn `DropdownMenu`. Shows user name, org name, "Profile Settings" link, "Log out" button. Log out calls `signOut({ callbackUrl: '/login' })`. | No | T-3.3 |

---

## Phase 4: Mobile Nav

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-4.1 | Create `src/components/shell/MobileNav.tsx` — Client Component. shadcn `Sheet` (side="left"). Hamburger button in topbar (visible only on `< md`). Sheet contains `<SidebarNav>` which closes sheet on item click. | No | T-2.2, T-3.1 |

---

## Phase 5: Unit Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-5.1 | Write `src/components/shell/__tests__/SidebarNav.test.tsx`. Test: active class for current route; no active class for others; all 7 nav items render. | Yes | T-2.2 |
| T-5.2 | Write `src/components/shell/__tests__/UserAvatar.test.tsx`. Test: initials from name; image renders when URL provided; max 2 initials. | Yes | T-3.3 |
| T-5.3 | Write `src/components/shell/__tests__/TopbarSearch.test.tsx`. Test: form submit navigates to correct URL; query encoded correctly. | Yes | T-3.2 |

---

## Phase 6: E2E Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-6.1 | Write `e2e/layout-shell/navigation.spec.ts`. Test all 7 nav items navigate to correct routes. Test active state per route. | No | T-2.2, Auth module running |
| T-6.2 | Write `e2e/layout-shell/logout.spec.ts`. Test logout from `/dashboard`, `/contacts`, `/leads`. Verify redirect to `/login`. Verify `/dashboard` redirect after logout. | Yes (with T-6.1) | T-3.4, Auth module running |
| T-6.3 | Write `e2e/layout-shell/mobile-nav.spec.ts`. Set viewport 375px. Test hamburger opens drawer. Test nav item closes drawer and navigates. | Yes (with T-6.1) | T-4.1, Auth module running |

---

## Swarm Agent Assignment

| Agent | Tasks |
|---|---|
| architect | T-0.1, T-1.1 (structure decisions) |
| coder | T-1.2, T-2.1, T-2.2, T-3.1, T-3.2, T-3.3, T-3.4, T-4.1 |
| test-automator | T-5.1, T-5.2, T-5.3, T-6.1, T-6.2, T-6.3 |
| code-review | Final review of all shell components before handoff |
