# Server Action Contracts: Shared Components

**Feature**: 004-shared-components
**Date**: 2026-06-16

---

## No Server Actions

Shared components are pure UI — they have **no Server Actions**.

All data is passed in as props by the parent page or layout. The components render data; they never fetch or mutate it directly.

---

## Component Props Contracts

These are the TypeScript prop interfaces that constitute the component's public API contract.

### DataTable\<T\>

```ts
interface DataTableProps<T> {
  columns: ColumnDef<T>[]        // TanStack Table column definitions
  data: T[]                      // Current page's rows
  pageCount: number              // Total number of pages
  page: number                   // Current page (1-indexed)
  onPageChange: (page: number) => void
  onSortChange?: (column: string, dir: 'asc' | 'desc') => void
  onRowClick?: (row: T) => void
  isLoading?: boolean            // Default: false
  emptyState?: ReactNode         // Default: <EmptyState title="No results found" />
}
```

### CrudForm\<T extends FieldValues\>

```ts
interface CrudFormProps<T extends FieldValues> {
  title: string
  description?: string
  form: UseFormReturn<T>          // From react-hook-form useForm()
  onSubmit: (values: T) => Promise<void>
  isPending?: boolean            // Default: false
  submitLabel?: string           // Default: "Save"
  cancelHref?: string            // If absent, no Cancel link shown
  children: ReactNode            // FormField components
}
```

### ActivityTimeline

```ts
interface ActivityTimelineProps {
  activities: Activity[]
  isLoading?: boolean            // Default: false
}
```

### StatusBadge

```ts
interface StatusBadgeProps {
  status: string                 // e.g. "Closed Won", "open", "Qualified"
}
```

### PriorityDot

```ts
interface PriorityDotProps {
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  showLabel?: boolean            // Default: false — show text label next to dot
}
```

### EmptyState

```ts
interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode             // e.g. <Button>Add Contact</Button>
}
```

### ConfirmDialog

```ts
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
  confirmLabel?: string          // Default: "Confirm"
  destructive?: boolean          // Default: false — red confirm button
}
```

### SearchInput

```ts
interface SearchInputProps {
  value?: string                 // Controlled value (optional — can be uncontrolled)
  onChange: (value: string) => void   // Debounced
  placeholder?: string           // Default: "Search..."
  debounceMs?: number            // Default: 300
}
```

### PageHeader

```ts
interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}
```

### OwnerSelect

```ts
interface OwnerSelectProps {
  users: { id: string; name: string }[]
  value: string | null           // Currently selected user ID
  onChange: (userId: string | null) => void
  placeholder?: string           // Default: "Select owner..."
  disabled?: boolean
}
```

### TagInput

```ts
interface TagInputProps {
  value: string[]                // Controlled array of tag strings
  onChange: (tags: string[]) => void
  placeholder?: string           // Default: "Add tag..."
  maxTags?: number               // Optional limit
}
```
