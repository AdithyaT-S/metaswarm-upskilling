# Feature Specification: FreshCRM — Full Product

**Feature Branch**: `001-freshcrm-product-spec`

**Created**: 2026-06-16

**Status**: Draft

**Input**: Full product spec based on docs/BRD.md covering all 11 modules

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Org Signup & Team Onboarding (Priority: P1)

A new company signs up, creates their organization, and invites team members with appropriate roles so everyone can access the CRM immediately.

**Why this priority**: Nothing else in the system works without an authenticated org. This is the entry point for every other user story.

**Independent Test**: A new user can sign up, create an org, invite a colleague, and the colleague can log in — all without any other module being built.

**Acceptance Scenarios**:

1. **Given** no account exists, **When** a user enters email + password + org name and submits, **Then** the org is created, the user is assigned the admin role, and they are redirected to the dashboard.
2. **Given** an admin is logged in, **When** they invite a colleague by email with a role (admin / member / viewer), **Then** the colleague receives an email with a sign-up link pre-scoped to that org and role.
3. **Given** an invitation link, **When** the invitee sets a password and submits, **Then** they are added to the org with the assigned role and can log in.
4. **Given** a logged-in user, **When** they log out, **Then** their session is invalidated and they are redirected to the login page.
5. **Given** an expired session, **When** a user attempts to navigate to any protected page, **Then** they are redirected to login.

---

### User Story 2 — Contact Management (Priority: P1)

A sales rep creates, searches, updates, and views contacts — the core data entity that everything else links to.

**Why this priority**: Contacts are referenced by Leads, Deals, Tickets, Activities, and Emails. They must exist before those modules are meaningful.

**Independent Test**: A sales rep can create a contact, search for them by name or email, edit their details, and view their full profile page with an empty activity timeline.

**Acceptance Scenarios**:

1. **Given** a logged-in sales rep, **When** they submit a new contact form (first name, last name, email), **Then** the contact is saved and appears in the contacts list scoped to their org.
2. **Given** contacts exist, **When** a user searches by name or email, **Then** results appear within 1 second with matching contacts only from their org.
3. **Given** a contact detail page, **When** a user edits a field and saves, **Then** the change is reflected immediately and an audit entry appears on the activity timeline.
4. **Given** a contact, **When** a user soft-deletes it, **Then** the contact is hidden from lists but recoverable by an admin; no linked records are deleted.
5. **Given** a CSV file of contacts, **When** a user uploads it via the import tool, **Then** valid rows are created as contacts in the org and invalid rows are reported in an error summary.

---

### User Story 3 — Deal Pipeline & Kanban (Priority: P1)

A sales rep moves deals through a pipeline on a Kanban board so the team always knows where each opportunity stands.

**Why this priority**: The pipeline is the primary value proposition for sales teams and a core BRD goal (G1).

**Independent Test**: A sales rep can create a deal linked to a contact, view it on the Kanban board, and drag it between stages.

**Acceptance Scenarios**:

1. **Given** a logged-in sales rep, **When** they create a deal with a name, value, close date, and linked contact, **Then** the deal appears in the first stage of the selected pipeline's Kanban board.
2. **Given** a Kanban board, **When** a user drags a deal card to a different stage, **Then** the deal's stage is updated instantly and persisted on refresh.
3. **Given** multiple pipelines, **When** a user selects a different pipeline from the dropdown, **Then** the board refreshes showing only deals in that pipeline.
4. **Given** a deal detail page, **When** a user views it, **Then** they see deal fields, linked contact, owner, and a full activity timeline.
5. **Given** a deal is marked Closed Won or Closed Lost, **When** it is updated, **Then** it is excluded from the default active pipeline view and counted in win/loss reports.

---

### User Story 4 — Lead Tracking (Priority: P2)

A sales rep converts a contact into a lead, tracks their status through the qualification funnel, and marks them as converted to a deal when ready.

**Why this priority**: Leads extend contacts with funnel tracking. Important but secondary to contacts and deals being functional first.

**Independent Test**: A sales rep can promote a contact to a lead, update the lead status, and mark it as converted — linking it to an existing deal.

**Acceptance Scenarios**:

