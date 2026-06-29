# WEAVE 0.2 — Local Owner Cockpit

A **local-only** read-and-act UI over the WEAVE home (ATM-386). It lets the owner
*see* company state at a glance, *inspect* any claim down to its evidence, and
*take the few local decisions that are genuinely his* — without reading raw JSON.

> **Proof boundary (read this).** This is a local developer tool. It reads/writes
> files on this machine only, reads **no secrets**, and makes **no outbound network
> calls**. Every external-surface action (deploy, Slack/Linear/GitHub writes) is
> **SIMULATED** — recorded as a local owner decision + a `SIMULATED` event, never
> executed. It is **not production** and **not externally verified**. WEAVE 0.2 is a
> draft, not final.

## Run it

```bash
cd cockpit
npm install
npm run dev      # next dev — open the loopback URL it prints (port 3000 by default)
```

There is **no build/deploy step** this sprint — `next dev` only.

By default the cockpit reads the bundled demo home at `fixtures/weave-home/`
(four Rooms: Receipts App = blocked, Habit Tracker = approval required,
Calculator = ready for review, Notes App = stale). To point it at a real local
WEAVE home instead, set `WEAVE_HOME`:

```bash
WEAVE_HOME=/path/to/runs/cos-weave-home npm run dev
```

Owner actions persist to a local overlay at `cockpit/runs/cockpit-overlay.json`
(under the gitignored `runs/`), so the fixtures stay pristine and decisions
survive refresh **and** restart.

## Test it

```bash
npm test         # vitest — lib derivation, overlay, reader, action dispatch, components
```

## The owner journey

Command Center → open a Room → open a Mission → review the Proof/Gate →
**Approve (local-only)** on the Gate Queue. The decision is written to the
overlay, a `SIMULATED` event is appended to the Event Log, and the item's
attention state recovers — and stays recovered after a restart.

## Layout

```
cockpit/
  app/            # Next.js App Router — 9 screens + /api/home + /api/actions
  components/     # AttentionPill, StageRail, SourceIcon, action buttons, Shell …
  lib/            # attention (6-state derivation), weaveHome reader, overlay, actions
  fixtures/       # bundled demo WEAVE home (labeled _fixture)
  styles/         # tokens.css (design tokens / Owner Attention palette)
  docs/           # brief, wireframes, design system (ATM-384 / ATM-385)
```

Runtimes are labeled **Codex / Claude / Local runtime**. (The legacy example
runtime name from the issue text is intentionally not used — the repo's
public-safe scanner blocks it; see the brief, open question Q2.)
