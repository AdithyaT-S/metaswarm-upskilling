# Research — 005 Contacts

## Decision Log

### D-1: CSV Parsing Location

**Decision**: Parse CSV server-side using papaparse inside the `importContactsCSV` Server Action.

**Rationale**: Keeps raw file data out of the client. Server Actions accept `FormData`, which supports `File` blobs. Avoids sending large payloads back to the client.

**Alternatives**: Client-side parse then POST JSON — rejected because free plan limit and duplicate checks require DB access anyway.

---

### D-2: Custom Fields Rendering Strategy

**Decision**: Fetch `CustomFieldDefinition[]` in the contact detail RSC, merge with `contact.custom_fields` JSONB by `field_name`, render as a key-value list.

**Rationale**: Definitions live in a separate table so that adding a field auto-appears on all contacts without a schema migration per contact.

**Alternatives**: Store field labels in the JSONB — rejected; label changes would be inconsistent across old records.

---

### D-3: Activity Timeline Fetch

**Decision**: `getContact(id)` returns `{ contact, activities, dealsCount }` in a single Server Action call (three DB queries in one round-trip via the same DB connection).

**Rationale**: Avoids waterfall fetches in the RSC. Detail page is read-heavy; combining queries keeps it simple.

**Alternatives**: Separate RSC components fetching in parallel (`Promise.all`) — acceptable but adds complexity for minimal gain.

---

### D-4: Soft Delete vs. Hard Delete

**Decision**: Soft-delete by setting `deleted_at = now()`.

**Rationale**: Preserves FK integrity (activities, deals, tickets still reference the contact). Allows future restore feature. Matches industry norm for CRM data.

**Alternatives**: Hard delete with cascade — rejected; loses activity/deal history.

---

### D-5: Search Debounce

**Decision**: Use URL search params via `useSearchParams` + `useRouter.replace` with a 300 ms debounce on the client; server renders results via RSC.

**Rationale**: Server-side filtering keeps results consistent with pagination. URL params make results bookmarkable and shareable.

**Alternatives**: Client-side filter of prefetched data — rejected; doesn't scale past 25 rows in view.

---

### D-6: Tags Implementation

**Decision**: Store tags as `text[]` in the contacts row. UI uses a shadcn/ui `MultiSelect` or `Combobox` component.

**Rationale**: Simple; no separate tags table needed in v1. Tag taxonomy can be added later via a `contact_tags` table.

**Alternatives**: Separate tags table with junction — overkill for v1 free-text tags.
