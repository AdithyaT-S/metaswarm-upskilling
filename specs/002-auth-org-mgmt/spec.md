# Feature Specification: Auth & Org Management

**Feature Branch**: `002-auth-org-mgmt`

**Created**: 2026-06-16

**Status**: Draft

**Module**: 001 — blocks all other modules

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — New Company Signup (Priority: P1)

A founder or team lead signs up for FreshCRM for the first time, creating both their personal account and their company's org in a single flow so they can immediately start using the CRM.

**Why this priority**: Without an org and an admin account, nothing else in the system can function. This is the absolute entry point.

**Independent Test**: A new user can complete signup with email, password, and org name — then land on the dashboard as the org admin — without any other module being built.

**Acceptance Scenarios**:

1. **Given** no account exists, **When** a user submits email + password + org name, **Then** their account is created, an org is created with that name, the user is assigned the admin role, and they are redirected to the app dashboard.
2. **Given** a signup form, **When** a user submits with a password shorter than 8 characters, **Then** the form shows a clear validation error and no account is created.
3. **Given** a signup form, **When** a user submits with an email already registered, **Then** the form shows "An account with this email already exists" and no duplicate account is created.
4. **Given** a signup form, **When** a user submits with an invalid email format, **Then** the form shows a validation error before submission.

---

### User Story 2 — Login & Session Management (Priority: P1)

An existing team member logs into FreshCRM and stays logged in across browser sessions so they don't have to re-authenticate on every visit.

**Why this priority**: All authenticated users need login to work before any other module is accessible.

**Independent Test**: An existing user can log in, close the browser, reopen it, and still be authenticated without logging in again.

**Acceptance Scenarios**:

1. **Given** a registered user, **When** they enter correct email + password and submit, **Then** they are authenticated and redirected to the dashboard.
2. **Given** a logged-in user, **When** they close and reopen the browser, **Then** their session persists and they land directly on the dashboard.
3. **Given** incorrect credentials, **When** a user submits, **Then** they see "Invalid email or password" — no indication of which field is wrong.
4. **Given** a logged-in user, **When** they click "Log out", **Then** their session is terminated and they are redirected to the login page.
5. **Given** an expired session, **When** a user navigates to any protected page, **Then** they are redirected to login with the original URL preserved so they land there after re-authenticating.
6. **Given** a valid session, **When** it is about to expire, **Then** it is automatically refreshed without interrupting the user.

---

### User Story 3 — Invite Team Members (Priority: P1)

An org admin invites colleagues to join their org so the whole team can collaborate in the same CRM workspace.

**Why this priority**: Without team invitations, the CRM is single-user — the core multi-tenant value cannot be demonstrated.

**Independent Test**: An admin can invite a colleague by email, the colleague receives an invite link, sets a password, and logs in with access scoped to the same org.

**Acceptance Scenarios**:

1. **Given** a logged-in admin, **When** they enter a colleague's email and select a role (admin / member / viewer) and submit, **Then** the colleague receives an invitation email with a sign-up link.
2. **Given** an invitation link, **When** the invitee opens it and sets a password, **Then** they are added to the org with the assigned role and redirected to the dashboard.
3. **Given** an invitation link that is more than 7 days old, **When** the invitee tries to use it, **Then** they see "This invitation has expired" with an option to request a new one.
4. **Given** an admin invites an email that already has an account in the same org, **Then** they see "This person is already a member of your org."
5. **Given** a non-admin user, **When** they navigate to the invite page, **Then** they see a "Insufficient permissions" message and cannot send invites.

---

### User Story 4 — Role-Based Access Control (Priority: P2)

An org admin assigns roles to team members so that sensitive actions (like deleting records or changing org settings) are restricted to the right people.

**Why this priority**: Roles gate all write operations across every other module. Needs to work before those modules are built.

**Independent Test**: A user with the Viewer role cannot create, edit, or delete any record — and sees clear permission messages when they try.

**Acceptance Scenarios**:

1. **Given** a Viewer-role user, **When** they attempt any write action (create contact, move deal, reply to ticket), **Then** the action is blocked with a "You don't have permission to do this" message.
2. **Given** a Member-role user, **When** they attempt to access Settings > Team, **Then** they are redirected away with a permission error.
3. **Given** an Admin, **When** they change a member's role to Viewer, **Then** that member loses write access on their next action without needing to log out.
4. **Given** an Admin, **When** they remove a member from the org, **Then** that member's session is invalidated and they are redirected to a "Your account has been removed from this org" page.

