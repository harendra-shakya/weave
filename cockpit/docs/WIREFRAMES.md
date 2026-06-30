# WEAVE 0.2 Owner Cockpit — Screen Map & Wireframes

> Deliverable for **[ATM-385](https://linear.app/atumera-llc/issue/ATM-385/weave-02-screen-map-wireframes-and-visual-design-for-local-owner)** (part 1 — route/screen map + low-fidelity wireframes).
> Built from [PRODUCT_INGREDIENTS_BRIEF.md](PRODUCT_INGREDIENTS_BRIEF.md). Uses the **canonical WEAVE 0.2 model** (Domain · Node · Workspace · Agent · Task · Event · Proof · Gate · Mirror · Context Pack) as the primary vocabulary; legacy terms (Room/Mission/Runtime/Courier) appear only as labeled aliases.
> Low-fi wireframes are greyscale, structure-only; color/visual treatment arrives in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (part 2). Wireframe sources: [`assets/wireframes/`](assets/wireframes/).

---

## 1. Route / screen map (Next.js App Router)

| # | Screen | Route | Wireframe | Primary data | Owner action |
|---|---|---|---|---|---|
| 1 | Command Center | `/` | [command-center.svg](assets/wireframes/command-center.svg) | `state.json`, `node.json`, `registry.json`, trays, `events.jsonl` | — (hub) |
| 2 | Workspace List | `/workspaces` | [workspaces.svg](assets/wireframes/workspaces.svg) | `registry.json` + each `app.json` | — |
| 2b | Workspace Detail | `/workspaces/[id]` | [workspaces.svg](assets/wireframes/workspaces.svg) (lower panel) | `app.json`, `lifecycle.json`, trays | acknowledge blocker |
| 3 | Task Board | `/tasks` | [tasks.svg](assets/wireframes/tasks.svg) | all Workspaces' `tasks.json` | — |
| 3b | Task Detail | `/tasks/[id]` | [tasks.svg](assets/wireframes/tasks.svg) (lower panel) | `tasks.json` + `WP-*.md` (Context Pack) + Proof | mark ready-for-review |
| 4 | Proof / Evidence Ledger | `/proof` | [proof-ledger.svg](assets/wireframes/proof-ledger.svg) | `proof-tray.json` + `events.jsonl` | — |
| 5 | Gate / Approval Queue | `/gates` | [gates.svg](assets/wireframes/gates.svg) | `deployment-gates.json` + eval gates | **approve / hold / defer (local-only)** |
| 6 | Agents panel | `/agents` | [agents.svg](assets/wireframes/agents.svg) | `agents.json`, `worker_orchestration`, task assignment | post local note |
| 7 | Settings / Data Source | `/settings` | [settings.svg](assets/wireframes/settings.svg) | resolved Domain path, Node, fixture flag | switch source |

**Primary owner journey** (the MVP must demo): `/` → `/workspaces/[id]` → `/tasks/[id]` → `/gates` → **Approve (local-only)** → state persists.

---

## 2. Global layout (identical on every screen)

Every wireframe uses a fixed 1440×900 frame so the build maps 1:1:

```
┌───────────────────────────────────────────────────────────────────────┐
│  PROOF-BOUNDARY BANNER (full width, 30px)                               │  persistent
├────────────┬──────────────────────────────────────────────────────────┤
│            │  CONTENT  (x≈244 → 1408, 24px padding)                     │
│  LEFT NAV  │   ┌─ page header: title · attention legend · Domain·Node ┐ │
│  (220px)   │   │                                                     │  │
│  · WEAVE   │   │  page-specific panels                               │  │
│  · 7 dests │   │                                                     │  │
│            │   └─────────────────────────────────────────────────────┘ │
└────────────┴──────────────────────────────────────────────────────────┘
```

- **Proof-boundary banner** (top, always visible): `Local-only cockpit · fixture data · no secrets · external actions simulated`.
- **Left nav** (220px): brand "WEAVE · Owner Cockpit" + 7 destinations (Command Center, Workspaces, Tasks, Proof Ledger, Gates, Agents, Settings). Active item highlighted.
- **Content**: each screen's page header carries the title and, where relevant, the **Owner Attention legend** (6 states), a **Mirror badge**, and the **Domain · Node** identifier strip.

---

## 3. Owner Attention legend (the shared status vocabulary)

Six states, rendered as the **Attention Pill** component, shown in priority order. Low-fi shows them as labeled grey chips; hi-fi assigns the semantic palette (see DESIGN_SYSTEM.md §3).

`Blocked` · `Approval required` · `Needs owner` · `Ready for review` · `Stale / no proof` · `None`

Derivation rules are defined in the brief §4.3 and implemented test-first in `lib/attention.ts`.

---

## 4. Per-screen layout notes

**1 · Command Center** — a **Domain · Node** identifier strip (which sovereign graph + which host); top KPI strip (Active Workspaces, Open Tasks, Needs-owner, Blocked, Ready-for-review); a primary "Needs your attention" list (attention pill + Workspace + reason + target, severity-sorted, clickable); an "Active Workspaces" card grid; a "Latest Agent checkpoints" feed.

**2 · Workspaces** — *List:* table of Workspaces (name, app id, current stage, intent one-liner, attention pill, open Tasks) with an attention filter. *Detail:* header (name + attention + Mirror badge) → 11-step **stage rail** → Active Tasks → Proof summary → Blockers (state + missing + next action) → Linked artifacts.

**3 · Tasks** — *Board:* Tasks across Workspaces grouped by status, each card = objective + Workspace + Agent + due + proof + attention pill. *Detail:* objective → **Context Pack** (Allowed vs Forbidden vs Non-claims) → assigned Agent + checkpoint → evidence-required checklist + proof status → **review-loop stepper** → "Mark ready for review" (local-only).

**4 · Proof Ledger** — list of Proofs, each expandable: claim → proof surface → evidence refs → commands → proof boundary + **non-claims callout** → review-loop state. Side "Event Log" feed; `SIMULATED` external effects visually distinct from real local proof.

**5 · Gate Queue** — list of Gates: gated action + risk/blast-radius + required approval/per-provider status + decision/status; **"Approve (local-only)"** + "Hold" + "Defer" buttons with the explicit `external effect SIMULATED` note; post-approve confirmation state.

**6 · Agents panel** — Agent list (Codex / Claude / Local runtime) with health/checkpoint + attached Task + latest status; selected-Agent detail (blocker/input request + status history); "Leave a note (local-only)" composer.

**7 · Settings** — data-source toggle (Fixture vs Live local Domain, with resolved path placeholder); active **Node** panel; proof-boundary panel; Mirrors panel (Linear/Slack/GitHub = reflects state, never source of truth; shown disconnected/simulated); "WEAVE 0.2 — draft, not final" note.

---

## 5. Per-screen states & primary owner question

The low-fi SVGs show each screen's **populated + blocked** state (blocked is the operative one for the demo). This table defines the remaining required states — **primary owner question, empty, loading, error** — for all 9 screens so the build (ATM-386) has them specified.

Two conventions keep these honest and local-only:
- **Loading is brief and synchronous-feeling** — the cockpit reads local JSON, so loading = a short skeleton (greyed rows/cards), never a spinner waiting on a network call.
- **Error never leaks** — a read/parse failure shows a safe message + a pointer to Settings; it never prints secrets, raw stack traces, or a real user home path (only the `<cockpit>/fixtures/…` placeholder).

| Screen | Primary owner question | Empty | Loading | Error | Blocked |
|---|---|---|---|---|---|
| **1 Command Center** | "What needs me right now, across everything?" | "All clear — nothing needs you" (None pill, KPI zeros) | KPI + attention-list skeleton rows | "Couldn't read the Domain — check the data source in Settings" banner; nav stays usable | blocked items pinned to top of the attention list (red pill); reflected in the Blocked KPI |
| **2 Workspace List** | "What are all my apps and which need me?" | "No Workspaces yet — bootstrap an app to begin" | table skeleton | per-row "Couldn't parse `app.json` for `<id>`"; other rows still render | Workspace shows Blocked pill; attention filter → Blocked |
| **3 Workspace Detail** | "Why is this app in its state and what's the safe next move?" | "No Tasks/Proof recorded for this Workspace yet" | stage-rail + panels skeleton | "Workspace `<id>` not found or unreadable" → link back to Workspace List | stage rail marks the blocked stage (dashed/⚠); Blockers panel shows `state` + `missing[]` + `next_action` |
| **4 Task Board** | "What bounded work is in flight and where is it stuck?" | "No open Tasks" | column-card skeletons | per-column "Couldn't read tasks for `<workspace>`" | blocked Tasks carry the Blocked pill in their status column |
| **5 Task Detail** | "What's the objective/Context Pack/proof, and may I act?" | "Proof status: missing" + empty evidence checklist | skeleton | "Task `<id>` not found" | Blocked pill + the Context Pack forbidden-action reason; the local action is disabled with that reason shown |
| **6 Proof Ledger** | "For any claim, what's the evidence and what does it NOT prove?" | "No Proofs recorded yet" | envelope-list + event-log skeleton | "Couldn't read proof tray / `events.jsonl`" | a gate-blocked claim still renders its **non-claims**; `SIMULATED` events stay visually separated from real proof |
| **7 Gate / Approval Queue** | "What needs my approval, at what risk, and what happens if I approve?" | "No Gates awaiting you — nothing to approve" | gate-card skeleton | "Couldn't read `deployment-gates.json`" | gate shown `blocked_until_validated` w/ per-provider `not_validated`; **Approve writes a local overlay + `SIMULATED` event — the external effect is never executed** |
| **8 Agents** | "Are my Agents alive, where are they, and what are they waiting on?" | "No Agents attached" | agent-list skeleton | "Couldn't read worker orchestration" | Agent in `awaiting input` state surfaces the open input-request; "Post note" is local-only |
| **9 Settings** | "Where is my data coming from (which Node), and what is / isn't proven?" | n/a — always shows source + Node + boundary | "Resolving Domain path…" | "Configured Domain path not found — falling back to fixture" + how to fix | n/a |