1. **Given** a contact, **When** a user clicks "Convert to Lead" and submits the lead form, **Then** the contact is linked to a new lead record with status "New".
2. **Given** a lead, **When** a user updates the status (New → Contacted → Qualified → Lost), **Then** the transition is saved and visible on the lead list.
3. **Given** a qualified lead, **When** a user marks it as converted and links it to a deal, **Then** the lead status becomes "Converted" and a link to the deal appears on the lead detail page.
4. **Given** the leads list, **When** a user filters by owner or status, **Then** only matching leads from their org are shown.

---

### User Story 5 — Support Ticket Inbox (Priority: P2)

A support agent views their inbox of tickets, works on them in priority order with SLA visibility, and resolves them.

**Why this priority**: The ticket inbox is the core value for support teams (BRD §4.5) but is independent from sales workflows.

**Independent Test**: A support agent can create a ticket linked to a contact, view the inbox sorted by priority and SLA, reply to the ticket, and mark it resolved.

**Acceptance Scenarios**:

1. **Given** a logged-in support agent, **When** they create a ticket with a subject, priority, and linked contact, **Then** the ticket appears in the inbox with an SLA due date calculated from creation time.
2. **Given** the ticket inbox, **When** the agent views it, **Then** tickets are shown with status, priority badge, SLA countdown timer, and assignee — sorted by urgency.
3. **Given** a ticket detail page, **When** an agent types and submits a reply, **Then** the reply is added to the email thread view and the contact receives it via email.
4. **Given** a ticket, **When** an agent changes its status to Resolved, **Then** it is removed from the open inbox and appears in the resolved queue.
5. **Given** a ticket past its SLA due date, **When** it is viewed in the inbox, **Then** the SLA timer displays as overdue in a visually distinct style.

---

### User Story 6 — Activity Timeline (Priority: P2)

A sales rep logs calls, notes, tasks, and meetings on any contact, deal, or ticket so the team has full interaction history.

**Why this priority**: Needed for contact + deal detail pages to be useful, but requires those modules to be built first.

**Independent Test**: A user can log a call note on a contact and see it appear chronologically on the contact's timeline.

**Acceptance Scenarios**:

1. **Given** a contact detail page, **When** a user logs a call with notes and a timestamp, **Then** the call appears at the top of the activity timeline.
2. **Given** a task created on a deal, **When** the due date passes without completion, **Then** the task appears highlighted as overdue on the timeline.
3. **Given** a deal detail page, **When** a user views the activity timeline, **Then** they see all activities linked to that deal (calls, notes, tasks, meetings) in reverse chronological order.
4. **Given** the activities list view, **When** a user filters by owner, **Then** only activities owned by that user are shown.

---

### User Story 7 — Email Thread View (Priority: P3)

A sales rep or support agent sends emails directly from a contact or ticket detail page and sees the full reply thread inline.

**Why this priority**: Email enriches contact and ticket records but is non-blocking for core CRM value.

**Independent Test**: A user can send an email from a contact page, and a reply from the contact is received and appears in the thread view on that contact's page.

**Acceptance Scenarios**:

1. **Given** a contact detail page, **When** a user composes and sends an email, **Then** the email is delivered to the contact's address and appears as the first item in the email thread.
2. **Given** a contact replies to the email, **When** the reply is received via inbound webhook, **Then** it is appended to the correct thread on the contact or ticket page.
3. **Given** a ticket detail, **When** an agent sends a reply, **Then** the reply is sent from the org's support address and appended to the ticket thread.

---

### User Story 8 — Reports Dashboard (Priority: P3)

A sales manager views five standard report views to assess pipeline health, revenue, and team activity without writing queries.

**Why this priority**: Reports depend on all other modules having data. Built last in the module order.

**Independent Test**: A manager can navigate to the Reports page and see all five charts rendered correctly with live data.

**Acceptance Scenarios**:

1. **Given** the Reports page, **When** a manager opens it, **Then** they see five charts: Contacts Over Time, Open Deals by Stage, Revenue This Month / Quarter, Tickets by Status & Priority, and Activities by Owner.
2. **Given** a chart, **When** a manager hovers over a data point, **Then** a tooltip shows the exact value and date.
3. **Given** new data is added (e.g., a deal is closed), **When** the manager refreshes the Reports page, **Then** the relevant chart reflects the updated data.

---

