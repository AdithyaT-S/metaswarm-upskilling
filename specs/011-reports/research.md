# Research: Reports

**Date**: 2026-06-16

---

## Decision 1: Chart Library — Recharts

**Decision**: Use `recharts` for all 5 chart types.

**Rationale**: Recharts is React-native, composable, and works with shadcn/ui aesthetic. The reference project uses it. Lightweight enough for 5 charts on one page. Alternatives: Chart.js (needs canvas, less composable), D3 (too low-level for this scope), Victory (less community traction).

---

## Decision 2: Data Fetching — Single Server Action, Parallel Queries

**Decision**: `getReportsDashboard(filters)` runs all 7 sub-queries in `Promise.all()`. Each sub-query is wrapped in `safeQuery()` so a single failure doesn't crash the entire response.

**Rationale**: One round-trip from the page. `safeQuery` allows partial failures — the deals card can still render even if the tickets query errors. This matches the reference implementation exactly.

---

## Decision 3: Date Filter — URL Search Params

**Decision**: Date preset and custom range stored in URL search params (`?date_preset=last_30_days`). Page is a Server Component that reads params and passes to `getReportsDashboard`.

**Rationale**: URL-driven state means filters are bookmarkable and shareable. No client state needed for initial render.

---

## Decision 4: Stitch Screen

**Decision**: Fetch `0a01fa82d8544dd99680ec001f253fb3` (CRM Reports Dashboard) before building any chart component.

---

## Decision 5: Pipeline Filter — Separate Dropdown

**Decision**: Pipeline filter is a separate `<Select>` next to the date filter. It only affects the Deals by Stage card (not other cards). Loaded via `getPipelinesForFilter()`.

---

## Decision 6: Export CSV — Client Download

**Decision**: "Export CSV" button calls `exportReportsCSV(filters)` Server Action, receives `{ csv, filename }`, then triggers browser download via `URL.createObjectURL(new Blob([csv]))`.

**Rationale**: No file storage needed. CSV generated server-side from the same queries. Blob URL approach works in all modern browsers.

---

## Decision 7: Empty/Error Per Card

**Decision**: Each of the 5 cards independently handles its empty/error state using the `EmptyState` shared component. The `safeQuery` wrapper in the action returns an empty array on failure, so cards show empty state rather than erroring.
