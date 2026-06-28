# WEAVE 0.2 Owner Cockpit — Screen Map & Wireframes

> Deliverable for **[ATM-385](https://linear.app/atumera-llc/issue/ATM-385/weave-02-screen-map-wireframes-and-visual-design-for-local-owner)** (part 1 — route/screen map + low-fidelity wireframes).
> Built from [PRODUCT_INGREDIENTS_BRIEF.md](PRODUCT_INGREDIENTS_BRIEF.md). Low-fi wireframes are greyscale, structure-only; color/visual treatment arrives in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (part 2).
> Wireframe sources: [`assets/wireframes/`](assets/wireframes/).

---

## 1. Route / screen map (Next.js App Router)

| # | Screen | Route | Wireframe | Primary data | Owner action |
|---|---|---|---|---|---|
| 1 | Command Center / Home | `/` | [command-center.svg](assets/wireframes/command-center.svg) | `state.json`, `registry.json`, trays, `events.jsonl` | — (hub) |
| 2 | Room List | `/rooms` | [rooms.svg](assets/wireframes/rooms.svg) | `registry.json` + each `app.json` | — |
| 2b | Room Detail | `/rooms/[id]` | [rooms.svg](assets/wireframes/rooms.svg) (lower panel) | `app.json`, `lifecycle.json`, trays | acknowledge blocker |
| 3 | Mission Board | `/missions` | [missions.svg](assets/wireframes/missions.svg) | all apps' `tasks.json` | — |
| 3b | Mission Detail | `/missions/[id]` | [missions.svg](assets/wireframes/missions.svg) (lower panel) | `tasks.json` + `WP-*.md` + proof | mark ready-for-review |
| 4 | Proof / Evidence Ledger | `/proof` | [proof-ledger.svg](assets/wireframes/proof-ledger.svg) | `proof-tray.json` + `events.jsonl` | — |
| 5 | Gate / Approval Queue | `/gates` | [gates.svg](assets/wireframes/gates.svg) | `deployment-gates.json` + eval gates | **approve / hold (local-only)** |
| 6 | Runtime / Agent panel | `/runtime` | [runtime.svg](assets/wireframes/runtime.svg) | `worker_orchestration`, task assignment | post local note |
| 7 | Settings / Data Source | `/settings` | [settings.svg](assets/wireframes/settings.svg) | resolved home path, fixture flag | switch source |

**Primary owner journey** (the MVP must demo): `/` → `/rooms/[id]` → `/missions/[id]` → `/gates` → **Approve (local-only)** → state persists.

---

## 2. Global layout (identical on every screen)

Every wireframe uses a fixed 1440×900 frame so the build maps 1:1:

```
┌───────────────────────────────────────────────────────────────────────┐
│  PROOF-BOUNDARY BANNER (full width, 30px)                               │  persistent
├────────────┬──────────────────────────────────────────────────────────┤
│            │  CONTENT  (x≈244 → 1408, 24px padding)                     │
│  LEFT NAV  │   ┌─ page header: title · attention legend · context ──┐  │
│  (220px)   │   │                                                     │  │
│  · WEAVE   │   │  page-specific panels                               │  │
│  · 7 dests │   │                                                     │  │
│            │   └─────────────────────────────────────────────────────┘ │
└────────────┴──────────────────────────────────────────────────────────┘
```

- **Proof-boundary banner** (top, always visible): `Local-only cockpit · fixture data · no secrets · external actions simulated`.
- **Left nav** (220px): brand "WEAVE · Owner Cockpit" + 7 destinations (Command Center, Rooms, Missions, Proof Ledger, Gates, Runtime, Settings). Active item highlighted.
- **Content**: each screen's page header carries the title and, where relevant, the **Owner Attention legend** (6 states) and a **Mirror/Courier badge**.

---

## 3. Owner Attention legend (the shared status vocabulary)

Six states, rendered as the **Attention Pill** component, shown in priority order. Low-fi shows them as labeled grey chips; hi-fi assigns the semantic palette (see DESIGN_SYSTEM.md §3).

`Blocked` · `Approval required` · `Needs owner` · `Ready for review` · `Stale / no proof` · `None`

Derivation rules are defined in the brief §3.3 and implemented test-first in `lib/attention.ts`.

---

## 4. Per-screen layout notes

**1 · Command Center** — top KPI strip (Active Rooms, Open Missions, Needs-owner, Blocked, Ready-for-review); a primary "Needs your attention" list (attention pill + room + reason + target, severity-sorted, clickable); an "Active Rooms" card grid; a "Latest runtime checkpoints" feed.

**2 · Rooms** — *List:* table of rooms (name, app id, current stage, intent one-liner, attention pill, open missions) with an attention filter. *Detail:* header (name + attention + Mirror badge) → 11-step **stage rail** → Active Missions → Proof summary → Blockers (state + missing + next action) → Linked artifacts.

**3 · Missions** — *Board:* missions across rooms grouped by status, each card = objective + room + runtime + due + proof + attention pill. *Detail:* objective → **Allowed vs Forbidden** two-column scope → runtime + checkpoint → evidence-required checklist + proof status → **review-loop stepper** → non-claims callout → "Mark ready for review" (local-only).

**4 · Proof Ledger** — list of Proof Envelopes, each expandable: claim → proof surface → evidence refs → commands → proof boundary + **non-claims callout** → review-loop state. Side "Event Log" feed; `SIMULATED` external effects visually distinct from real local proof.

**5 · Gate Queue** — list of gates: gated action + risk/blast-radius + required approval/per-provider status + decision/status; **"Approve (local-only)"** + "Hold" buttons with the explicit `external effect SIMULATED` note; post-approve confirmation state.

**6 · Runtime panel** — runtime list (Codex / Claude / Local runtime) with health/checkpoint + attached mission + latest status; selected-runtime detail (blocker/input request + status history); "Leave a note (local-only)" composer.

**7 · Settings** — data-source toggle (Fixture vs Live local home, with resolved path placeholder); proof-boundary panel; Mirrors/Couriers panel (Linear/Slack/GitHub = reflects state, never source of truth; shown disconnected/simulated); "WEAVE 0.2 — draft, not final" note.
