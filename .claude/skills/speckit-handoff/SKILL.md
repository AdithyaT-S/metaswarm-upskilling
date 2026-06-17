---
description: >
  Generate handoff artifacts after a module is implemented: update SYSTEM_STATE.md
  and populate .beads/knowledge/ entries. Run after /speckit-implement completes.
argument-hint: "[optional notes about this module's completion]"
---

## Context

!`cat .specify/feature.json 2>/dev/null || echo "No active feature"`

## Your task

**Before doing anything else**, read these files using your Read tool:
1. `.specify/feature.json` — parse `feature_directory` to get the active feature path
2. `SYSTEM_STATE.md` — current system state
3. `<feature_directory>/spec.md` — module spec
4. `<feature_directory>/tasks.md` — completed tasks
5. `<feature_directory>/plan.md` — technical plan
6. `<feature_directory>/data-model.md` — DB schema (if it exists)

1. **Read** the completed module's `spec.md`, `plan.md`, `tasks.md` from the current feature directory.

2. **Extract** from what was implemented:
   - New DB tables / columns added (from data-model.md and migration files)
   - New Server Actions created (names, signatures, which file they live in)
   - Patterns established in this module (reusable approaches, component usage)
   - Gotchas discovered during implementation (anything that surprised you or took extra work)
   - Architectural decisions made (with rationale)

3. **Update `SYSTEM_STATE.md`**:
   - Move this module from "Next Up" to "Completed Modules" with a one-line summary
   - Add new tables/columns to "Database Schema" (markdown table format)
   - Add new actions to "Server Actions Inventory" (`functionName(params) → returnType — file path`)
   - Append new patterns to "Established Patterns" (one pattern per bullet, with example)
   - Append gotchas to "Active Gotchas" (one per bullet, with the fix)
   - Update "Next Up" to the next module from BRD §9

4. **Write `.beads/knowledge/` entries** (append JSON lines — one object per line):

   `patterns.jsonl`:
   ```json
   {"id": "<module>-<pattern-slug>", "module": "<module name>", "pattern": "<description>", "example": "<code or file path>", "added": "<date>"}
   ```

   `gotchas.jsonl`:
   ```json
   {"id": "<module>-<slug>", "module": "<module name>", "gotcha": "<what went wrong>", "fix": "<how to avoid it>", "added": "<date>"}
   ```

   `decisions.jsonl`:
   ```json
   {"id": "<module>-<slug>", "module": "<module name>", "decision": "<what was decided>", "rationale": "<why>", "added": "<date>"}
   ```

   `api-behaviors.jsonl`:
   ```json
   {"id": "<module>-<action-name>", "module": "<module name>", "action": "<functionName>", "file": "<path>", "behavior": "<what it does, inputs, outputs>", "added": "<date>"}
   ```

5. **Report** what was updated:
   - Which sections of SYSTEM_STATE.md changed
   - How many entries written to each .beads/knowledge/ file

## Done When

- [ ] SYSTEM_STATE.md updated with this module's schema, actions, patterns, gotchas
- [ ] "Next Up" points to the correct next module
- [ ] .beads/knowledge/ entries written (patterns, gotchas, decisions, api-behaviors)
- [ ] Ready for `/metaswarm:self-reflect` and `git commit`
