# Research — 009 Activities

## Decision Log

### D-1: Standalone Page vs. Embedded Only

**Decision**: Implement both a standalone `/activities` list page AND embedded `ActivityTimeline` reused in contact/deal/ticket detail pages.

**Rationale**: A global activity feed is needed for the Sales Dashboard (module 011 references it). Embedding ActivityTimeline is already established in module 005 and extended to deals/tickets here.

**Alternatives**: Embedded only (no standalone page) — rejected; sales managers need cross-entity visibility.

---

### D-2: Activity Type Immutability

**Decision**: `type` cannot be changed after creation. `UpdateActivitySchema` omits the `type` field.

**Rationale**: Changing an activity's type could corrupt timeline semantics (e.g., a 'task' becoming a 'call' would orphan done_at logic). Delete + recreate is the correct pattern.

**Alternatives**: Allow type change — rejected; too many edge cases (done_at/due_at semantics differ per type).

---

### D-3: Task Grouping in Application Layer

**Decision**: Task list page fetches all tasks (type='task') via `listActivities({ type: 'task', ... })`, then groups in the component: overdue (due_at < now AND done_at IS NULL), today (due_at::date = today), upcoming (due_at > today), no-due-date.

**Rationale**: Simple and avoids complex DB grouping queries. Activity counts per group are small enough for client-side grouping.

**Alternatives**: DB-level grouping with CASE — possible but complicates parameterization.

---

### D-4: Authorization for deleteActivity

**Decision**: In the action, check: `user.id === activity.owner_id OR user.role === 'admin'`. Otherwise return `{ error: { message: 'You can only delete your own activities.' } }`.

**Rationale**: Matches the spec summary exactly. Enforced server-side; UI can hide the button but action must still validate.

---

### D-5: formData vs. Object Input for Create/Update

**Decision**: `createActivity` and `updateActivity` accept `FormData` (as per the summary) to support file attachments in future. Parse with `Object.fromEntries(formData)` then Zod parse.

**Rationale**: The summary specifies `formData`. Future file attachments (e.g., call recording) will extend this naturally.

**Alternatives**: Typed object input — simpler but would require a breaking change if attachments are added.

---

### D-6: getDealOptions Purpose

**Decision**: `getDealOptions()` returns `Array<{ id, name, contact_name }>` — needed for the activity link picker to show deal name + contact context.

**Rationale**: Reps need to know which contact a deal belongs to when linking an activity. Contact name helps disambiguation.