---

### Edge Cases

- What happens when a user tries to access `/dashboard` without being logged in? → Redirect to `/login?redirect=/dashboard`; after login, land on `/dashboard`.
- What happens when two admins simultaneously change the same member's role? → Last write wins; both see the current state on refresh.
- What happens when the only admin tries to demote themselves? → Blocked with "There must be at least one admin in the org."
- What happens when an invitation email fails to deliver? → The invite record is created; admin sees "Invite sent" but a failed-delivery notice appears in a retry queue (admin can resend).
- What happens when a user signs up with an email from an existing invitation? → The invitation is auto-accepted, the user joins the org with the invited role, no duplicate org is created.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a new user to create an account and an org in a single signup flow using email and password.
- **FR-002**: System MUST automatically assign the admin role to the first user who creates an org.
- **FR-003**: System MUST validate: email format, password minimum 8 characters, org name non-empty — before creating any record.
- **FR-004**: System MUST reject signup with an email already registered to an existing account.
- **FR-005**: System MUST authenticate users via email and password and establish a persistent session.
- **FR-006**: System MUST automatically refresh sessions before expiry without requiring the user to log in again.
- **FR-007**: System MUST redirect unauthenticated users to login, preserving the originally requested URL for post-login redirect.
- **FR-008**: System MUST terminate the session and redirect to login when a user logs out.
- **FR-009**: Admins MUST be able to invite users by email, specifying one of three roles: admin, member, or viewer.
- **FR-010**: System MUST send an invitation email containing a unique, time-limited sign-up link (expires after 7 days).
- **FR-011**: System MUST add the invitee to the org with the assigned role when they accept the invitation and set a password.
- **FR-012**: System MUST reject expired invitation links and show a clear message with a resend option.
- **FR-013**: System MUST prevent non-admin users from sending invitations or accessing team management.
- **FR-014**: System MUST enforce role-based access on every write operation — Viewer cannot create, edit, or delete any record.
- **FR-015**: Admins MUST be able to change a member's role; the change MUST take effect on the member's next action without requiring logout.
- **FR-016**: Admins MUST be able to remove members from the org; removed members' sessions MUST be invalidated immediately.
- **FR-017**: System MUST prevent the removal or demotion of the last admin in an org.
- **FR-018**: Every protected page and action MUST verify the user's org membership and role on every request — never trust client-supplied org or role data.

### Key Entities

- **User**: An authenticated person with an email, hashed password, and a role within one org.
- **Org**: A tenant workspace. Has a name and owns all CRM records.
- **OrgMember**: The join between a User and an Org, carrying the role (admin / member / viewer).
- **Invitation**: A pending invite record with recipient email, assigned role, org, expiry timestamp, and a unique token.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete signup and land on the dashboard in under 2 minutes.
- **SC-002**: Login succeeds or fails with a clear message within 2 seconds of submission.
- **SC-003**: An invited team member can accept an invitation and be fully operational in the org in under 3 minutes from receiving the email.
- **SC-004**: Zero cross-org data access — a user authenticated in Org A can never read or write records belonging to Org B, verified by automated tests.
- **SC-005**: Role enforcement is 100% consistent — every write operation attempted by a Viewer-role user is blocked, verified by a test suite covering all mutation paths.
- **SC-006**: Session persistence works across browser restarts — users remain logged in without re-authenticating for the duration of the session lifetime.

---

## Assumptions

- Each user belongs to exactly one org; cross-org membership is out of scope for v1.
- Password reset ("forgot password") is in scope as a basic account recovery flow.
- Social login (Google, GitHub OAuth) is out of scope for v1 — email + password only.
- Email delivery for invitations uses the same Resend integration as transactional email (BRD §4.7).
- Session lifetime follows the auth provider's default; explicit "remember me" toggle is out of scope.
- The org name can be changed later via Settings; it does not need to be unique across all orgs.
- Role permissions are fixed (admin / member / viewer) — custom roles are out of scope for v1.
- Members and Viewers have the same read access; the only difference is write permissions.
