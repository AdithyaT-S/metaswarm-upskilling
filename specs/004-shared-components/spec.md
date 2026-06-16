# Feature Specification: Shared Components

**Feature Branch**: `004-shared-components`
**Created**: 2026-06-16
**Status**: Draft
**Module**: 003 — depends on Layout Shell (003), blocks all UI modules (004–011)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Consistent List Experience (Priority: P1)

A developer building any module list page (Contacts, Deals, Tickets, etc.) uses a single `DataTable` component that handles pagination, sorting, loading skeletons, and empty states — without reimplementing this logic per module.

**Why this priority**: DataTable is used on every list page. Inconsistency in table behaviour is the most visible quality problem in a CRM.

**Independent Test**: A page using `DataTable` with mock data shows rows, skeleton loading state, column sort toggle, prev/next pagination, and the correct empty state when data is empty — all without writing any table rendering logic in the page itself.

**Acceptance Scenarios**:

1. **Given** a DataTable with 25 items and pageSize=10, **When** the page renders, **Then** exactly 10 rows are shown and "Page 1 of 3" is displayed.
2. **Given** a DataTable with a sortable column, **When** the user clicks the column header, **Then** an up/down chevron appears and the `onSortChange` callback fires with the column name and direction.
3. **Given** a DataTable with `isLoading=true`, **When** it renders, **Then** 5 skeleton rows are shown instead of real rows.
4. **Given** a DataTable with no data, **When** it renders, **Then** the custom `emptyState` node is shown (or the default "No results found" message).
5. **Given** a DataTable with `onRowClick`, **When** the user clicks a row, **Then** the callback fires with that row's data.

---

### User Story 2 — Consistent Form Experience (Priority: P1)

A developer building any create/edit form (new contact, new deal, etc.) uses `CrudForm` to get a consistent card layout, submit button with loading spinner, and cancel link — without reimplementing form boilerplate.

**Why this priority**: Every module has at least one form. Inconsistent form layout and behaviour degrades the UX.

**Independent Test**: A form using `CrudForm` shows its title, renders children fields, disables the submit button with a spinner while `isPending=true`, and navigates to `cancelHref` when "Cancel" is clicked.

**Acceptance Scenarios**:

1. **Given** a `CrudForm` with `isPending=false`, **When** the user fills in fields and clicks Save, **Then** the `onSubmit` handler fires with the form values.
2. **Given** a `CrudForm` with `isPending=true`, **When** it renders, **Then** the submit button is disabled and shows a spinner.
3. **Given** a `CrudForm` with `cancelHref="/contacts"`, **When** the user clicks Cancel, **Then** they navigate to `/contacts`.
4. **Given** a `CrudForm` with no `cancelHref`, **When** it renders, **Then** no Cancel link is shown.

---

### User Story 3 — Consistent Status, Priority & Activity Patterns (Priority: P1)

End users see the same visual status badges (colored pills), priority indicators (colored dots), and activity timeline format across every module — so they never need to re-learn the UI when switching between Contacts, Deals, and Tickets.

**Why this priority**: Visual consistency is a core quality criterion for any CRM. If a "Closed Won" badge looks different on Deals vs. Reports, users lose trust.

**Independent Test**: A page showing `StatusBadge`, `PriorityDot`, and `ActivityTimeline` renders with the correct colors, icons, and layout — matching the Stitch design system screen exactly.

**Acceptance Scenarios**:

1. **Given** a `StatusBadge` with `status="Closed Won"`, **When** it renders, **Then** it shows a green pill with the text "Closed Won".
2. **Given** a `StatusBadge` with an unknown status, **When** it renders, **Then** it falls back to a neutral gray pill.
3. **Given** a `PriorityDot` with `priority="Urgent"`, **When** it renders, **Then** it shows a red indicator.
4. **Given** an `ActivityTimeline` with 3 activities of different types, **When** it renders, **Then** each activity shows the correct icon for its type and the activity's title, description, and timestamp.
5. **Given** an `ActivityTimeline` with `isLoading=true`, **When** it renders, **Then** 3 skeleton rows are shown.

---

### User Story 4 — Supporting Primitives (Priority: P2)

A developer building any module can access `EmptyState`, `ConfirmDialog`, `SearchInput`, `PageHeader`, `OwnerSelect`, and `TagInput` rather than implementing one-off versions that diverge in style.

**Why this priority**: These primitives are used everywhere but are not on the critical path for the first module (Contacts) to render.

**Acceptance Scenarios**:

1. **Given** an `EmptyState` with title and action, **When** it renders, **Then** the title, optional description, and action button are shown.
2. **Given** a `ConfirmDialog` that is open, **When** the user clicks the confirm button, **Then** the `onConfirm` callback fires and the dialog closes.
3. **Given** a `SearchInput` with `debounceMs=300`, **When** the user types, **Then** the `onChange` callback fires only after 300ms of inactivity.
4. **Given** a `PageHeader` with title, subtitle, and an action button, **When** it renders, **Then** all three are shown in the correct layout.
5. **Given** an `OwnerSelect` with a list of users, **When** the user opens it and types a name, **Then** the list filters to matching users.
6. **Given** a `TagInput` with two existing tags, **When** the user types a new tag and presses Enter, **Then** the tag is added; when they click × on a tag, **Then** it is removed.

---

### Edge Cases

