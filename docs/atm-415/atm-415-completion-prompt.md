# ATM-415 Completion Prompt — Build the Three V5 Apps From Scratch Through the WEAVE Lifecycle

Hand this to a fresh Claude Code session opened in the **`P:\Development\Projects\weave-v5-apps`** repo. It **builds the three apps from scratch** as their locked brands (OneReel / Marginalia / Vitrine) — running the **full WEAVE lifecycle `intent → analysis` per app** — so the result is genuine, reproducible, and independently reviewable evidence for ATM-415: WEAVE operating the whole application lifecycle end to end, not a hand-swap dressed up as WEAVE work.

**This is a clean rebuild, not an unseal-and-patch.** The old sealed apps were built on placeholder personas (e.g. a fitness-course app, not OneReel) and scored 3.6/10 on design. They are being replaced. But the repo is **not wiped** — the domain-agnostic ATM-416 foundation (schemas, seeds, KPI formulas, state machine, negative contracts, `commerce-core` engine, tools, tests, procedures) is **preserved and conformed to**. Only the three `apps/<app>/` trees and their placeholder `contracts/specs/*.spec.json` are deleted and rebuilt. Git history preserves the old apps, so the audit trail stays intact. See "The foundation line" below before starting.

---

## INPUTS TO FILL BEFORE RUNNING (do not start until these are set)

- **Total-from-scratch state:** the `weave-v5-apps` workspace has been wiped (empty except `.git/` + `CLAUDE.md`). There is **no preserved foundation** — ATM-416's contracts, the `packages/commerce-core` engine, and the `tools/` are all gone and get **rebuilt first** (see the sequence in Execution discipline). The lifecycle *machinery* still lives in the OTHER repo (`weave`): the skill, `evals/lifecycle/*.yaml`, `scripts/weave_eval.py`, and `runner/lifecycle-runner.mjs` — those are intact and unchanged.
- **UI source (provided, faithful port — real Next.js):** copy from the `weave` repo, one per app:
  - video-storefront (**OneReel**): `P:/Development/Projects/weave/docs/atm-415/ui/onereel`
  - sticker-storefront (**Marginalia**): `P:/Development/Projects/weave/docs/atm-415/ui/marginalia`
  - nft-storefront (**Vitrine**): `P:/Development/Projects/weave/docs/atm-415/ui/vitrine`
  Each is a full `app/ components/ lib/ styles/ tailwind.config.ts` tree. **Port it exactly — no redesign, no "improvements," no omissions.** The rendered app must look identical to the provided UI; the only changes allowed are wiring the UI to `commerce-core`/data. Any visual deviation is a defect.
- **Brand/research source (per app):** `P:/Development/Projects/weave/docs/atm-415/atm-417-brand.md` (OneReel), `atm-418-brand.md` (Marginalia), `atm-419-brand.md` (Vitrine) — these are the authoritative source for the app's persona/problem in `intent` and `research`. The session reads its app's brand doc to know what to research and build.
- **Owner-gate authority:** who approves the initial frozen baseline per app. Default: George.
- **App ↔ brand mapping (fixed):** video-storefront = **OneReel**, sticker-storefront = **Marginalia**, nft-storefront = **Vitrine**.

---

## Context

- Repo: `P:\Development\Projects\weave-v5-apps` — the WEAVE COS workspace, currently **empty**. The whole sprint is rebuilt here from scratch: first the ATM-416 foundation, then each app through the full lifecycle into `apps/<app>/lifecycle/01-intent … 11-analysis`.
- **Rebuild first (ATM-416):** `contracts/` (schemas, `cohort` seeds, `kpi` formulas, `state-transitions.json`, `negative`, per-app `specs`), the `packages/commerce-core` deterministic engine, the `tools/` (`cohort-runner.mjs`, `freeze.mjs`, `seal-app.mjs`, `validate-contracts.mjs`), `tests/`, and `procedures/`. Follow `docs/atm-415/atm-416-todo.md` — it is the full contract checklist. Nothing downstream can run until these exist and validate green.
- Lifecycle *machinery* lives in the OTHER repo (`weave`) and is intact: the skill, `evals/lifecycle/*.yaml`, `scripts/weave_eval.py`, `runner/lifecycle-runner.mjs`, templates.
- Brand + design source of truth (OTHER repo, `P:\Development\Projects\weave`):
  - Brand (persona/problem/research source): `docs/atm-415/atm-417-brand.md` (OneReel), `atm-418-brand.md` (Marginalia), `atm-419-brand.md` (Vitrine)
  - Provided UI to port faithfully: `docs/atm-415/ui/{onereel,marginalia,vitrine}`
  - Per-issue todos: `docs/atm-415/atm-4{15..423}-todo.md`
