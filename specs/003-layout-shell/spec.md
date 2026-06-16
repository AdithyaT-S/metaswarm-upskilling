# Feature Specification: Layout Shell

**Feature Branch**: `003-layout-shell`
**Created**: 2026-06-16
**Status**: Draft
**Module**: 002 — depends on Auth (002), blocks all UI modules (003–011)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Navigate Between Modules (Priority: P1)

A logged-in user moves between CRM sections (Contacts, Deals, Tickets, etc.) using the sidebar without losing their place or context.

**Why this priority**: The shell is the container for every other module. Navigation must work before any module page is useful.

**Independent Test**: A logged-in user can click each nav item and land on the correct page. The active item is visually highlighted. No other module content needs to exist — placeholder pages suffice.

**Acceptance Scenarios**:

1. **Given** a logged-in user on any page, **When** they click "Contacts" in the sidebar, **Then** they are taken to `/contacts` and the Contacts nav item is highlighted as active.
2. **Given** a logged-in user, **When** they refresh the page on `/deals`, **Then** the Deals nav item is still highlighted as active.
3. **Given** a logged-in user on `/dashboard`, **When** they view the sidebar, **Then** they see their full name and org name displayed at the bottom of the sidebar.
4. **Given** any nav item, **When** a user hovers over it, **Then** a tooltip shows the section name (useful when sidebar is collapsed on smaller screens).

---

### User Story 2 — Topbar Actions (Priority: P1)

A logged-in user accesses account actions (logout, profile) and sees their identity via the topbar avatar menu without navigating away from their current page.

**Why this priority**: Users must be able to log out from any page. Identity confirmation (name/org) builds trust.

**Independent Test**: A logged-in user can open the avatar menu and log out successfully from any page.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they click the avatar in the topbar, **Then** a dropdown appears with: their name, their org name, a "Profile Settings" link, and a "Log out" option.
2. **Given** the avatar dropdown is open, **When** the user clicks "Log out", **Then** their session ends and they are redirected to the login page.
3. **Given** a logged-in user, **When** they type in the topbar search input and press Enter, **Then** they are taken to a search results page (or the contacts list filtered by query in v1).
4. **Given** a logged-in user, **When** they click the notifications bell, **Then** a panel appears (empty state for v1: "No notifications yet").

---

### User Story 3 — Responsive Mobile Navigation (Priority: P2)

A user on a mobile or tablet device can access all navigation items via a collapsible mobile menu without the sidebar taking up the full screen.

**Why this priority**: Mobile access is needed but secondary to desktop workflow for a B2B CRM.

**Independent Test**: On a viewport narrower than 768px, the sidebar is hidden by default and a hamburger/menu button opens the mobile nav.

**Acceptance Scenarios**:

1. **Given** a viewport width below 768px, **When** a user loads any dashboard page, **Then** the sidebar is hidden and a menu toggle button is visible in the topbar.
2. **Given** the mobile menu is open, **When** a user taps a nav item, **Then** the menu closes and the user is taken to the correct page.
3. **Given** a viewport wider than 768px, **When** the page loads, **Then** the sidebar is always visible and the mobile menu toggle is hidden.

---

### Edge Cases

- What happens when a logged-in user's session expires mid-navigation? → Middleware intercepts the next request and redirects to `/login?callbackUrl=<current-path>`.
- What happens when a nav item points to a module not yet built? → It navigates to the page, which shows an empty state or placeholder — the shell itself never errors.
- What happens when the org name is very long (>40 chars)? → It is truncated with an ellipsis in the sidebar; full name shown on hover tooltip.
- What happens when the user's avatar URL is missing? → A fallback avatar using their initials is shown.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The shell layout MUST wrap every page under the `/dashboard` route group with a persistent sidebar and topbar.
- **FR-002**: The sidebar MUST contain nav items for: Dashboard, Contacts, Leads, Deals, Tickets, Reports, Settings — in that order.
- **FR-003**: Each nav item MUST show an icon and a label, with the active route visually distinguished from inactive items.
- **FR-004**: The sidebar MUST display the logged-in user's full name and org name.
- **FR-005**: The topbar MUST contain: a search input, a notifications bell icon, and a user avatar with a dropdown menu.
- **FR-006**: The avatar dropdown MUST contain: user name, org name, a link to Profile Settings, and a Log out action.
- **FR-007**: Clicking Log out MUST terminate the session and redirect to the login page.
- **FR-008**: The search input MUST navigate to the contacts list filtered by the search query when Enter is pressed (v1 behaviour).
- **FR-009**: The notifications bell MUST open a panel showing an empty state ("No notifications yet") in v1.
- **FR-010**: On viewports narrower than 768px the sidebar MUST be hidden; a menu toggle button MUST be visible in the topbar.
- **FR-011**: Opening the mobile menu MUST reveal all nav items; selecting one MUST close the menu and navigate to the page.
- **FR-012**: The dashboard home page (`/dashboard`) MUST render a placeholder that does not error, ready to receive real content in a later module.
- **FR-013**: Long org names or user names MUST be truncated with an ellipsis; full value shown on hover.
- **FR-014**: A missing user avatar MUST fall back to an initials-based placeholder.

### Key Entities

- **NavItem**: A navigation link with a label, icon, and target route. Fixed set of 7 items.
- **UserSession**: The logged-in user's name, org name, and avatar URL — read from the auth session, never re-fetched from DB.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can navigate to any of the 7 sections in under 2 clicks from any page.
- **SC-002**: The shell layout renders on first load in under 1 second on a standard connection.
- **SC-003**: The active nav item correctly reflects the current route on 100% of page loads and navigations — verified by E2E tests covering all 7 nav items.
- **SC-004**: The mobile nav is usable on viewports as narrow as 375px without horizontal scroll.
- **SC-005**: Logout works from every page — verified by E2E tests triggering logout from at least 3 different routes.

---

## Assumptions

- The sidebar is always expanded (no collapse-to-icon mode) in v1; collapsible sidebar is out of scope.
- Notifications are read-only in v1 — no notification creation, marking as read, or real-time updates.
- Search in v1 routes to the contacts list with a query param; a dedicated global search page is out of scope.
- The dashboard home page is a placeholder in this module; real KPI content is added in the Dashboard module (built after all other modules).
- Nav items for modules not yet built still appear in the sidebar — they navigate to empty/placeholder pages, never error.
- The shell does not fetch any data from the DB — all displayed information (user name, org name) comes from the existing auth session.