- What if `DataTable` receives an empty `columns` array? → Renders the table shell with no columns (no crash).
- What if `ActivityTimeline` receives an activity type not in the config? → Falls back to the "note" icon config.
- What if `StatusBadge` receives a status string not in the color map? → Renders a neutral gray pill.
- What if `OwnerSelect` has no users to show? → Shows "No users found" in the dropdown.
- What if `TagInput` already has a tag and the user tries to add the same tag again? → The duplicate is silently ignored.
- What if `ConfirmDialog` is closed before confirming? → The `onCancel` callback fires (or nothing, if not provided) — the action is NOT triggered.

---

## Requirements *(mandatory)*

### Functional Requirements

**DataTable**
- **FR-001**: `DataTable` MUST render tabular data with configurable columns using server-driven pagination (page number + page count props, not client-side slicing).
- **FR-002**: `DataTable` MUST support sortable columns via clickable column headers, emitting an `onSortChange(column, direction)` callback.
- **FR-003**: `DataTable` MUST display skeleton loading rows when `isLoading=true`.
- **FR-004**: `DataTable` MUST display a customisable empty state when `data` is empty.
- **FR-005**: `DataTable` MUST fire `onRowClick(row)` when a row is clicked, if the prop is provided.
- **FR-006**: `DataTable` MUST render prev/next pagination controls showing the current page and total page count.

**CrudForm**
- **FR-007**: `CrudForm` MUST render a card with a title, optional description, form fields (children), and a submit button.
- **FR-008**: `CrudForm` MUST disable the submit button and show a spinner when `isPending=true`.
- **FR-009**: `CrudForm` MUST render a Cancel link that navigates to `cancelHref` when provided.

**ActivityTimeline**
- **FR-010**: `ActivityTimeline` MUST render a vertical timeline of activities, each showing an icon (by activity type), title, optional description, and formatted timestamp.
- **FR-011**: `ActivityTimeline` MUST support activity types: Call, Email, Note, Task, Meeting — each with a distinct icon and background colour.
- **FR-012**: `ActivityTimeline` MUST show skeleton rows when `isLoading=true`.
- **FR-013**: `ActivityTimeline` MUST show "No activity yet." when the activity list is empty.

**StatusBadge**
- **FR-014**: `StatusBadge` MUST render a colored pill label for any known status string (lead, deal, and ticket statuses).
- **FR-015**: `StatusBadge` MUST fall back to a neutral gray pill for unknown status strings.

**PriorityDot**
- **FR-016**: `PriorityDot` MUST render a colored dot indicator for priorities: Low (gray), Medium (amber), High (orange), Urgent (red).

**EmptyState**
- **FR-017**: `EmptyState` MUST render a centered message with a title, optional description, and optional action button.

**ConfirmDialog**
- **FR-018**: `ConfirmDialog` MUST render an accessible modal with a title, description, cancel button, and confirm button.
- **FR-019**: `ConfirmDialog` MUST fire `onConfirm` when the confirm button is clicked and close the dialog.
- **FR-020**: `ConfirmDialog` MUST support a `destructive` variant that renders the confirm button in red.

**SearchInput**
- **FR-021**: `SearchInput` MUST render a text input with a search icon and fire a debounced `onChange` callback.
- **FR-022**: Default debounce delay MUST be 300ms; configurable via `debounceMs` prop.

**PageHeader**
- **FR-023**: `PageHeader` MUST render a page-level heading with title, optional subtitle, and an optional `actions` slot for buttons.

**OwnerSelect**
- **FR-024**: `OwnerSelect` MUST render a searchable dropdown of org members with name filtering.
- **FR-025**: `OwnerSelect` MUST fire `onChange(userId)` when a user is selected and show the selected user's name in the trigger.

**TagInput**
- **FR-026**: `TagInput` MUST render existing tags as removable chips and allow adding new tags by typing and pressing Enter or comma.
- **FR-027**: `TagInput` MUST ignore duplicate tags (case-insensitive comparison).

### Key Entities

- No database entities. All components are pure UI with no data persistence.
- `Activity` type is consumed from the auth+activities data model (defined in module 008).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 11 shared components render without errors in isolation — verified by unit tests with 100% component branch coverage.
- **SC-002**: `DataTable` with 1,000 columns-definition variations renders in under 16ms per render cycle (no layout thrash).
- **SC-003**: Every module (004–011) uses these shared components on their list and form pages — verified by import analysis at module completion.
- **SC-004**: No module duplicates DataTable, CrudForm, StatusBadge, or ActivityTimeline logic — verified by code review gate.
- **SC-005**: All components are keyboard-accessible and pass basic ARIA checks — verified by Playwright accessibility assertions on the ConfirmDialog and OwnerSelect.

---

## Assumptions

- `OwnerSelect` fetches the org member list via a prop (array of `{ id, name }`) — it does NOT query the DB itself. The parent page is responsible for fetching members.
- `ActivityTimeline` receives pre-fetched activities as a prop — it does NOT query the DB.
- `EmailComposer` and `EmailThreadView` are email-module-specific shared components; they will be added to `src/components/shared/` during the email module build (009), not here.
- The `ACTIVITY_TYPE_CONFIG` constant (icon map for activity types) is co-located in `src/lib/utils/activity.ts` — this file is in scope for this module.
- The `formatDateTime` utility is co-located in `src/lib/utils/format.ts` — also in scope.
- shadcn/ui components required: `Table`, `Form`, `Button`, `Input`, `Card`, `Dialog`, `AlertDialog`, `Skeleton`, `Badge`, `Popover`, `Command`, `Select` — all installed during this module.
- TanStack Table v8 (`@tanstack/react-table`) is the table library for DataTable. It is installed as part of this module.
