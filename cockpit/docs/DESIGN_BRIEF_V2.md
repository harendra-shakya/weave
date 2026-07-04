# WEAVE Owner Cockpit — v2 Design Brief (for Claude Design)

- **Status:** Active brief for the v2 visual redesign
- **Date:** 2026-07-02
- **Owner:** Harendra (sprint ATM-383; feedback from George)
- **Scope decision:** Fresh design. Claude Design is free to reinvent layout, navigation, and aesthetic. The v1 build is input, not a constraint. Non-negotiables are in §6 and §10 only.

---

## 1. Why we are redesigning

George reviewed the v1 cockpit and said:

> "It wasn't polished enough. It was done in such a way so that it could be functional, but it wasn't a product that inspired you to use. It didn't have the polish that indicates attention to detail."

v1 passed every structural test — canonical model, trust boundaries, full owner journey, 36 green tests — and still failed the only test that makes someone open an app twice: it didn't feel good. It was systematically correct and emotionally flat.

The v2 goal, in one sentence: **design a cockpit the owner *wants* to open — an instrument that feels precise, alive, and trustworthy, where polish itself communicates that the system can be trusted.**

This matters more here than in most dashboards: the cockpit's entire job is to make a human trust (or refuse to trust) claims made by autonomous agents. A UI that visibly sweats the details makes its proof claims believable. A sloppy UI undermines them.

---

## 2. What the product is

WEAVE is a local runtime that keeps state for agent-driven software work. The owner talks to coding agents in chat; WEAVE keeps the canonical record of what those agents are doing. The **owner cockpit** is the owner's second channel: a local web UI where one person supervising several agents can see state at a glance, inspect evidence, and make the decisions only a human may make.

Facts that shape the design:

- **Local, single-user, no accounts.** It runs on the owner's machine via `next dev`, reads a local state directory, and makes zero network requests. There is no login, no marketing page, no multi-tenant chrome.
- **Used many times a day in short bursts.** The owner pops in, answers "what needs me?", drills into one thing, decides, and leaves. Session length is measured in seconds-to-minutes. Speed of comprehension is the product.
- **It is a trust instrument.** Agents *claim* things. WEAVE records *proof*. External tools (Linear, Slack, GitHub) appear only as **Mirrors** — reflections, never the source of truth. Some effects are **SIMULATED** — logged locally, never executed for real. The UI must never let these categories blur.

The core loop the whole product exists for:

**Glance → Trust → Decide**

1. **Glance** — "What needs me right now?" answered in under 5 seconds from the first screen.
2. **Trust** — every claim shows its evidence; proven and merely-claimed never look alike.
3. **Decide** — approve/hold gates, acknowledge blockers, leave notes — with total clarity that these actions are local-only.

---

## 3. Emotional target

This is the section George's feedback is about. Hit this and everything else follows.

**Feel words:** precise · calm · alive · quietly confident · crafted.
**Anti-feel:** generic admin template, component-library default, cluttered, gimmicky, sci-fi cosplay, "hackathon dashboard".

**Reference points** (for feel and craft level, not for copying):

- **Linear** — restraint, typographic confidence, speed as a design value, keyboard-first calm.
- **Stripe / Vercel dashboards** — dense data that still feels premium; hierarchy you can squint at.
- **A flight instrument or a good watch face** — high information density that reads as calm, not busy, because every element earns its place.

**"Polish that indicates attention to detail," made operational.** Polish is not decoration; it is the accumulation of small deliberate choices:

- Typography with a point of view — a real type system with contrast between display, body, and mono, not one size repeated everywhere.
- A spatial rhythm you can feel — consistent grid, deliberate breathing room, alignment that never drifts by a pixel.
- Depth and light — a considered elevation story (what floats, what recedes), not identical bordered boxes.
- Motion — transitions that make state changes legible (a gate flipping to approved should *feel* like something happened), 120–250ms, eased, never bouncy.
- Designed edge states — empty, loading, error, and blocked states written and drawn with the same care as the happy path.
- Micro-decisions everywhere — hover/focus/active/disabled on every interactive element; numbers set in tabular figures; icons optically aligned; copy written by a human.
- **At least one signature moment** — one interaction or visual element a user would show someone else. Candidates: the attention triage on the Command Center, the proof ledger, the gate-approval interaction, the 11-stage lifecycle rail.

---

## 4. Canonical vocabulary (mandatory)

All screens, labels, and copy use the WEAVE 0.2 model. These are the only product nouns:

