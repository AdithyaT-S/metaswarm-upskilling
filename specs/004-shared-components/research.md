# Research: Shared Components

**Date**: 2026-06-16
**Feature**: 004-shared-components

---

## Decision 1: Table Library — TanStack Table v8

**Decision**: Use `@tanstack/react-table` v8 (headless) for `DataTable`.

**Rationale**: TanStack Table v8 is headless — it provides row models, sorting state, and pagination logic without opinionated UI. Combined with shadcn `Table` primitives, it produces exactly the visual result from the Stitch contacts list screen. The reference project (`C:\Works\anticlock`) uses this exact combination. Alternative (plain `<table>`) would require reimplementing sort/pagination state in every table consumer.

**Alternatives considered**: AG Grid (too heavy, licensed), React Table v7 (old API), plain `<table>` (no built-in sort/pagination state).

---

## Decision 2: Form Library — react-hook-form + shadcn Form

**Decision**: `CrudForm` wraps `react-hook-form` via shadcn `Form` primitives (`FormField`, `FormItem`, `FormLabel`, `FormMessage`).

**Rationale**: shadcn ships a `Form` component that is a thin wrapper around `react-hook-form`. All form field components (`FormField`, `FormItem`, etc.) integrate directly with `useForm()`. This is the established pattern for the project — validated by the constitution (Zod at every boundary) and the reference project's form pages. `CrudForm` does NOT call `useForm` itself — it accepts a `form` prop (a `UseFormReturn<T>`) so each page owns its own schema and state.

**Alternatives considered**: Formik (heavier, less shadcn-idiomatic), uncontrolled forms (no schema validation).

---

## Decision 3: Activity Type Config — Co-located Constant

**Decision**: `ACTIVITY_TYPE_CONFIG` is a constant in `src/lib/utils/activity.ts`. It maps activity type strings to `{ Icon, bg }` objects using Lucide icons.

**Rationale**: The icon/color config is a cross-cutting concern referenced by `ActivityTimeline` and potentially the activity creation forms. A single source of truth in `lib/utils/` avoids divergence. The reference project uses this pattern.

**Icon assignments**:
| Type | Icon | Background |
|------|------|-----------|
| call | Phone | bg-blue-50 |
| email | Mail | bg-purple-50 |
| note | FileText | bg-gray-50 |
| task | CheckSquare | bg-green-50 |
| meeting | Calendar | bg-amber-50 |

---

## Decision 4: OwnerSelect — Combobox Pattern

**Decision**: `OwnerSelect` uses shadcn `Popover` + `Command` (the combobox pattern) for a searchable user dropdown.

**Rationale**: shadcn's Combobox pattern (`Popover` + `Command`) is the standard approach for searchable selects. It's keyboard-accessible, renders correctly in all viewport sizes, and matches the Stitch design system. The component receives `users: { id: string; name: string }[]` as a prop — it does NOT fetch from the DB. The parent page is responsible for fetching org members.

---

## Decision 5: SearchInput — useRef Debounce

**Decision**: `SearchInput` uses `useRef` + `setTimeout`/`clearTimeout` for debouncing, not a library.

**Rationale**: Debouncing is 5 lines of code using `useRef`. No additional library needed. `debounceMs` prop defaults to 300ms. This keeps the component dependency-free.

---

## Decision 6: Stitch Reference Screens

**Decision**: Two Stitch screens inform this module's design:
1. `asset-stub-assets_0c364825aa6640ddb1dd32c3ab87ab81` — Design System: defines color tokens, typography, spacing
2. `c744ca79a3b14fb49ca284b552f1c7f0` — CRM Contacts List: shows DataTable in production context (column headers, row height, pagination controls, search placement)

**Action**: Fetch both screens via `stitch-design` skill before writing any component.

---

## Decision 7: shadcn/ui Components Required

**Decision**: The following shadcn components must be installed (via `npx shadcn-ui@latest add`) before building shared components:

| Component | Used by |
|-----------|---------|
| `table` | DataTable |
| `skeleton` | DataTable, ActivityTimeline |
| `form` | CrudForm |
| `button` | CrudForm, ConfirmDialog, EmptyState |
| `card` | CrudForm |
| `alert-dialog` | ConfirmDialog |
| `input` | SearchInput, TagInput |
| `badge` | StatusBadge |
| `popover` | OwnerSelect |
| `command` | OwnerSelect |

All of these are already available in the reference project's `src/components/ui/`. They will be installed as part of this module's Phase 0.

---

## Decision 8: TagInput — Controlled Value

**Decision**: `TagInput` is a controlled component — it accepts `value: string[]` and `onChange: (tags: string[]) => void`. It does not manage its own tag list state.

**Rationale**: Form pages use `react-hook-form`. A controlled TagInput integrates naturally with `Controller` or `FormField`. Uncontrolled TagInput would require additional ref forwarding.

**Duplicate handling**: Case-insensitive check before adding: `if (!value.map(t => t.toLowerCase()).includes(newTag.toLowerCase()))`.
