# Implementation Plan: Reports

**Feature**: 011-reports
**Date**: 2026-06-16
**Depends on**: 005–010 (reads from all their tables)
**Blocks**: nothing

---

## Constitution Check

| Principle | Status | Notes |
|---|---|---|
| I. TypeScript Strict | PASS | Typed return shapes; no `any` in action or chart props |
| II. YAGNI | PASS | No scheduled reports, no email delivery, no custom chart config |
| III. Provider Architecture | PASS | All reads via `queryForOrg`; no direct DB SDK imports in page |
| IV. Multi-Tenancy | PASS | All 7 sub-queries scoped by `orgId` via `queryForOrg` |
| V. Zod at Every Boundary | PASS | `reportFiltersSchema` validates all filter params |
| VI. Auth Guard First | PASS | `getAuthUser()` first in all actions |
| VII. Test Gates | PASS | Unit tests on date range logic + action; E2E on page load + export |
| VIII. Stitch-First UI | PASS | CRM Reports Dashboard screen `0a01fa82d8544dd99680ec001f253fb3` fetched first |

All 8 principles: **PASS**

---

## Source Code Structure

```
src/
  app/(dashboard)/reports/
    page.tsx                     # Server Component — reads searchParams, calls getReportsDashboard
    loading.tsx
    error.tsx
    _components/
      ReportsClient.tsx          # Client — date filter UI, pipeline filter, export button
      ReportCard.tsx             # Wrapper card with title + loading/empty state
      charts/
        ContactsLineChart.tsx    # Recharts LineChart
        DealsFunnelChart.tsx     # Recharts BarChart (horizontal)
        RevenueBarChart.tsx      # Recharts BarChart
        TicketsDonutChart.tsx    # Recharts PieChart
        TeamActivityChart.tsx    # Table (no chart — rows per member)
  lib/
    actions/reports.ts           # getReportsDashboard, getPipelinesForFilter, exportReportsCSV
    validations/report.ts        # reportFiltersSchema
```

---

## Phase 0: Install Recharts

```bash
pnpm add recharts
```

Fetch Stitch screen `0a01fa82d8544dd99680ec001f253fb3`.

---

## Phase 1: Validation + Actions

Write `src/lib/validations/report.ts` — `reportFiltersSchema`.  
Write `src/lib/actions/reports.ts` — `getReportsDashboard`, `getPipelinesForFilter`, `exportReportsCSV`.  
Key: `safeQuery` wrapper so partial failures don't crash the whole response.

---

## Phase 2: Reports Page (Server Component)

`page.tsx` reads `searchParams`, calls `getReportsDashboard`, passes data to `ReportsClient`.  
`ReportsClient.tsx` handles filter UI state (date preset selector, custom date pickers, pipeline select, export button).  
URL-driven: changing filters updates URL params → triggers Server Component re-render.

---

## Phase 3: Chart Components (all parallel)

Five chart components, each receives typed props from `ReportsDashboardData`:
- `ContactsLineChart` — `series: { week, count }[]`
- `DealsFunnelChart` — `stages: { stage_name, value }[]` (bar chart sorted by position)
- `RevenueBarChart` — this_month + last_month as two bars
- `TicketsDonutChart` — `statuses: { status, count }[]` + SLA % below
- `TeamActivityChart` — table rows per member with calls/emails/meetings

All wrapped in `ReportCard` for consistent header + skeleton + empty state.

---

## Phase 4: CSV Export

"Export CSV" button in `ReportsClient` calls `exportReportsCSV()` as a Server Action, receives `{ csv, filename }`, uses `URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))` to trigger download.

---

## Phase 5: Tests

Unit: `computeDateRange` for each preset. `exportReportsCSV` section filtering.  
E2E: page load with seeded data; date filter changes URL; CSV downloads.
