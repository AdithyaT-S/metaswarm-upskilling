# 009 — Activities Module

## User Stories

**US-1**: As a sales rep, I can view a global activity feed filtered by type, owner, or linked entity so I can track what's happening across my CRM.

**Acceptance**: Activities list page shows all activities in the org (scoped), filterable by type (call/email/note/task/meeting), owner, date range, and linked entity (contact/deal/ticket).

**US-2**: As a sales rep, I can log a new activity (call, note, meeting, task) optionally linked to a contact, deal, or ticket.

**Acceptance**: Activity form accepts type, body (notes/outcome), due_at (for tasks), done_at (when completed), and optional entity links. At least one entity link is recommended but not required.

**US-3**: As a sales rep, I can view and manage my tasks — seeing which are due today, overdue, or upcoming.

**Acceptance**: Tasks are activities with type='task'. `due_at` drives ordering. `done_at IS NULL` = incomplete. Toggle completion calls `toggleTaskCompletion`.

**US-4**: As a rep or admin, I can edit or delete an activity I own (admins can delete any).

**Acceptance**: `deleteActivity` succeeds for owner (user.id === activity.owner_id) or admin. Non-owner non-admin gets a 403-equivalent error.

---

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | List activities with filter by type, owner_id, contact_id, deal_id, ticket_id, date range, search on body |
| FR-02 | Paginate results (25 per page), sorted by created_at DESC by default |
| FR-03 | Create activity: type required; body optional but recommended; due_at required if type='task' |
| FR-04 | Link to contact, deal, or ticket (all optional; all nullable FKs) |
| FR-05 | Edit activity: all fields editable except type (immutable after creation) |
| FR-06 | toggleTaskCompletion: only for type='task'; toggles done_at between null and now() |
| FR-07 | deleteActivity: owner or admin; returns error for others |
| FR-08 | Activity type icons: 📞 call, ✉️ email, 📝 note, ✅ task, 🤝 meeting (via icon component, no emoji) |
| FR-09 | Task view: filter activities WHERE type='task', sorted by due_at ASC, group by overdue/today/upcoming |
| FR-10 | getDealOptions(): returns deal list for link picker |
| FR-11 | Activities embedded in contact/deal/ticket detail pages (reuses ActivityTimeline from 005) |
| FR-12 | Activity body is plain text in v1 (no rich text editor) |
| FR-13 | date_from / date_to filters on created_at |

---

## Key Entities

- `activities` — primary table (shared with tickets module)
- `contacts`, `deals`, `tickets` — optional link targets
- `users` — owner

---

## Success Criteria

1. Global activity feed loads with all filters active simultaneously.
2. toggleTaskCompletion reflects immediately (revalidatePath).
3. deleteActivity returns an authorization error for non-owners/non-admins.
4. Task list groups correctly: overdue (due_at < now), today, upcoming.
5. Activity created via the contact detail page appears in both the contact timeline and the global feed.

---

## Assumptions

- Type is immutable after creation (wrong type = delete and recreate).
- Activities linked to deleted entities remain (SET NULL on FK deletes, activity persists).
- Email-type activities created manually represent manually-logged emails (not sent via Resend).
- The ActivityTimeline component (from 005-contacts) is reused on deal and ticket detail pages.
- No bulk delete in v1.
