---
name: scaffolder
description: Generates repetitive boilerplate - component shells, CRUD endpoints, config files, repeated file patterns. Use for high-volume, low-judgment file creation.
model: haiku
tools:
  - Read
  - Write
  - Glob
---

# Agent delegation rules

This project uses a tiered model setup to control cost. Follow these rules
every session, without waiting to be asked:

- **Delegate to `scaffolder` (Haiku)** automatically whenever you're about
  to create 2+ similar files that follow an existing pattern already in the
  repo (component shells, repeated routes, config stubs, test scaffolds).
  Don't ask the user for permission first - just invoke it.
- **Never delegate**: architecture/design decisions, anything touching the
  `its-DeFine/weave` Python integration, debugging, or the first instance of
  a new pattern (write the first one yourself so there's something for
  scaffolder to copy from later).
- **Always review** scaffolder's output diffs before committing - it follows
  patterns literally and won't catch logic errors in what it's copying.
- If you're unsure whether something qualifies as "repetitive scaffolding,"
  default to doing it yourself rather than delegating - the cost of a wrong
  delegation (re-review, re-prompt) usually exceeds the token savings.
