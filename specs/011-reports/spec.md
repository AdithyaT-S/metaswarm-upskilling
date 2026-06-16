# Feature Specification: Reports

**Feature Branch**: `011-reports`
**Created**: 2026-06-16
**Module**: 010 — depends on all data modules (005–010), blocks nothing

---

## User Scenarios & Testing

### User Story 1 — Pipeline & Revenue Overview (Priority: P1)

A sales manager opens the Reports page and immediately sees the current pipeline value by stage and this month's revenue vs. last month — without writing any SQL or exporting data.

**Acceptance Scenarios**:

1. **Given** a manager on the Reports page, **When** it loads, **Then** 5 report cards are visible: Contacts Growth, Open Deals by Stage, Monthly Revenue, Tickets by Status, Team Activity.
2. **Given** the Deals funnel card, **When** there are deals in multiple stages, **Then** each stage name and its total value are displayed.
3. **Given** the Revenue card, **When** this month's revenue exceeds last month's, **Then** a positive percentage change indicator is shown.

### User Story 2 — Date Filtering (Priority: P1)

A manager filters all reports to a specific time window to compare performance periods.

**Acceptance Scenarios**:

1. **Given** the date filter at the top, **When** the manager selects "Last 7 days", **Then** all 5 report cards refresh to reflect that window.
2. **Given** the "Custom" preset, **When** the manager enters a from and to date, **Then** reports reflect only data in that range.

### User Story 3 — CSV Export (Priority: P2)

A manager exports the visible report data to CSV for offline analysis.

**Acceptance Scenarios**:

1. **Given** any active filter state, **When** the manager clicks "Export CSV", **Then** a CSV file downloads containing all 5 report sections.

### Edge Cases

- What if a section query fails (e.g. no tickets yet)? → That card shows a "No data" empty state; other cards still render.
- What if the org has no deals? → Deals funnel card shows empty state, not an error.
- What if SLA compliance has no resolved tickets? → SLA % shows "N/A".

---

## Requirements

### Functional Requirements

- **FR-001**: Reports page MUST display 5 cards: Contacts Growth (line chart), Open Deals by Stage (funnel/bar), Monthly Revenue (bar chart), Tickets by Status (donut), Team Activity (table).
- **FR-002**: All cards MUST respect the selected date filter (preset or custom range).
- **FR-003**: Date presets MUST include: Today, Last 7 Days, Last 30 Days (default), Last Quarter, This Year, Custom.
- **FR-004**: Custom date range MUST allow from/to date pickers.
- **FR-005**: Deals card MUST support pipeline filter (dropdown to select a specific pipeline).
- **FR-006**: Contacts card MUST show total contacts created + weekly growth series (line chart).
- **FR-007**: Revenue card MUST show this month vs. last month revenue with a change percentage.
- **FR-008**: Tickets card MUST show count by status + SLA compliance percentage.
- **FR-009**: Team Activity card MUST show calls, emails, meetings per member in the selected period.
- **FR-010**: "Export CSV" button MUST download a CSV containing all visible report data.
- **FR-011**: Each card MUST show a loading skeleton while data is fetching.
- **FR-012**: Each card MUST show an empty/error state if its data section fails or returns no results.

### Key Entities (read-only)

Reads from: contacts, deals, pipeline_stages, tickets, activities, users. No writes.

---

## Success Criteria

- **SC-001**: All 5 report cards render with accurate data — verified by E2E tests with seeded data.
- **SC-002**: Switching date presets refreshes all cards within 2 seconds.
- **SC-003**: CSV export contains data matching what is shown on screen.
- **SC-004**: Reports page is accessible to all roles (admin, member, viewer).

---

## Assumptions

- Charts use Recharts library (installed in this module).
- Reports are read-only — no edit/create actions.
- Pipeline filter on Deals card defaults to all pipelines (null = all).
- No scheduled reports or email delivery in v1.
- All queries run server-side (Server Component data fetch); charts rendered client-side.