- **Why this work exists:** the first pass produced sealed apps on **generic placeholder products** (Dana/fitness, etc.) that didn't match the locked brands, and scored **3.6/10 on design** (improvement-log Entry 001). We are rebuilding the whole sprint clean — real brands, provided UI, full lifecycle per app — the strongest form of the ATM-415 thesis (WEAVE operates the whole lifecycle end to end).

## The prime directive

Everything must be **real and WEAVE-driven, with evidence**. Concretely:
1. Each app goes **through the full lifecycle** (`intent → research → selection → plan → engineering → qa → kpi-setup → iteration → analysis`, owner-gated stages skipped per envelope), using the repo's actual tools and eval gates. Nothing is hand-waved or back-filled.
2. **Record every human intervention** in an intervention ledger as you go (what you did by hand vs what WEAVE/tooling did). This is honesty infrastructure, not paperwork.
3. **Build the ATM-416 foundation first, then conform to it.** Once the contracts/engine/tools exist and are frozen (ATM-416), every app must validate against the frozen schemas/seeds/KPI/state-machine/negative contracts — `tools/validate-contracts.mjs` must pass. After ATM-416 freezes, changing a frozen contract is an `OWNER_GATE`, never a silent edit.
4. If anything can't be proven, it **blocks** — a missing proof row is a failure, not a footnote to waive.

## Execution discipline — one at a time, no batching

Do **not** parallelize or batch. The whole point is that nothing gets skipped, so work strictly sequentially and finish-before-you-start:

1. **One issue at a time, in dependency order.** Foundation first, then the apps, and fully complete each before the next:
   **ATM-416 (rebuild foundation) → video-storefront (ATM-417) → sticker-storefront (ATM-418) → nft-storefront (ATM-419) → cross-app comparison (ATM-420) → seal/closeout (ATM-423).** Do not open the next issue until the current one is complete with evidence. **ATM-416 is a hard gate — no app work begins until the foundation validates green** (`node tools/validate-contracts.mjs` passes, `npm test` green).
2. **One todo checkbox at a time.** Open that issue's todo in `docs/atm-415/atm-4XX-todo.md` and work it **top to bottom**. Complete a single item, produce its artifact, then **check it off in the todo file with a link to the proof** — before touching the next item.
3. **No skipping, no "come back later."** If an item can't be completed, it **blocks** — stop, record why (`ENGINEERING_REQUIRED` / `OWNER_GATE` / thin input), and surface it. A skipped-and-forgotten item is the exact failure mode this rule exists to prevent.
4. **A short STATUS/PROOF/NEXT after each issue** so progress is auditable and resumable — anyone can see which issue is done, which is in flight, and what's next.
5. **Commit and push after each issue is completed.** When an issue is done (evidence in place, todo boxes checked, PROGRESS.md updated), make one clean commit (`ATM-4XX: <what landed>`) and push it. One issue = one pushed commit, so each completed issue is a durable, reviewable checkpoint. Do not push mid-issue or with a red validate/test.

Working this way means the todo files double as a live checklist: at any moment, the checked boxes (with proof links) are exactly what's provably done, and the first unchecked box is exactly where to resume.

## Session model — one issue per session, one stage per step (token discipline)

**Step 0 of EVERY session: read [`docs/atm-415/PROGRESS.md`](PROGRESS.md)** for the `▶ NEXT` issue, **then load its two authorities into context before doing any work:**
1. **[`atm-415-todo.md`](atm-415-todo.md)** — the umbrella: deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only).
2. **ATM-416 frozen contracts** — the target app must conform to the frozen schemas/seeds/KPI/negative contracts in `weave-v5-apps/contracts/`; changing any frozen contract, seed, or KPI is an `OWNER_GATE`, never a silent edit.

