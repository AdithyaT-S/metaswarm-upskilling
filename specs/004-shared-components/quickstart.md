# Quickstart Validation Guide: Shared Components

**Feature**: 004-shared-components
**Date**: 2026-06-16

---

## Prerequisites

- Layout shell (003) built and running
- `pnpm dev` running at localhost:3000
- shadcn/ui components installed (see research.md Decision 7)
- `@tanstack/react-table` installed

---

## Storybook / Isolation Testing

Since shared components have no data dependencies, the fastest way to validate them is via a temporary test page at `/test-components` (delete after validation):

```tsx
// src/app/(dashboard)/test-components/page.tsx
// Temporary: delete after shared component validation
```

---

## Scenario 1: DataTable

```tsx
// Render DataTable with 3 mock rows, 2 pages, sortable "Name" column
const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email' },
]
const data = [
  { name: 'Alice', email: 'alice@acme.com' },
  { name: 'Bob', email: 'bob@acme.com' },
  { name: 'Carol', email: 'carol@acme.com' },
]
<DataTable columns={columns} data={data} pageCount={2} page={1}
  onPageChange={console.log} onSortChange={console.log} />
```

**Verify**:
- [ ] 3 rows visible
- [ ] "Page 1 of 2" shown
- [ ] "Name" header clickable; chevron appears on click
- [ ] Prev button disabled (page 1); Next button enabled
- [ ] With `isLoading=true`: skeleton rows shown
- [ ] With `data=[]`: "No results found" shown

---

## Scenario 2: CrudForm

```tsx
const form = useForm({ resolver: zodResolver(z.object({ name: z.string() })) })
<CrudForm title="New Contact" form={form} onSubmit={async (v) => console.log(v)}
  isPending={false} cancelHref="/contacts">
  <FormField control={form.control} name="name" render={({ field }) =>
    <Input placeholder="Name" {...field} />} />
</CrudForm>
```

**Verify**:
- [ ] Title "New Contact" shown
- [ ] Submit button enabled
- [ ] With `isPending=true`: spinner visible, button disabled
- [ ] Cancel link navigates to `/contacts`

---

## Scenario 3: ActivityTimeline

```tsx
const activities = [
  { id: '1', type: 'call', title: 'Called Alice', occurred_at: new Date().toISOString() },
  { id: '2', type: 'note', title: 'Left a note', occurred_at: new Date().toISOString() },
]
<ActivityTimeline activities={activities} />
```

**Verify**:
- [ ] Phone icon for "call", FileText icon for "note"
- [ ] Titles and timestamps visible
- [ ] With `isLoading=true`: 3 skeleton rows
- [ ] With `activities=[]`: "No activity yet."

---

## Scenario 4: StatusBadge + PriorityDot

```tsx
<StatusBadge status="Closed Won" />
<StatusBadge status="open" />
<StatusBadge status="unknown-status" />
<PriorityDot priority="Urgent" />
<PriorityDot priority="Low" />
```

**Verify**:
- [ ] "Closed Won" → green pill
- [ ] "open" → green pill
- [ ] "unknown-status" → gray pill
- [ ] "Urgent" → red dot
- [ ] "Low" → gray dot

---

## Scenario 5: ConfirmDialog

```tsx
const [open, setOpen] = useState(false)
<Button onClick={() => setOpen(true)}>Delete</Button>
<ConfirmDialog open={open} onOpenChange={setOpen}
  title="Delete contact?" description="This cannot be undone."
  onConfirm={() => console.log('confirmed')} destructive />
```

**Verify**:
- [ ] Dialog opens on button click
- [ ] Confirm button is red (destructive)
- [ ] `onConfirm` fires on confirm click; dialog closes
- [ ] Cancel closes dialog without firing `onConfirm`

---

## Scenario 6: SearchInput + TagInput + OwnerSelect

```tsx
<SearchInput onChange={(v) => console.log(v)} />
<TagInput value={['crm', 'sales']} onChange={console.log} />
<OwnerSelect users={[{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]}
  value={null} onChange={console.log} />
```

**Verify**:
- [ ] SearchInput debounces: no console.log on every keystroke (only after 300ms)
- [ ] TagInput shows "crm" and "sales" chips; × removes a chip; Enter adds new tag
- [ ] TagInput ignores duplicate tags (case-insensitive)
- [ ] OwnerSelect opens popover; typing "ali" filters to "Alice"

---

## Unit Tests

```bash
pnpm vitest run src/components/shared/
```

Expected test files (one per component):
- `DataTable.unit.test.tsx`
- `CrudForm.unit.test.tsx`
- `ActivityTimeline.unit.test.tsx`
- `StatusBadge.unit.test.tsx`
- `PriorityDot.unit.test.tsx`
- `EmptyState.unit.test.tsx`
- `ConfirmDialog.unit.test.tsx`
- `SearchInput.unit.test.tsx`
- `PageHeader.unit.test.tsx`
- `OwnerSelect.unit.test.tsx`
- `TagInput.unit.test.tsx`
