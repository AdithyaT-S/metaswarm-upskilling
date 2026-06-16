# Feature Specification: Settings

**Feature Branch**: `012-settings`
**Created**: 2026-06-16
**Module**: 011 — depends on auth (002); references all modules; blocks nothing

---

## User Scenarios & Testing

### User Story 1 — Profile Management (Priority: P1)

A user updates their display name and avatar URL from the Profile tab so their identity is correct across the app.

**Acceptance Scenarios**:

1. **Given** the Profile tab, **When** a user updates their full name and clicks Save, **Then** the name updates in the DB and the sidebar reflects it on next page load.
2. **Given** the Profile tab, **When** a user clears the avatar URL, **Then** their avatar falls back to initials in the topbar.

### User Story 2 — Team Management (Priority: P1, admin only)

An org admin invites a new team member, changes a member's role, or removes a member — all from the Team tab.

**Acceptance Scenarios**:

1. **Given** an admin on the Team tab, **When** they enter an email and role and click Invite, **Then** the new member appears in the team list immediately.
2. **Given** a member row, **When** an admin selects a new role from the dropdown, **Then** the role updates and the member sees updated permissions on next login.
3. **Given** a member row, **When** an admin clicks Remove, **Then** a confirmation dialog appears; confirming removes the member and nullifies their ownership on all records.
4. **Given** a free plan org with 3 members, **When** an admin tries to invite a 4th, **Then** they see a "plan limit reached" error.
5. **Given** a non-admin user, **When** they open Settings, **Then** Team tab is visible but invite/role/remove controls are disabled or hidden.

### User Story 3 — Pipeline Configuration (Priority: P1, admin only)

An org admin creates a new sales pipeline, adds custom stages, reorders them, and sets a default pipeline.

**Acceptance Scenarios**:

1. **Given** the Pipelines tab, **When** an admin creates a new pipeline named "Enterprise", **Then** it appears in the pipeline list with default stages.
2. **Given** an existing pipeline, **When** an admin adds a stage "Discovery" at position 0, **Then** it appears in the Kanban stage order.
3. **Given** the stage list, **When** an admin drags a stage to reorder, **Then** the new order is persisted.
4. **Given** a non-default pipeline, **When** an admin deletes it with open deals, **Then** all open deals are closed as "lost" before deletion.
5. **Given** the default pipeline, **When** an admin tries to delete it, **Then** they see an error: set another pipeline as default first.

### User Story 4 — Custom Fields (Priority: P2, admin only)

An org admin adds a custom field to the Contact entity so sales reps can capture organisation-specific data.

**Acceptance Scenarios**:

1. **Given** the Custom Fields tab, **When** an admin creates a "Contract Value" field of type "number", **Then** it appears in the contact create/edit form.
2. **Given** an existing custom field, **When** an admin deletes it, **Then** it no longer appears in the contact form (existing data in JSONB is not affected).
3. **Given** a duplicate field name, **When** an admin tries to create it, **Then** an error is shown.

### User Story 5 — Billing Overview (Priority: P2, admin only)

An org admin views their current plan and usage against limits from the Billing tab.

**Acceptance Scenarios**:

1. **Given** a free plan org, **When** an admin opens Billing, **Then** they see usage bars for contacts, users, deals, and emails vs. their free plan limits.
2. **Given** a pro plan org, **When** an admin opens Billing, **Then** usage is shown without limit bars ("Unlimited").

### Edge Cases

- Remove self: blocked with "You cannot remove yourself" error.
- Change own role: blocked with "You cannot change your own role" error.
- Delete pipeline with no open deals: deletes cleanly.
- Custom field with same name as existing: blocked with duplicate error.

---

## Requirements

### Functional Requirements

- **FR-001**: Settings page MUST have 5 tabs: Profile, Team, Pipelines, Custom Fields, Billing.
- **FR-002**: Profile tab MUST allow updating `full_name` and `avatar_url`.
- **FR-003**: Team tab MUST list all org members with name, email, role, and joined date.
- **FR-004**: Admin MUST be able to invite new members by email + role (admin/member/viewer).
- **FR-005**: Admin MUST be able to change a member's role via an inline dropdown.
- **FR-006**: Admin MUST be able to remove a member (with confirm dialog); removal nullifies ownership across all records.
- **FR-007**: Invite/role-change/remove controls MUST be hidden or disabled for non-admin users.
- **FR-008**: Pipelines tab MUST list all pipelines with their stages.
- **FR-009**: Admin MUST be able to create/rename/delete pipelines and add/rename/reorder/delete stages.
- **FR-010**: Deleting a pipeline with open deals MUST auto-close those deals as "lost".
- **FR-011**: Default pipeline MUST be protected from deletion until another is set as default.
- **FR-012**: Custom Fields tab MUST list fields for the "contact" entity type (only in v1).
- **FR-013**: Admin MUST be able to create (name, type, required flag), edit, and delete custom fields.
- **FR-014**: Billing tab MUST display current plan and usage counts vs. limits for contacts, users, deals, emails.
- **FR-015**: Free plan limits MUST be enforced in invite (3 users) and display (usage bars).

### Key Entities

Users, Orgs, Pipelines, PipelineStages, CustomFieldDefinitions

---

## Success Criteria

- **SC-001**: Admin can complete full team lifecycle (invite → role change → remove) — verified by E2E.
- **SC-002**: Pipeline changes (create/stage add/reorder) immediately reflect in the Deals Kanban — verified by cross-module E2E.
- **SC-003**: Custom field added in Settings appears in Contact create form — verified by E2E.
- **SC-004**: Non-admin cannot trigger team or pipeline mutations — verified by unit tests on role guards.

---

## Assumptions

- Invitation in v1 creates the user directly with a placeholder name derived from email — no invite email sent (documented as known gap).
- Custom fields only for `entity_type = 'contact'` in v1; deals/tickets/leads fields are out of scope.
- Billing tab is read-only; no payment integration in v1.
- Settings is admin-only for mutations; all roles can view Profile and Billing tabs.
