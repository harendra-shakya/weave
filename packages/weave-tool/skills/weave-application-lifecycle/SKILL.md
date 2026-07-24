---
name: weave-application-lifecycle
description: Drive a small local commerce app from first idea to a sealed, auditable proof chain — stage by stage, with hard gates, deterministic synthetic measurement, and explicit stops when engineering or the owner is required.
---

# WEAVE Application Lifecycle

## Use when

- starting a new local storefront-family app;
- **resuming** one that stopped mid-lifecycle (this is the common case — the workflow is
  resumable from `lifecycle/lifecycle-state.json` and needs no memory of the previous session);
- checking whether an app may advance to the next stage;
- sealing a finished app into an auditable artifact.

**Read [`ENVELOPE.md`](ENVELOPE.md) before relying on any stage's verdict.** It records where this
skill is *proven* (local Next.js storefronts, three sealed examples) versus where it is merely
*designed to work*, and the four gaps you will meet inside the proven boundary.

**To build the app itself, read [`starter-kit/`](starter-kit/README.md).** This document gates
quality; the starter kit is how you reach it — the build method, the three design systems, the
component inventory, and the QA-readiness checklist, all extracted from the sealed apps
(<https://github.com/harendra-shakya/weave-v5-apps>).

**Before you write intent, walk [`COMMERCE-CHECKLIST.md`](COMMERCE-CHECKLIST.md).** It is the
coverage layer — every commerce concern (returns, tax, consent, accessibility law, fraud, empty
states…) tagged for this envelope, so you decide *build / non-claim / owner-gate / engineer /
non-goal* for each rather than forgetting one. A recorded "non-goal" is fine; silence is how an
`intent` promises a refund flow that never ships (LOG Entry 001).

**For deep craft at a stage, see [`craft/`](craft/README.md).** Bundled specialist skills (brand
ideation & identity, design system, component build, spec writing, i18n, performance, security) mapped
to the stage each serves. Reference method, not gates — they raise the quality of what you build, not
the envelope of what it proves.

## The record is the deliverable

The apps are not the point. **The proof chain is.** A stranger should be able to open
`apps/<app>/proof/` and check every claim without talking to anyone who built it.

That only holds if the record cannot lie. So one file governs everything:

```
<app-root>/lifecycle/lifecycle-state.json
```

It is validated by [`schema/lifecycle-state.schema.json`](schema/lifecycle-state.schema.json) and
enforced by [`tools/validate-lifecycle.mjs`](tools/validate-lifecycle.mjs), which **fails closed**:
a stage marked `verified` whose proof is missing, or a record whose synthetic-only nonclaim has
been softened, is an error and exit 1 — never a warning to read past.

Start from [`templates/lifecycle-state.template.json`](templates/lifecycle-state.template.json).

## Stages

```
intent → research → selection → plan → engineering → qa
       → [deployment]* → kpi-setup → [marketing]* → iteration → analysis → seal
```

`*` owner-gated. The loop records the gate and continues; it does not proceed through it.

**9 of 11 stages are proven. `deployment` and `marketing` have never completed in any run.**
Do not describe this as a proven 11-stage lifecycle.

---

## Stage reference

Each stage: what goes in, what comes out, what blocks advancement, and the failure mode that has
actually occurred — with its citation. `LOG` = `weave/docs/weave-application-lifecycle-improvement-log.md`.

### 1. intent

- **In:** the owner's description of the app and who it is for; explicit constraints.
- **Out:** `proof/intent-eval-result.json` — goal, target user, success criteria, non-goals.
- **Hard gate:** the primary user journey is named as a concrete sequence, not an aspiration.
- **Coverage:** walk [`COMMERCE-CHECKLIST.md`](COMMERCE-CHECKLIST.md) and record a decision for every
  domain (build / non-claim / owner-gate / engineer / non-goal). Any behaviour you promise here must
  become a real acceptance criterion at `plan` — the thing that did not happen in `LOG` Entry 001.
- **Design direction:** name a *distinct* visual direction here, not at build time — the differentiation
  the pre-wipe "four apps, one face" lacked (`LOG` Entry 001 #9). [`craft/brand-ideation`](craft/README.md)
  converges half-formed ideas to one; the three `starter-kit/` systems show the bar and the range — they
  are reference for *what distinct looks like*, not a palette to copy into every app.
- **Failure mode:** an intent that promises a behaviour the app never ships. `LOG` Entry 001
  records an app whose `intent.md` promised "cancellation and refund" and which shipped no
  reachable refund UI, through a verified `qa`. **Write the journey as steps you can later walk.**
- **Escalation:** intent that requires real payments, real user data, or a live deployment →
  `OWNER_GATE` before any work starts.

### 2. research

- **In:** verified intent.
- **Out:** `proof/research-eval-result.json` — sourced facts, assumptions and opinions kept apart.
- **Hard gate:** disconfirming evidence is present. Research with no downside is not research.
- **Failure mode:** self-attested. There is no gate that executes here; a confident wrong answer
  scores as well as a right one (`ENVELOPE.md` gap 1).

### 3. selection

- **In:** research.
- **Out:** `proof/selection-eval-result.json` — real alternatives, the choice, the rationale.
- **Hard gate:** at least one rejected alternative with the reason it was rejected.

### 4. plan

- **In:** selection.
- **Out:** `proof/plan-eval-result.json` — bounded task list, acceptance criteria, `proof_date`.
- **Hard gates:**
  - every acceptance criterion is checkable by someone who did not write it;
  - **the plan predates the engineering it describes.** A plan written afterwards is
    documentation, not a gate. `LOG` Entry 001 records a retrospective plan scoring 93.75%.
  - if the app has forbidden surfaces, declare `prohibition_contracts` here (see below).
  - carry the `COMMERCE-CHECKLIST.md` decisions through: every `[NONCLAIM]` becomes a `non_claims`
    entry, every `[OWNER]`/`[ENG]` becomes a recorded stop. The checklist decides *what*; the plan
    turns each decision into an acceptance criterion, a non-claim, or a stop.
  - if the intent promises need structuring into checkable ACs, [`craft/pm-spec-writing`](craft/README.md)
    is the method — every promised behaviour becomes an AC or a recorded stop, nothing is dropped.
- **Failure mode:** framework-version assumptions. `LOG` Entry 004 Finding C — a plan specified
  Next.js 14 against a UI source using the Next.js 15 async-params API. **Check the actual API
  pattern in the source, do not assume a major version.**

### 5. engineering

> **How to actually build it — [`starter-kit/`](starter-kit/README.md).** This stage gates the app;
> it does not tell you how to reach 7/10. The starter kit does: the port-a-prepared-UI-source method,
> three real design systems, the recurring component inventory, and the QA-readiness checklist. Every
> sealed app was built by porting a prepared source — start there, not from a blank page. For the visual
> system and component method behind it, [`craft/`](craft/README.md) has `design-system`,
> `design-standards`, `frontend-component-build`, and `brand-identity`.

- **In:** plan.
- **Out:** working app; `proof/engineering-eval-result.json` with per-AC status and an
  intervention count; `INTERVENTION_LEDGER.md` updated.
- **Hard gates:** build exits 0 · contracts validate · golden path verified on a running dev
  server · every hand-edit recorded in the ledger.
- **Failure modes:**
  - **A build proves compilation, not function.** Next.js compiles an invisible button and an
    unreachable route without complaint (`LOG` Entry 001 §2).
  - **Gate portability.** On Windows, gates written in bash or `python3` do not run. `LOG`
    Entries 001/003/004 and ATM-417 — four recurrences. If a gate cannot execute, record the
    override **in the eval result, with the exact command and exit code**, and disclose it. Do
    not mark it passed.
- **Score anchors (0–10 — so 7 is a standard, not a vibe):**
  - **0–3 — ships a defect that defeats the product.** `video-storefront` sold a video and
    contained no `<video>`; a buy button rendered 1.04:1 (invisible) on every card (`LOG` Entry 001).
    It compiled and proved nothing real.
  - **4–6 — runs, but with craft gaps a user hits.** 4 of 5 rarity tiers with no CSS rule so 9 of 10
    cards render identically; one body-text token deferred at ~2.9:1 in 8 places (Marginalia). Reachable,
    visibly unfinished.
  - **7–8 — clears the QA-readiness checklist:** contrast passes AA, every route's empty/error state is
    built, the golden path walks live. Marginalia (7.25) and OneReel (7.5) sit here.
  - **9–10 — a distinct, restrained design system carrying a proof no one asked for.** Vitrine's Keepsake
    (8.5): muted text tuned to AA (4.92:1), a chainless prohibition contract, nothing on screen decorative.
  - **Do not score the objective dimensions as prose.** Contrast → [`tools/check-contrast.mjs`](tools/check-contrast.mjs);
    heading order, reachability, named controls → the accessibility-tree pass. Score those from tool output,
    not opinion — that is the Entry-001 lesson (a confident rubric answer scored 91.67% over a 1.04:1 button).
- **Escalation:** an unsupported adapter, schema, or stack → `ENGINEERING_REQUIRED`.

### 6. qa — **the gate that carries the design bar**

- **In:** a running app.
- **Out:** `proof/qa-eval-result.json` with the critique scores, the finding list with fix status,
  and the non-claims.
- **Coverage cross-check:** every `[BUILD]` decision from [`COMMERCE-CHECKLIST.md`](COMMERCE-CHECKLIST.md)
  has a *reachable* surface on the running app — a promised flow that compiles but cannot be walked is
  the Entry-001 failure and fails qa.
- **Hard gate — not a suggestion:**
  > **`impeccable` critique ≥ 7/10 and zero P0 findings.**
  > Below either threshold the app returns to engineering. It does not advance.
- **Score anchors (0–10 — what the number has to mean before you write it down):**
  - **below 7 — returns to engineering.** A **3** looks like the pre-fix 1.04:1 buy button, or a refund UI
    the intent promised that no route can reach (`LOG` Entry 001). A **5–6** is a running app still carrying
    the five accessibility-tree defects Assessment B caught in Marginalia — heading skips, doubled live
    regions, an unnamed icon-only control (`LOG` Entry 005 A).
  - **7 — the floor:** AA contrast, every route's empty/error state built, the golden path walks, zero P0.
    OneReel (7.5) and Marginalia (7.25) cleared it with P1s fixed *inside* qa, not shipped.
  - **8–10 — dual-agent clean with a differentiator.** Vitrine (8.5): the Keepsake system, a chainless
    prohibition proof, muted text measured at 4.92:1 rather than eyeballed.
- **Run it dual-agent** where possible: Assessment A (design/UX, Nielsen heuristics) and
  Assessment B (CLI detector + browser accessibility tree) in parallel. `LOG` Entry 005 Finding A —
  Assessment B's accessibility-tree pass surfaced five real issues that no other gate caught, and
  which Assessment A alone did not find. If a sub-agent is unavailable, run inline and **emit the
  degraded banner** (`LOG` Entry 004 Finding A).
- **Failure mode — the one that keeps happening:** **contrast.** Five deterministic contrast
  defects across the sprint, every one caught here and nowhere else (`LOG` Entries 001, 004 B,
  005 D, 006 C). Measure it, do not eyeball it: run [`tools/check-contrast.mjs`](tools/check-contrast.mjs)
  over your token sheet with a pairs manifest (see [`starter-kit/`](starter-kit/README.md) §QA-readiness) —
  it fails closed below AA and handles hex / RGB-channel / oklch in pure Node.

### 7. deployment — **owner-gated**

Stop. Record `owner_gated_skipped` with the reason, or `owner_gate_blocked` if the owner is
actively being asked. Never proceed on assumed access. Has never completed in any run.

### 8. kpi-setup — **everything downstream depends on this**

- **In:** a qa-verified app.
- **Out:** a frozen baseline commit + a baseline cohort run.
- **Hard gates, in this order — the order is the gate:**
  1. **Freeze first.** Record the commit in `contracts/freeze-digests.json` *before* running the
     cohort. That file's own governance says a baseline run under a null `frozen_at_commit` **is
     invalid** — and `nft-storefront` shipped exactly that (ATM-420 defect D1). The validator now
     catches it.
  2. **Then run the cohort**, and link the run back: set `baseline_run_ref`. All three sealed
     apps left it null (D2).
  3. **Run it twice.** Same seed, same count. Two runs that reproduce are the determinism proof.
- **Escalation:** changing a seed, a KPI formula, or a guardrail after a baseline exists →
  `OWNER_GATE`. Always. Unfreezing your own baseline to improve a number destroys the evidence
  the lifecycle exists to produce.

### 9. marketing — **owner-gated**

Stop, as `deployment`. Has never completed in any run.

### 10. iteration

- **In:** a frozen baseline.
- **Out:** one bounded adaptation, an identical-seed retest, and a verdict.
- **Hard gates:** exactly one bounded change · the retest uses the **same seed** · no guardrail
  breach · the verdict follows `contracts/kpi/formulas.json` `verdict_rules`.
- **The verdict rules are not advisory.** GO requires `retest conversion_rate > baseline`. A
  delta of zero is ITERATE, not GO. `sticker-storefront` recorded GO on a delta of exactly 0.0
  (D7); the validator now rejects that.
- **Failure mode — read this before designing an experiment:** see *Deterministic measurement*
  below. If your adaptation is a UI change, **the cohort will return zero and that result is
  uninformative, not negative.**

### 11. analysis

- **In:** a completed iteration.
- **Out:** `proof/analysis-result.json` — wins, failures and unknowns kept separate; the next
  decision with its evidence.
- **Hard gate:** every unknown is labelled as unknown. An analysis that estimates a number
  nothing measured is worse than one that says `[UNKNOWN]`.

### 12. seal

- **Out:** `proof/seal-manifest.json` — per-file sha256 across the app.
- **Hard gate:** `node tools/validate-lifecycle.mjs --root <repo> --app <app-id>` exits 0.
- After sealing, `lifecycle-state.json` is **inside** the manifest. Editing it invalidates the
  seal. Fix the record before you seal, not after.

---

## Deterministic measurement — cohort, seed, digest

Every stage from `kpi-setup` onward rests on one property: **the same seed produces the same event
stream, every time.** If a retest cannot reproduce the baseline's own numbers on the same seed,
nothing it says about an adaptation means anything.

**The cohort runner.** `weave-v5-apps/tools/cohort-runner.mjs`:

```bash
node tools/cohort-runner.mjs --app <app-id> --seed 42 --count 200
```

It walks a `mulberry32` PRNG against the app spec's funnel probability table and writes
`proof/cohort-<timestamp>/cohort-result.json`.

**The seed.** `contracts/cohort/seeds.json` freezes the primary seed at **42**, 200 users. The
runner warns if you pass anything else. **Baseline and retest must use the same seed** — that is
what makes the delta attributable to the adaptation rather than to sample variance. Changing a
frozen seed is `OWNER_GATE`.

**The digest — and its current gap.** A digest means a checksum over the generated event stream:
one for the frozen baseline, one after the retest. Identical seed with identical digest proves the
retest reran the same stream; a differing digest on an identical seed means non-determinism leaked
in and the comparison is void until it is fixed.

> **`cohort-runner.mjs` does not currently emit one.** `cohort-result.json` has no digest field
> (ATM-420 defect D8). Until it does, determinism is proved by **byte-comparing two run outputs
> with `generated_at` removed** — which is how it was verified for the sealed apps. Keep both runs
> on disk; one run proves nothing (D4). Emitting a digest from the runner is the smallest
> high-value fix left in this system.

**What the cohort can and cannot do — a hard constraint, not a caveat:**

> The synthetic cohort cannot be used to rank or validate UI adaptations. Its role is limited to
> (a) confirming no guardrail breach after an adaptation, and (b) providing a frozen KPI baseline
> for cross-app comparison. Ranking UI adaptations requires real user data.

Four consecutive cycles produced a delta of exactly zero from a UI change (`LOG` Entries 003, 004,
005, 006). The engine has no representation of copy, layout, price or contrast. **Do not design an
iteration experiment that asks the cohort a question it cannot answer** — and do not "fix" this by
adding elasticity parameters that make the model appear responsive (`ENVELOPE.md` gap 3).

---

## Prohibition contracts

Some apps must prove a surface is **absent**. `nft-storefront` had to prove no wallet, chain, mint,
token or RPC surface existed anywhere — in source, dependencies, or config.

That is architecturally different from a functional contract. A functional contract asks *does X
exist?*; a prohibition contract asks *does X exist anywhere, ever?* — and it can only be satisfied
by a scan.

**Pattern** (`weave-v5-apps/contracts/negative/nft-chainless.json`):

- enumerate the forbidden terms;
- enumerate `known_false_positives` — your own brand's negation copy will trip the scan;
- run the scan at **every** engineering gate, not once;
- record a negative proof bundle: code clean · dependencies clean · config clean · runtime clean.

**When the scanner flags your own copy** ("skip the wallet", "no gas", "not on any chain"), resolve
it through `known_false_positives`. Do **not** reword the brand — that silently erodes the proof.
Do **not** edit the contract — it is frozen, and that is `OWNER_GATE`. (`LOG` Entry 006 Finding B.)

This generalizes to medical advice, financial advice, PII, credentials, and real payments.

---

## Stop conditions

A stop is **recorded, not worked around.** An unrecorded stop is a false claim of completion.

| Stop | State to record | Means | Who unblocks it |
|---|---|---|---|
| `ENGINEERING_REQUIRED` | `engineering_required` | Work outside the lifecycle's competence — a code change, adapter, schema migration, or security fix that cannot be produced from evidence alone. | An engineer |
| `OWNER_GATE` | `owner_gate_blocked` | A decision or access only the owner holds. | The owner |

Both states are in the schema and **both are enforced**: a stop that names no `reason` or
`blocked_by` is a validation error. `tests/negative.test.mjs` covers both. This closes the oldest
open question in the improvement log — *"do `ENGINEERING_REQUIRED` and `OWNER_GATE` actually
fire?"* (Entry 001 §Open questions). They now fire against a fixture, and the fixture is in the
test suite.

**Record `ENGINEERING_REQUIRED` when:**

- an adapter, schema, stack, or invariant the lifecycle does not support is required;
- a hard gate fails as specified and the failure is a real defect, not a portability problem;
- a stage's evidence gap is buildable but not by this lifecycle.

**Record `OWNER_GATE` when:**

- `deployment` or `marketing` is reached — always;
- production access, credentials, elevated privilege, or spend/payment is required;
- a public provider marketplace, wallet/chain surface, or publication is involved;
- **a frozen contract, seed, or KPI formula would have to change** — freezing is what makes a
  retest meaningful;
- the material goal of the app changes;
- a downstream stage contradicts a sealed one and no overwrite record exists.

Do not downgrade a stop to a warning to keep the loop moving.

---

## Validation

```bash
# from this repo, against an app repo elsewhere — the cross-repo case is the point.
# fill in the real path to your apps repo (a clone of github.com/harendra-shakya/weave-v5-apps);
# it is a sibling of this repo, not nested inside it, so a relative path needs the right depth.
node tools/validate-lifecycle.mjs --root <path-to-weave-v5-apps> --app nft-storefront

# a bare state file, for fixtures
node tools/validate-lifecycle.mjs --state path/to/lifecycle-state.json

# the fail-closed proof (glob form — `node --test <dir>` is unreliable on Windows)
node --test tests/negative.test.mjs
```

The validator is pure Node — no shell, no Python, no platform assumption — and resolves every path
from `--root`. That is deliberate: the gate-portability wall (`ENVELOPE.md` gap 1) is exactly the
failure of tools that resolve paths from their own location.

**What it rejects:** a `verified` stage with no proof, or with proof absent from disk · a missing or
softened synthetic-only nonclaim · an unknown stage state · a missing stage · a stop with no reason ·
a missing `INTERVENTION_LEDGER.md` while stages are verified · a baseline run under a null
`frozen_at_commit` · a GO verdict on a non-positive delta.

**Expected result against the three sealed examples: not clean.** They report 2, 3 and 4 errors
respectively. That is the intended outcome — the defects are real (ATM-420 §2), the apps are sealed
so they were reported rather than repaired, and **a validator that passed all three would not be
failing closed.**

---

## Resuming

The workflow needs no memory of a previous session.

1. Read `<app-root>/lifecycle/lifecycle-state.json`. If it is absent, copy the template.
2. Run the validator. **If it reports errors, fix the record before doing any stage work** — every
   later stage rests on it.
3. Find the first stage whose state is not `verified` and not one of the gated states.
4. If that stage is `engineering_required` or `owner_gate_blocked`, stop and report what is
   blocked and who unblocks it. Do not continue past a stop.
5. If it is `deployment` or `marketing`, record the gate and continue to the next stage.
6. Otherwise do that stage's work, write its proof, set `state: verified` with the proof ref.
7. Return to step 2.

## Rules

- Infer the stage from the record. Do not ask the owner to classify it.
- Never advance a stage without proof on disk that someone else can open.
- Never edit a frozen contract, seed, or KPI formula — `OWNER_GATE`, every time.
- Record every hand-edit in `INTERVENTION_LEDGER.md` as you make it. ATM-422's honesty audit
  depends on these files, and one app has already sealed without one.
- Record non-claims whenever a stage proves less than it appears to.
- **Never convert a synthetic result into a claim about real demand.** The nonclaim is a required
  literal in the record, not a stylistic preference — the validator checks the exact sentence.