| Term | Meaning (one line) |
|---|---|
| **Domain** | The whole body of work WEAVE tracks for this owner |
| **Node** | A machine/host participating in the Domain (v1 has a single local node) |
| **Workspace** | One app/project being built (has lifecycle stages, tasks, gates, proofs) |
| **Agent** | An AI coding agent doing the work (e.g. Codex, Claude, Local runtime) |
| **Task** | A unit of work an Agent executes inside a Workspace |
| **Event** | An append-only log entry recording something that happened |
| **Proof** | Recorded evidence backing a claim (real) — or a logged, never-executed effect (SIMULATED) |
| **Gate** | A checkpoint requiring an explicit owner decision before work proceeds |
| **Mirror** | A read-only reflection of an external tool (Linear/Slack/GitHub) — never source of truth |
| **Context Pack** | The scope contract given to an Agent for a Task: allowed / forbidden / non-claims |

Older product-flavor names for these concepts exist in company history. Do **not** use them anywhere in the design or mock copy — canonical terms only.

---

## 5. The owner journey and screen inventory

The one journey every design must demonstrate end to end:

**Command Center → Workspace detail → Task detail → Proof / Gate → owner decision (approve / hold) → Command Center reflects the change.**

v1 shipped 7 surfaces (9 screens). A fresh design may merge, split, or re-shape them — layered panels, split views, command palette, whatever serves the loop — as long as each screen's *primary owner question* below still gets a first-class answer, and any merge/defer is documented with rationale.

| Surface | Primary owner question | Design emphasis |
|---|---|---|
| **Command Center** (home) | "What needs me right now?" | The hero. Triage in <5s: attention items ranked by priority, KPIs, agent checkpoints. This screen carries the product's first impression. |
| **Workspace list** | "How is each project doing?" | Scannable: stage, open tasks, attention state per Workspace. |
| **Workspace detail** | "Where exactly is this project, and what's in the way?" | Lifecycle rail (11 stages with per-stage proof state), active tasks, blockers, proof summary. |
| **Task board** | "What is being worked on, by which Agent?" | 4 columns: Open / In progress / Ready for review / Done for scope. |
| **Task detail** | "What is this Agent allowed to do, and what did it produce?" | Context Pack (allowed/forbidden/non-claims), agent assignment, proof links, review loop. |
| **Proof / Evidence ledger** | "What is proven vs. merely claimed?" | The trust surface. Proofs with claim + evidence + non-claims; event log with real/SIMULATED separation. |
| **Gate / Approval queue** | "What decisions am I being asked to make?" | The action surface. Gate reason, blast radius, evidence, Approve/Hold — with the local-only·simulated boundary unmistakable. |
| **Agents panel** | "Are my agents healthy, and do any need input?" | Per-agent health, pending input requests, history, local note composer. |
| **Settings / Data source** | "What is this cockpit reading, and what is it allowed to do?" | The honesty screen: data source, Node info, Mirror list, proof boundary statement. |

---

## 6. Non-negotiable semantics

Redesign the *look* of all of these freely — but these distinctions must remain unmistakable at a glance, and must survive a grayscale/squint test (never color alone; always pair with label, icon, or weight):

