# Quickstart & Validation — 009 Activities

## Validation Scenarios

### Scenario 1: Log a Call Activity

1. Navigate to `/activities/new`.
2. Select Type="Call", enter Body="Discussed pricing", link to a contact.
3. Submit → redirected to `/activities`.
4. Verify: call activity appears at top of list with phone icon and body text.

### Scenario 2: Create a Task with Due Date

1. Navigate to `/activities/new`.
2. Select Type="Task", enter Body="Send follow-up email", set Due Date=tomorrow.
3. Submit.
4. Navigate to `/activities?type=task` → verify task appears in "Upcoming" group.

### Scenario 3: Toggle Task Completion

1. In the task list, find an incomplete task (due_at set, done_at null).
2. Click the completion checkbox/button.
3. Verify: task shows as completed (checkbox checked, strikethrough on body).
4. Click again → verify task reverts to incomplete.

### Scenario 4: Delete Own Activity

1. Log in as a non-admin member.
2. Find an activity you own in the list.
3. Click Delete → confirm.
4. Verify: activity removed from list.
5. Try to delete another member's activity → verify error "You can only delete your own activities."

### Scenario 5: Filter Activities

1. Navigate to `/activities`.
2. Filter by Type="Meeting" → only meetings shown.
3. Add Owner filter → further narrowed.
4. Add date range (this week) → narrowed by date.
5. Clear all → full feed returns.

### Scenario 6: Activity on Contact Detail

1. Log an activity linked to a specific contact (from global /activities/new).
2. Navigate to `/contacts/<id>`.
3. Verify: the logged activity appears in the contact's ActivityTimeline.

---

## Unit Test Targets (`src/app/actions/__tests__/activities.test.ts`)

- `createActivity`: FormData parsing, required type field
- `deleteActivity`: owner allowed, non-owner non-admin blocked, admin allowed
- `toggleTaskCompletion`: rejects non-task type; toggles done_at
- `listActivities`: filter combinations (type + owner + date)
- `getDealOptions`: only returns open deals

## E2E Test Files

- `e2e/activities/list.spec.ts` — global feed, filters
- `e2e/activities/create.spec.ts` — create different activity types
- `e2e/activities/tasks.spec.ts` — task list, toggle completion
- `e2e/activities/delete.spec.ts` — owner delete, non-owner rejection