### User Story 9 — Settings & Administration (Priority: P3)

An org admin configures pipelines, custom fields, team roles, and billing so the CRM matches their team's workflow.

**Why this priority**: Settings extend what's already built. Cannot configure a pipeline stage before the pipeline module exists.

**Independent Test**: An admin can create a new pipeline, add a custom stage, and see it available on the Deals Kanban.

**Acceptance Scenarios**:

1. **Given** the Settings > Pipelines page, **When** an admin adds a new pipeline with custom stages, **Then** the pipeline is available in the deals pipeline selector.
2. **Given** the Settings > Team page, **When** an admin changes a member's role to Viewer, **Then** that member loses write access on their next page load.
3. **Given** the Settings > Custom Fields page, **When** an admin adds a text field to Contacts, **Then** it appears on the contact create/edit form for all org members.
4. **Given** the Settings > Profile page, **When** a user updates their name and saves, **Then** the new name is reflected in the sidebar and topbar immediately.

---

### Edge Cases

- What happens when a user attempts to access another org's data via a direct URL (e.g., `/contacts/[id]` belonging to a different org)? → Must return 404, never expose the record.
- What happens when CSV import contains duplicate emails? → Duplicate rows are flagged in the error report; existing contacts are not overwritten without explicit merge confirmation.
- What happens when a deal's linked contact is soft-deleted? → The deal remains visible; contact name shows as "Deleted Contact" with no broken link.
- What happens when an inbound email cannot be matched to a contact or ticket? → It is queued in an "Unmatched Emails" admin view for manual assignment.
- What happens when a user with the Viewer role attempts a write action (e.g., create contact)? → The action is rejected with a clear "Insufficient permissions" message; no partial write occurs.
- What happens when a pipeline has all its stages deleted? → At least one stage must always remain; the delete action on the last stage is blocked with an explanation.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication & Org Management
- **FR-001**: System MUST allow a new user to create an account and an org simultaneously with email + password.
- **FR-002**: System MUST assign the first user of an org the admin role automatically.
- **FR-003**: Admins MUST be able to invite users by email with a role (admin / member / viewer).
- **FR-004**: System MUST scope every data record to the org of the authenticated user — cross-org access is never permitted.
- **FR-005**: System MUST invalidate sessions on logout and redirect unauthenticated requests to login.

#### Contacts
- **FR-006**: Users MUST be able to create contacts with: first name, last name, email, phone, company, job title, lead source, owner, tags, and custom fields.
- **FR-007**: System MUST support full-text search across contact name and email within the authenticated org.
- **FR-008**: Users MUST be able to filter contacts by owner, lead source, and tags.
- **FR-009**: System MUST support server-side CSV import with per-row validation and an error report for invalid rows.
- **FR-010**: Contact deletion MUST be a soft delete — record is hidden from lists but preserved in the database.

#### Leads
- **FR-011**: Users MUST be able to convert a contact to a lead, capturing: status, lead score, lead source, and owner.
- **FR-012**: Lead status MUST follow: New → Contacted → Qualified → Lost (with Converted as a terminal state).
- **FR-013**: A converted lead MUST link to the deal it was converted into.

#### Deals & Pipeline
- **FR-014**: Orgs MUST be able to have multiple named pipelines, each with configurable stages.
- **FR-015**: Deals MUST be displayed on a Kanban board grouped by stage, with drag-and-drop stage transitions.
- **FR-016**: Deals MUST have: name, value, currency, close date, linked contact, owner, and pipeline assignment.
- **FR-017**: Each pipeline stage MUST have a configurable win probability percentage.
- **FR-018**: Closed Won and Closed Lost deals MUST be excluded from the default active board view.

#### Tickets
- **FR-019**: Users MUST be able to create tickets with: subject, description, priority (Low / Medium / High / Urgent), status (Open / Pending / Resolved / Closed), and linked contact.
- **FR-020**: System MUST calculate and display an SLA due date for each ticket based on priority.
- **FR-021**: Ticket detail MUST show a full email thread view with a reply composer.
- **FR-022**: Tickets MUST be assignable to any org member.

#### Activities
- **FR-023**: Users MUST be able to log activities of type: Call, Email, Note, Task, Meeting against any contact, deal, or ticket.
- **FR-024**: Tasks MUST have a due date and a completion toggle; overdue tasks MUST be visually flagged.
- **FR-025**: Activity timelines MUST display in reverse chronological order on all parent record detail pages.