1. **Six attention states, priority-ordered.** Blocked → Approval required → Needs owner → Ready for review → Stale/no proof → None. This ranking drives the Command Center triage.
2. **Real proof vs. SIMULATED.** Recorded local evidence vs. a logged effect that never actually ran. These two must never be confusable — this is the product's central honesty guarantee.
3. **Mirror ≠ source of truth.** Anything reflecting an external tool is visibly labeled a Mirror.
4. **Local-only actions.** Every mutating control (Approve, Hold, Acknowledge, Post note) carries a clear local-only / simulated boundary cue. The owner must never wonder whether clicking Approve did something in the real world. (It didn't — and the UI must say so gracefully, not with a wall of warning text.)
5. **Canonical WEAVE state vs. everything else.** What WEAVE knows first-hand is visually primary; mirrors and simulations are visibly secondary.
6. **The full owner journey (§5) is demonstrable** in the final design.

---

## 7. What v1 got right — keep these ideas

- **Single-source design tokens** (all color/space/type flowed from one CSS-variable file). Keep the discipline; replace the values.
- **Semantic color reserved for status.** One accent for affordance; status colors mean exactly one thing each. Extend, don't dilute.
- **State-driven styling** via `data-*` attributes (`data-attn`, `data-proof`, `data-state`) — logic drives presentation.
- **Honest edge states** — no fake placeholder data, errors that don't leak paths.
- **Information density in the right places** — owners scan tables; don't inflate them into cards for aesthetics.

## 8. Where v1 fell short — the polish gap to close

Concrete gaps found in the v1 audit (this is what "not polished" cashed out to):

- **No typographic identity.** System font stack only; body, labels, and cells nearly all 13px. Headings and KPI numbers had no drama; nothing distinguished this product from a browser default.
- **No elevation story.** Every container was the same 1px-bordered panel on the same background. Nothing floated, nothing receded — the eye had no guide.
- **Zero motion.** No transitions anywhere; hovers snapped, gate approval (the emotional peak of the product!) changed some text instantly and moved on.
- **Unloved edge states.** Empty table cells rendered as a bare "—"; empty screens got one muted sentence, no illustration or guidance.
- **Missing interaction states.** No visible keyboard focus; buttons had border-only hovers; a plain textarea styled with a table-row class.
- **Off-grid micro-spacing.** Ad hoc pixel values sprinkled as inline styles, weakening the rhythm the token file promised.
- **No signature moment.** Nothing to remember, nothing to show a colleague.

---

## 9. What we're asking Claude Design to produce

**Phase A — Direction exploration (pick-one round):**

Produce **2–3 radically different design directions**. Not variations on one theme — different bets. At least one direction must *not* be a dark theme (v1 was dark mission-control; we want a genuine alternative to react to, e.g. a precise paper-light instrument, or a high-contrast editorial take). For each direction:

1. A name and a one-paragraph mood ("what this direction believes").
2. Type system: display + text + mono pairing, with a type scale.
3. Full color system, including a mapping for all six attention states and the real/SIMULATED proof pair (§6).
4. Two hi-fi screens: **Command Center** (the hero) and **Gate / Approval queue** (the action surface, including the local-only boundary treatment).
5. The signature moment, described or mocked.

**Phase B — after the owner picks a direction:**

1. Hi-fi designs for the full screen set (§5), including empty / loading / error / blocked states for each screen.
2. Design tokens as CSS variables (drop-in successor to a single `tokens.css`).
3. Component specs for the shared system: attention pill, stage rail, proof tag, mirror badge, context pack, panel/card, gate decision, review-loop stepper, blast-radius tag, empty state, error state, nav/shell, source icons.
4. Motion spec: durations, easings, and which state changes animate (gate approval, attention-count changes, row hover/press, page transitions).
5. Interaction-state matrix: hover / active / focus-visible / disabled for every interactive element.
6. Responsive behavior: desktop ≥1280 is primary; degrade gracefully to ~1024. No mobile requirement.

---

## 10. Hard constraints

- **Fully self-contained local app** (Next.js App Router). Fonts must be bundled/self-hosted — no font or asset CDN, zero runtime network requests. Icons are inline SVG using `currentColor`.
- **Accessibility:** WCAG AA contrast throughout; visible `:focus-visible` on all interactive elements; status never conveyed by color alone.
- **Copy hygiene:** mock copy must not contain loopback hostnames, private IPs or paths, or retired legacy product/surface names — a CI scanner fails the build on these. Use canonical vocabulary (§4) and phrases like "the dev server's local URL".
- **Motion via CSS** (transitions/transforms). No heavyweight animation dependency without explicit approval.
- **Engine field names stay internal.** The data layer uses names like `app_id`; UI copy says "Workspace". Mono-set raw IDs are fine as secondary metadata.
- **No dark-pattern urgency.** Attention states inform; they don't nag. "None / all clear" should feel like a reward, not an absence.

---

## 11. Definition of "polished" — acceptance checklist

The redesign is done when all of these pass:

1. **5-second test:** a first-time viewer of the Command Center can say what needs the owner's attention within 5 seconds.
2. **Squint test:** with the screen blurred, hierarchy still reads — one clear focal point per screen.
3. **Grayscale test:** attention states and real-vs-SIMULATED remain distinguishable with color removed.
4. **No orphan styles:** every text size, weight, color, and spacing value traces to the token scale; nothing ad hoc.
5. **Full interaction matrix:** every interactive element has designed hover, active, focus-visible, and disabled states, with transitions.
6. **Edge states designed:** every screen's empty / loading / error / blocked state has intentional layout and human-written copy ("All clear — nothing needs you", not "—").
7. **A signature moment exists** and is something a user would show a colleague.
8. **Nothing looks default:** no unstyled controls, no browser default focus ring as the only affordance, no raw dashes as content.
9. **Type has a point of view:** KPIs and headings are set in a deliberate display treatment; numbers use tabular figures.
10. **Motion is present and calm:** state changes are legible through animation; nothing animates without a reason.
11. **The George test:** would George open this and feel someone sweated the details — and want to come back?

---

## 12. Source materials in this repo

Reference, not constraint — the fresh design may depart from all visual decisions in these:

- `cockpit/docs/PRODUCT_INGREDIENTS_BRIEF.md` — full product model, actors, user stories, state machines (ATM-384).
- `cockpit/docs/WIREFRAMES.md` — v1 screen map, per-screen owner questions and edge-state specs (ATM-385).
- `cockpit/docs/DESIGN_SYSTEM.md` — v1 tokens and component specs (superseded by this brief's Phase B output).
- `cockpit/fixtures/weave-home/` — realistic sample data (3 workspaces, agents, gates, proofs, events) to design against.
- The running v1 app: `cockpit/` (`npm run dev`) — useful to feel the current information architecture and its flatness.

Linear: ATM-383 (umbrella), ATM-384 (product brief), ATM-385 (v1 design), ATM-386 (build), ATM-387 (QA).