These are the durable, local authority — do **not** re-fetch ATM-415 from Linear each session (wasteful, and the apps repo may lack Linear access). The `▶ NEXT` issue's own `atm-4XX-todo.md` restates both under its "Authority" header, so reading that one todo carries the authority with it. A cold session needs nothing else to orient — do not scan all the todos or all the apps. Work only that issue. **At the end of the session, update `PROGRESS.md` last** (the ▶ NEXT line, the status row, and the session log). That file is the hand-off baton between sessions.

Order of truth: `PROGRESS.md` says *which issue*; that app's `lifecycle/lifecycle-state.json` says *which stage within it*. If they ever disagree, `lifecycle-state.json` wins on stage and you correct `PROGRESS.md`.

**Each chat session handles exactly ONE app/issue.** Do not load the other apps' context. A session only ever reads: this prompt, that one app's `docs/atm-415/atm-4XX-todo.md`, that one app's brand doc, and files under that one app's `apps/<app>/` directory. This keeps each session small and cheap — the whole point is that you never hold three apps' trees in context at once.

**Within a session, advance the WEAVE lifecycle one stage at a time.** State lives on disk (`apps/<app>/lifecycle/lifecycle-state.json`), so a session needs no memory of prior sessions — it reads the state, does the next stage, writes proof, and stops. The next session resumes purely from disk.

The stage runbook (all commands verified against this repo):

```bash
# 1. Which stage is next? (prints ONE stage prompt and stops)
node "P:/Development/Projects/weave/packages/weave-tool/skills/weave-application-lifecycle/runner/lifecycle-runner.mjs" --app <app> --root "P:/Development/Projects/weave-v5-apps"
```
```bash
# 2. Read that stage's contract + procedure before doing the work:
#    contract:  P:/Development/Projects/weave/packages/weave-tool/evals/lifecycle/<stage>.yaml
#    procedure: P:/Development/Projects/weave-v5-apps/procedures/lifecycle/NN-<stage>.md
#    get the review form:
python "P:/Development/Projects/weave/scripts/weave_eval.py" <stage> --review-template
```
```bash
# 3. Do the stage work, fill the review with evidence, then SCORE the one stage.
#    --app-path is REQUIRED (without it the gates run against the WEAVE repo, not your app).
python "P:/Development/Projects/weave/scripts/weave_eval.py" <stage> --run-gates --app-path "P:/Development/Projects/weave-v5-apps/apps/<app>" --review-file <filled-review.json> --strict
```

Then write `proof/<stage>-eval-result.json`, set that stage `verified` in `lifecycle-state.json`, check off the matching todo item with the proof link, and **end the session with STATUS/PROOF/NEXT**. Note the two path facts: `weave_eval.py` lives at the **weave repo root** (`scripts/`, not under `packages/weave-tool/` as SKILL.md says), and only `engineering`/`qa` actually execute gates — the rest score the review doc.

**When to end a session:** after the app is fully sealed, OR at any natural break (a stage verified, a gate hit). Because state is on disk, stopping mid-app costs nothing — the next session picks up from `lifecycle-state.json`.