#### Email
- **FR-026**: Users MUST be able to compose and send emails from contact and ticket detail pages.
- **FR-027**: System MUST receive inbound email replies via webhook and attach them to the correct contact or ticket thread.
- **FR-028**: Unmatched inbound emails MUST be held in an admin queue for manual assignment.

#### Reports
- **FR-029**: Reports page MUST display five charts: Contacts Over Time, Open Deals by Stage, Revenue This Month & This Quarter, Tickets by Status & Priority, Activities Completed by Owner.
- **FR-030**: All report data MUST be scoped to the authenticated user's org.

#### Settings
- **FR-031**: Admins MUST be able to create, rename, and reorder pipeline stages per pipeline.
- **FR-032**: Admins MUST be able to change any member's role or remove them from the org.
- **FR-033**: Admins MUST be able to define custom fields (text, number, date, select) per entity type (Contact, Lead, Deal, Ticket).
- **FR-034**: Users MUST be able to update their own profile name and avatar.

#### Data Isolation & Security
- **FR-035**: Every database table MUST enforce row-level security scoped to the authenticated org — no application-layer-only isolation.
- **FR-036**: The database provider MUST be switchable (local / Supabase / AWS RDS / Neon / Railway) via a single environment variable with zero application code changes.
- **FR-037**: Every form and server-side mutation MUST validate all inputs against a defined schema before any database operation.

### Key Entities

- **Org**: Top-level tenant. All other entities belong to exactly one org.
- **User**: Authenticated person with a role (admin / member / viewer) within one org.
- **Contact**: A person or company record. Core entity linked to leads, deals, tickets, and activities.
- **Lead**: A contact record in a sales qualification funnel with status and score.
- **Pipeline**: A named set of ordered stages belonging to an org. An org can have multiple pipelines.
- **Deal**: A sales opportunity at a stage within a pipeline, linked to a contact.
- **Ticket**: A support request linked to a contact, with status, priority, and SLA.
- **Activity**: A timestamped interaction record (call, note, task, email, meeting) linked to a contact, deal, or ticket.
- **EmailThread**: A chain of sent and received email messages linked to a contact or ticket.
- **CustomField**: A user-defined field definition (name, type, entity) with values stored per record.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new team can sign up, create an org, invite members, and have the full CRM operational within 15 minutes — no vendor setup required beyond choosing a database provider.
- **SC-002**: A sales rep can find any contact from a list of 10,000 records in under 1 second using search.
- **SC-003**: 100% of deal stage changes are reflected on the Kanban board without a page reload.
- **SC-004**: Zero cross-tenant data leakage — verified by automated tests that query across org boundaries and assert empty results.
- **SC-005**: Switching the database provider requires only one environment variable change and zero code changes — verified by running the full test suite against at least two providers.
- **SC-006**: Every Server Action is covered by unit tests for: valid input, invalid input, auth guard, success path, and DB error path (≥80% overall coverage gate enforced in CI).
- **SC-007**: All five report views load and render within 2 seconds for orgs with up to 10,000 contacts, 1,000 deals, and 5,000 tickets.
- **SC-008**: All critical user flows (signup, contact create, deal move, ticket reply, report view) are covered by end-to-end tests that run in CI on every PR.

---

## Assumptions

- The application is web-only; mobile native apps are out of scope for v1.
- Each user belongs to exactly one org; cross-org membership is out of scope for v1.
- The default DB provider for local development is a Docker-hosted Postgres instance.
- Billing plan display is read-only in v1; payment processing is out of scope.
- The free plan limits (500 contacts, 3 users, 100 deals, 500 emails/month) are enforced by application logic, not a billing provider integration.
- Email sending uses Resend as the sole provider; no SMTP fallback is built.
- Inbound email routing (matching replies to threads) relies on a unique reply-to address per thread generated at send time.
- All custom field values are stored as JSONB on the parent record; complex querying on custom fields is out of scope for v1.
- The org admin for any given org is the first user who signed up; there is no super-admin role across orgs.
- Timezone handling for SLA timers and activity timestamps uses UTC storage with client-side display conversion.
