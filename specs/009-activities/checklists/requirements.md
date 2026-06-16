# Requirements Checklist — 009 Activities

## Quality Gates

- [x] Every Server Action calls `getAuthUser()` first
- [x] All inputs validated with Zod before DB write
- [x] All DB queries through `queryForOrg()`
- [x] No DB imports outside `src/lib/db/`
- [x] No TypeScript `any` except raw DB boundaries
- [x] RLS on `activities` table
- [x] deleteActivity: owner OR admin check in action layer
- [x] toggleTaskCompletion: type='task' validation in action layer
- [x] Activity type immutable after creation (excluded from UpdateActivitySchema)
- [x] Task group logic (overdue/today/upcoming) computed in application layer
- [x] `revalidatePath` called after all mutations
- [x] Vitest unit tests for all actions
- [x] Playwright E2E for create, edit, delete, task toggle flows

## Scope Boundaries

- Email sending is in module 010. Manually-logged email activities are type='email' without a thread.
- Rich text editor for body is out of scope for v1.
- Activity reminders/notifications are out of scope for v1.
- Bulk actions are out of scope for v1.