**Exception — the cross-app issues (ATM-420 comparison, ATM-423 seal)** are inherently multi-app. Do them in their own sessions *after* all three apps are sealed, and read only the **sealed digests / manifests / analysis outputs** (not each app's full tree) — that keeps even these sessions bounded.

## ⚠️ The foundation line (read twice)

Because this is a **total from-scratch build**, everything is authored fresh — including ATM-416's contracts, engine, and tools. Once ATM-416 is built and frozen, it becomes the line you must not cross:

- **After ATM-416 freezes, its foundation is frozen — conform to it, never edit it.** `contracts/schemas`, `contracts/cohort` (seeds), `contracts/kpi` (formulas), `contracts/state-transitions.json`, `contracts/negative`, and `packages/commerce-core` are ATM-416's domain-agnostic output. Each app must **validate against** them (`tools/validate-contracts.mjs` passes) but must **not change** them once frozen. If a brand seems to need a schema/seed/KPI change *after* the freeze, that is an `OWNER_GATE` (or `ENGINEERING_REQUIRED`) — stop and surface it, never silently edit a frozen contract.
- **The per-app spec is authored fresh from the brand and must validate + stay distinct.** `contracts/specs/<app>.spec.json` gets persona/problem/catalog from the brand doc. The three specs must be genuinely distinct (the "not a reskin" contract) and each must conform to the shared schemas.
- **Freeze the baseline BEFORE the loop, and keep build and experiment separate.** The lifecycle order is: build the app → freeze the baseline digest (kpi-setup) → *then* run the one bounded adaptation and identical retest (iteration). Do not conflate "we built the app" with "we ran the experiment," or every KPI delta becomes a false claim. Freeze the app code at a known SHA before measuring; the running app makes **no live AI/network calls** in the cohort-exercised path (that is what makes the retest reproducible).

## Faithful-build rules

- **Port the provided UI exactly — this is a copy, not a redesign.** The `docs/atm-415/ui/<brand>` tree is real Next.js (`app/ components/ lib/ styles/ tailwind.config.ts`). Bring it in **verbatim** — same components, markup, tokens, Tailwind config, type, color, spacing, copy, layout, and all states. The rendered app must look **pixel-identical** to the provided UI. **No "improvements," no restyling, no dropped sections, no substitutions.** The only edits permitted are wiring the UI to `commerce-core`/data (imports, props, data hooks) — never visual changes. If wiring seems to force a visual change, stop and surface it rather than silently altering the design.
- The brand doc (`atm-4XX-brand.md`) is the source for **persona/problem/research and the deterministic baseline hero copy** — but where the provided UI already contains copy, the UI is authoritative for what renders. They should agree; if they conflict, surface it, don't pick silently.
- **Author the catalog to the brand's domain, but conform to the commerce contract.** The catalog items are the brand's (indie films, sticker packs, editions), but the cart/checkout/order/fulfillment-or-ownership/cancellation/refund *behavior* and the *event schema* must match `contracts/schemas/` and the frozen state machine — `tools/validate-contracts.mjs` must pass. Build the UI + data on top of the existing `packages/commerce-core`; do not rewrite the engine, schemas, state machine, or KPI/seed logic.
- Include all critical states (empty / invalid / failure) — do not ship happy-path only.
- Honor the app-specific hard contracts: Vitrine's **chainless negative contract** (no wallet/chain/token surface, and the footer + first-purchase synthetic nonclaim) and video/sticker **public-safe asset contract**. The frozen `contracts/negative/*` are the source of truth; the app must pass them.

---

## Per-app procedure (run for video-storefront, then sticker, then nft)

Work one app fully to seal before starting the next. The lifecycle is **runner-driven** — the runbook above tells you the next stage; the steps below are what "doing the work" means for these apps at each stage. Only the **first session per app** does the scaffold; every later session just reads `lifecycle-state.json` and does the next stage.

### 0. Scaffold the app (first session only)
- [ ] `git status` clean; work on the app's own branch. Commit or stash first. Open the intervention ledger for this app (log every hand-edit from here on).
- [ ] Create `apps/<app>/lifecycle/lifecycle-state.json` from `packages/weave-tool/skills/weave-application-lifecycle/templates/lifecycle-state.template.json` (set the app id). Add the app to `apps/registry.json`.
- [ ] Author `contracts/specs/<app>.spec.json` fresh from the brand doc (persona/problem/catalog/rights/KPI-assumptions/risks/nonclaims), conforming to `contracts/schemas`. `node tools/validate-contracts.mjs` must pass and the three specs must be distinct.
- [ ] Run the runner; it enters **PRE-INTENT (guided intake)** — follow `weave-guided-intake/SKILL.md`, write `apps/<app>/lifecycle/intake.json` (+ `intent.json`) from the brand doc. That closes the intake gate. Re-run the runner to get the `intent` stage.

### Stage-by-stage (runner presents each; do the work, score, write proof, next)
- [ ] **intent** — owner context + problem/persona from the brand. Source: `docs/atm-415/atm-4XX-brand.md` + `-todo.md`. Score → `proof/intent-eval-result.json`.
- [ ] **research** — research packet for the brand product. Keep the synthetic-only scope note; cite the frozen contracts as the source list. Score → `proof/research-eval-result.json`.
- [ ] **selection / plan** — architecture: Next.js + `packages/commerce-core` + the frozen data layer, UI from the provided `docs/atm-415/ui/<brand>` tree (ported verbatim). If the brand forces a structural change the envelope doesn't support → `ENGINEERING_REQUIRED`, stop. Score each → proof.
- [ ] **engineering** — build the app: bring the Claude Design UI under `apps/<app>/src/app` (+ components/tokens), wire it to `commerce-core`, author the catalog to the brand domain. Apply the brand doc faithfully; verbatim hero copy; all critical states. `npm run build` + `npm run dev` clean (no console errors); `node tools/validate-contracts.mjs` passes; app-specific negative contract passes. Score → `proof/engineering-eval-result.json`. Log every hand-edit as an intervention.
- [ ] **qa** — requires an **`impeccable` critique ≥7/10 with zero P0 findings** as a scored artifact (this is the gate that closes the 3.6/10 design gap). Capture → `proof/qa-eval-result.json`. If <7/10 or any P0 → fix and rerun; do not waive.
- [ ] **kpi-setup + freeze baseline** — `node tools/freeze.mjs` to freeze the baseline digest against the built code SHA, then `node tools/cohort-runner.mjs` with the **frozen seeds** → `proof/baseline`. Confirm determinism (same seeds → identical digest across ≥2 runs). Baseline is frozen BEFORE any adaptation.
- [ ] **iteration (the loop)** — WEAVE diagnoses the baseline, ranks bounded adaptations by evidence/impact/effort/risk. Apply **one** approved bounded change (e.g. the CTA/framing candidate in the app's todo); record its diff/commit identity. Re-run the cohort with **identical seeds** → `proof/retest-1`; compare KPI + guardrails. Issue **GO / ITERATE / PIVOT / STOP** with the explicit synthetic-only nonclaim.
- [ ] **analysis + seal** — write the `analysis` stage output. `node tools/seal-app.mjs` → `proof/seal-manifest.json` (manifest + checksums). Update `apps/registry.json` to sealed. Close the app's intervention ledger and usage ledger (model/tool/token/time — note Fable-plan vs Sonnet-execute split).

*(Owner-gated stages `deployment` and `marketing` are out of the local envelope — skip per ENVELOPE.md, recorded as owner-gated-skipped.)*

---

## Evidence to produce (the ATM-415 deliverables — do not skip)

- [ ] Per app: fresh `contracts/specs/<app>.spec.json`, `intake.json`, per-stage eval results (intent/research/selection/plan/engineering/qa), intervention ledger, baseline digest, retest digest, seal manifest + checksums, analysis, cleanup proof (no `.next`/db residue committed).
- [ ] **Daily `STATUS / PROOF / NEXT`** entries (no gaps).
- [ ] **Improvement-log entry** in `P:\Development\Projects\weave\docs\weave-application-lifecycle-improvement-log.md` recording this as the remediation of the Entry 001 design-quality gap, with before (3.6/10) → after (impeccable score) evidence.
- [ ] Refresh the cross-app comparison (ATM-420 doc) if KPI numbers changed.
- [ ] Everything **source-linked** — every claim points to a real artifact path.

## Boundaries (hard stops)

- **Commit + push per completed issue is allowed and expected** (owner-directed). But **no** PR, merge, deploy, publish, user contact, payment, wallet/chain, or real-demand claim.
- `ENGINEERING_REQUIRED` stop if the build needs a missing adapter/schema/invariant the skill/envelope doesn't support.
- `OWNER_GATE` stop for any change to the preserved frozen foundation (schemas/seeds/KPI/state-machine/negative) and for any external/privileged/production/material-scope action.
- This is 417/418/419 (the skill-building apps), so design-tool + human porting is allowed — **but it must be recorded**, because ATM-422 (the fresh-operator exam) is where the no-engineer claim is actually tested, and its honesty depends on these ledgers being truthful.

## Definition of done

- [ ] All three apps built from intent, run through the loop, and sealed with fresh, reproducible evidence.
- [ ] Every touched acceptance-matrix row has source-linked proof (feeds ATM-423).
- [ ] Worker state set to `READY_FOR_CONTROLLER_REVIEW_WEAVE_THREE_APPLICATIONS_V5`.
- [ ] Hand to the independent controller (George). **You do not mark ATM-415 Done** — only controller verification closes it.

## Reference

Per-issue todos (this repo, `weave`): `docs/atm-415/atm-415-todo.md` (umbrella) and `atm-416`…`atm-423-todo.md`. Read the umbrella + the target app's todo + its brand doc before starting each app.
