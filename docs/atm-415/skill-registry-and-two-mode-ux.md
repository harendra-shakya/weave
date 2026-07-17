## 1. Platform Skills → WEAVE Stage Mapping

The platform skill surface = the Claude Code default skill surface (the installed skills in this session). WEAVE currently has 11 skills. The Claude Code ecosystem has ~50+ relevant ones. The gap is almost entirely **brand/design/UX, frontend quality, and growth**.

Rather than copying skill files into WEAVE, the right fit is a **skill-registry manifest** in WEAVE that maps lifecycle stages to external skills — WEAVE references them, the agent invokes them.

```
packages/weave-tool/skill-registry.json
```

Proposed mapping:

| Lifecycle Stage | Current WEAVE skill | Add from platform skill surface |
|---|---|---|
| **Pre-intent** (new) | — | `brand-ideation`, `grill-me` |
| **Intent** | `weave-lifecycle` | `grill-me`, `to-prd` (early draft) |
| **Research** | `primitive-market-research` | `grill-with-docs`, `analytics-strategy` |
| **Selection** | — | `information-architecture`, `design-an-interface` |
| **Plan** | `implementation-planning` | `to-prd` (full spec), `prototype`, `design-system` |
| **Engineering** | `engineering-execution`, `compound-engineering` | `frontend-component-build`, `tdd`, `performance-optimization`, `improve-codebase-architecture`, `setup-pre-commit` |
| **QA** | `qa-verification` | `qa`, `accessibility-audit`, `security-review`, `impeccable` |
| **KPI Setup** | — | `analytics-strategy`, `cro-optimization` |
| **Marketing** | — | `content-strategy`, `landing-page-copy`, `email-sequences`, `brand-voice` |
| **Iteration** | — | `cro-optimization`, `analytics-strategy` |
| **Analysis** | `evidence-packet` | `handoff` |

The manufacturing gap George would spot: WEAVE has good _process_ skills (lifecycle, evidence, QA) but zero _craft_ skills (brand, design, copy, growth). The apps it manages can end up structurally correct but soulless. The platform skills fill that hole without us rewriting anything.

---

## 2. Two-Mode UX Design

### Mode A — Loop (autonomous, current behavior)

User gives intent. WEAVE runs the lifecycle runner. Stages advance without prompting. Good for experienced users or repeat cycles (e.g. iteration runs).

```
User: "build a sticker storefront"
WEAVE → intent → research → selection → plan → engineering → qa → kpi → iteration → analysis
                                               (owner gates flagged and parked)
```

### Mode B — Guided (prompted, new)

**The core idea:** at the start of each phase, WEAVE runs `/grill-me` with phase-specific questions before doing any work. The user gets depth-extracted at every gate. A shallow "I want to build a store" becomes a rich, structured brief before a single file is written.

**The shallow-prompt rescue flow:**

```
User: "I want to build a store" (8 words)
      ↓
WEAVE detects guided mode
      ↓
[PRE-INTENT] /brand-ideation → full brand vision extraction:
  "What does your brand stand for?"
  "Who is your exact customer — describe one person?"
  "What should someone feel when they land on your site?"
  "What are 3 brands you admire visually? What specifically?"
  "What would it mean if someone called your product beautiful?"
      ↓
[INTENT] /grill-me (intent questions):
  "What problem does this solve that nothing else does?"
  "Who has this problem right now and can't solve it?"
  "What does success look like at 90 days?"
  "What is explicitly NOT in scope?"
      ↓
Transforms answers → rich intent.json
      ↓
[RESEARCH] /grill-me (market questions):
  "Who are your three closest competitors? Where do they fall short?"
  "Why would someone NOT buy from you?"
  "What's the price point users already pay for the closest substitute?"
      ↓
[SELECTION] /grill-me (UX direction) + /design-an-interface (visual direction):
  "What's the one thing the homepage must communicate in 3 seconds?"
  "Mobile-first or desktop-first and why?"
  "What interaction would delight your customer most?"
      ↓
[PLAN] /prototype (lo-fi sketch) → owner reviews → /to-prd (full spec)
      ↓
[ENGINEERING] /frontend-component-build + /tdd + /accessibility-audit
      ↓
[QA] /qa + /impeccable + /security-review
      ↓
[KPI SETUP] /analytics-strategy → baseline run
      ↓
[MARKETING] /landing-page-copy + /email-sequences → campaign ready
```

**Implementation approach (minimal):**

1. Add `"mode": "loop" | "guided"` to `lifecycle-state.json` template.
2. Extend `lifecycle-runner.mjs` — in guided mode, prepend each stage prompt with the relevant grill invocation and the phase-specific question set.
3. Create `packages/weave-tool/skills/weave-guided-intake/SKILL.md` — the pre-intent brand extraction phase. Calls `/brand-ideation` then `/grill-me` with intent questions. Outputs a structured `intake.json` that populates `intent.json` automatically.
4. Create `packages/weave-tool/skill-registry.json` — the stage→skills manifest, so any future lifecycle runner knows which skills to invoke per stage.

**The user experience goal stated plainly:** a person who types "I want to build something for dog owners" should, by the end of guided mode, have a production-grade app with real design tokens, accessible components, copy that converts, and a KPI baseline — without knowing what any of those words mean at the start.

---

## What I'd suggest putting to George

Three things, in priority order:

1. **The eval gap** — "QA passed" currently means self-attestation for 9/11 stages and can't check the app code anyway. Fix `--app-path` before claiming lifecycle verification is meaningful.
2. **Guided mode** — the single biggest UX lever. Loop mode serves engineers. Guided mode serves George's actual audience: non-technical owners who want production-grade apps. The `/brand-ideation` + `/grill-me` combo at intake is the headline feature.
3. **Skill surface** — reference the platform skills in a `skill-registry.json` manifest. No new code, just wires WEAVE's lifecycle stages to the craft skills that already exist. Cost: one JSON file and stage-procedure updates.
