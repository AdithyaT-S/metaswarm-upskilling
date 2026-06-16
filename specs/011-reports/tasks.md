# Tasks: Reports

**Feature**: 011-reports
**Date**: 2026-06-16

---

## Phase 0: Setup

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-0.1 | Install recharts: `pnpm add recharts` | No | — |
| T-0.2 | Fetch Stitch screen `0a01fa82d8544dd99680ec001f253fb3` (CRM Reports Dashboard) | Yes | — |

---

## Phase 1: Validation + Actions

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-1.1 | Write `src/lib/validations/report.ts` — `reportFiltersSchema` | No | — |
| T-1.2 | Write `src/lib/actions/reports.ts` — `getReportsDashboard` (7 parallel sub-queries + safeQuery), `getPipelinesForFilter`, `exportReportsCSV` | No | T-1.1 |

---

## Phase 2: Page + Filter UI

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-2.1 | Write `src/app/(dashboard)/reports/page.tsx` — Server Component, reads `searchParams`, calls `getReportsDashboard` + `getPipelinesForFilter`, passes to `ReportsClient` | No | T-1.2 |
| T-2.2 | Write `_components/ReportsClient.tsx` — date preset Select, custom date pickers, pipeline Select, Export CSV button (Blob download) | No | T-2.1 |
| T-2.3 | Write `_components/ReportCard.tsx` — card wrapper with title, skeleton, EmptyState | Yes (with T-2.2) | — |
| T-2.4 | Write `loading.tsx` + `error.tsx` | Yes (with T-2.2) | — |

---

## Phase 3: Chart Components (all parallel)

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-3.1 | Write `charts/ContactsLineChart.tsx` — Recharts LineChart from `series[]` | Yes | T-0.1, T-0.2 |
| T-3.2 | Write `charts/DealsFunnelChart.tsx` — Recharts BarChart from `stages[]` sorted by position | Yes | T-0.1, T-0.2 |
| T-3.3 | Write `charts/RevenueBarChart.tsx` — two-bar chart: this_month vs last_month | Yes | T-0.1, T-0.2 |
| T-3.4 | Write `charts/TicketsDonutChart.tsx` — Recharts PieChart from `statuses[]` + SLA% label | Yes | T-0.1, T-0.2 |
| T-3.5 | Write `charts/TeamActivityChart.tsx` — table of members with calls/emails/meetings | Yes | T-0.2 |

---

## Phase 4: Tests

| ID | Task | Parallel? | Blocker |
|----|------|-----------|---------|
| T-4.1 | Unit: `computeDateRange` for all 6 presets; `exportReportsCSV` section selection | No | T-1.2 |
| T-4.2 | E2E: page load with seeded data; date filter changes URL + refreshes cards; CSV download | No | T-2.2, T-3.1–T-3.5 |

---

## Swarm Agent Assignment

| Agent | Tasks |
|---|---|
| architect | T-0.2 (Stitch), T-1.2 (safeQuery pattern) |
| coder | T-0.1, T-1.1, T-2.1–T-2.4, T-3.1–T-3.5 |
| test-automator | T-4.1, T-4.2 |
| code-review | Verify all queries scoped by orgId; no direct DB imports in chart components |
