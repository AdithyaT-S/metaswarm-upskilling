# /specify-module

Runs the full Speckit planning workflow for a single module: specify → clarify → plan → tasks.
All modules can be planned upfront before any implementation begins.

## Usage

```
/specify-module <module description from BRD>
```

Example:
```
/specify-module Contacts module (BRD §4.2). Create, view, edit, soft-delete contacts. Full-text search, CSV import, activity timeline. Depends on auth module.
```

## Steps

1. **Read `SYSTEM_STATE.md`** before starting — understand what prior modules have already built
   (schema, established patterns, gotchas). Use this context when writing the spec.

2. **Run `/speckit-specify`** with the provided description.
   - Writes `specs/<NNN>-<name>/spec.md` and `checklists/requirements.md`.
   - If clarification questions are surfaced (max 3), present them and wait for user answers.
   - Updates `.specify/feature.json` to point to this feature directory.

3. **Run `/speckit-clarify`** on the generated spec.
   - Resolves any remaining ambiguities.
   - If no clarifications needed, confirms and continues automatically.

4. **Run `/speckit-plan`**:
   - Fetches current library docs via `find-docs` (Context7) for relevant APIs.
   - Checks the Stitch design screen for this module via `stitch-design` skill.
   - Runs Constitution Check gate — stops hard on violations.
   - Generates: `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `plan.md`.
   - Updates CLAUDE.md SPECKIT block to point to this plan.

5. **Run `/speckit-tasks`**:
   - Generates dependency-ordered `tasks.md` from plan.md.
   - Tasks are structured in phases with parallel markers for the swarm.

6. **Stop and present planning summary**:
   - Feature directory created
   - Key decisions from research.md
   - Data model tables
   - Server Action contracts
   - Task phases overview
   - Constitution Check: PASS/FAIL
   - Next step: "Planning complete. Run `/specify-module` for the next module, or `/build-module` when ready to implement."

## Notes

- All modules can be planned before any are built — planning does not require prior modules to be implemented.
- Build order (BRD §9) is enforced in `tasks.md` via dependency markers, not by planning order.
- Implementation is handled separately by Metaswarm via `/build-module`.
