# ATM-420 — Cross-App Comparison, WEAVE Contribution & Best Next Investment

**Ticket:** ATM-420 · **Sprint:** ATM-415 · **Date:** 2026-07-24 · **Blocks:** ATM-423
**Scope:** analysis only. No app was built, modified, or re-run to produce this document.

---

## Synthetic-only nonclaim — read this before any number below

> **All KPIs in this document are from deterministic seed-42 synthetic cohorts (200 users).
> They do not prove real demand, real conversion, or real financial performance.**

The cohort engine (`weave-v5-apps/tools/cohort-runner.mjs`) is a `mulberry32` PRNG walked against
a per-app funnel probability table. It has no representation of price, copy, layout, or any UI
surface. A conversion rate of 13.5% is a property of the seed and the funnel table — not of a
buyer. Every verdict, ranking, and recommendation in this document inherits that limit.

## Two disclosures about this document's own provenance

1. **Linear was not consulted.** The Linear MCP server requires OAuth and this session is
   non-interactive, so ATM-420 and ATM-421 could not be pulled and George's current comments are
   unseen. This document is written against `atm-420-todo.md`, which the ticket names as the
   authoritative acceptance gate. **Any scope change recorded in Linear after the todo file was
   written is not reflected here.**
2. **A contradictory pre-wipe comparison set was deleted, not merged.** `docs/atm-415/comparison/`
   (8 files) described a previous workspace generation — different apps (including a
   `poster-storefront`), different numbers (sticker CR `0.325` / AOV `$5.66` against the sealed
   `0.135` / `$12.85`). The owner confirmed that workspace was wiped. Those files were removed in
   this ticket's commit; every number below is re-derived from the current sealed artifacts.

## Claim labels

Every claim in this document carries one label. No claim is unlabeled.

| Label | Meaning |
|---|---|
| `[FACT]` | Traces to a named file on disk. The path is given. |
| `[INFERENCE]` | Reasoning from one or more `[FACT]`s. The facts are named. |
| `[ASSUMPTION]` | A value supplied by a synthetic spec, not measured from anything real. |
| `[UNKNOWN]` | Not measured, not modelled, not recorded. Never estimated to fill the gap. |
| `[DECISION]` | A judgement this document makes, with its evidence attached. |

All paths are relative to `P:\Development\Projects\weave-v5-apps\` unless prefixed `weave/`.

---

## 1. Normalized comparison table

### 1.1 Identity and seal

| | **OneReel** (video-storefront) | **Marginalia** (sticker-storefront) | **Vitrine** (nft-storefront) |
|---|---|---|---|
| Ticket | ATM-417 | ATM-418 | ATM-419 |
| Seal SHA `[FACT]` | `164785a4` | `86766633` | `c4f17460` |
| Sealed at `[FACT]` | 2026-07-22T21:30:38Z | 2026-07-22T22:26:05Z | 2026-07-23T23:12:01Z |
| Seal file count `[FACT]` | **61** | **53** | **50** |
| Routes built `[FACT]` | 12 | 12 | 8 |
| Distinct design system `[FACT]` | Archival Warmth | Vinyl Pop | Keepsake |

Source: `apps/<app>/proof/seal-manifest.json`; route counts from each app's
`proof/qa-eval-result.json` / `engineering-eval-result.json`.

`[FACT]` The three design systems are genuinely distinct — different palettes, type stacks and
signature devices (Archival Warmth's muted archival tones; Vinyl Pop's hard offset shadows and
badge-tilt; Keepsake's cream/plum with Nunito). This is a change from the pre-wipe generation, where
an independent review found four apps shipping byte-identical body backgrounds
(`weave/docs/weave-application-lifecycle-improvement-log.md`, Entry 001 evidence table).

### 1.2 Lifecycle stages: executed vs gated/skipped

All three apps ran the same 11-stage lifecycle. All three verified the same 9 stages and left the
same 2 unexercised.

| Stage | OneReel | Marginalia | Vitrine |
|---|---|---|---|
| intent | verified 100% | verified 100% | verified 100% |
| research | verified 100% | verified 100% | verified 100% |
| selection | verified 100% | verified 100% | verified 100% |
| plan | verified 100% | verified 100% | verified 100% |
| engineering | verified 91.67% | verified 10/10 AC | verified 12/12 AC |
| qa | verified 90.0% | verified (Nielsen gate) | verified (Nielsen gate) |
| **deployment** | `not_started` | `owner_gated_skipped` | `owner_gated_skipped` |
| kpi-setup | verified 100% | verified | verified |
| **marketing** | `not_started` | `owner_gated_skipped` | `owner_gated_skipped` |
| iteration | verified 93.75% | verified | verified |
| analysis | verified 100% | verified | verified |

Source: `apps/<app>/lifecycle/lifecycle-state.json`.

`[FACT]` **9 of 11 stages proven; 2 gated and unexercised in every app.** `deployment` and
`marketing` have never completed in any run — they require provider access and real channel access
respectively, both `OWNER_GATE`.

`[FACT]` Only `engineering` and `qa` carry gates that execute a command. The other seven scored
stages evaluate a review document against a rubric. A confident wrong answer scores as well as a
right one.

`[FACT]` **Of OneReel's five engineering hard gates, two did not execute.** `unit_tests_pass` and
`no_secret_leakage` both record `"status": "windows-runner-incompatible"`, `"passed":
"manual-verified"` — bash `if [ -f ... ]` syntax and `python3`, neither available on the Windows
runner (`apps/video-storefront/proof/engineering-eval-result.json`). The same happened at `qa`:
`public_safe_scan_pass` records `"runner_exit_code": 9009, "runner_error": "python3 not found on
Windows"` (`apps/video-storefront/proof/qa-eval-result.json`). This is the gate-portability wall,
open since Entry 001 Change #1 and now in its fourth recorded recurrence.

`[INFERENCE]` So the honest count for OneReel is **3 of 5 engineering gates and 2 of 3 qa gates
executed**; the rest advanced on operator judgement with the override disclosed. Marginalia and
Vitrine avoided this by using Node-based gates (`npm run build`, `node tools/validate-contracts.mjs`)
rather than the inherited Python/bash ones — a workaround, not a fix.

### 1.3 Human interventions

| | OneReel | Marginalia | Vitrine |
|---|---|---|---|
| Ledger file exists `[FACT]` | yes | yes | **no** |
| Recorded count `[FACT]` | 5 | 1 | 0 (claimed) |
| Types `[FACT]` | AUTHOR ×1, PORTED ×1, GATE-BYPASS ×1, FIX ×1, DECISION ×1 | bounded recovery ×1 (INT-001) | — |

Source: `apps/video-storefront/INTERVENTION_LEDGER.md`,
`apps/sticker-storefront/INTERVENTION_LEDGER.md`, `apps/nft-storefront/proof/engineering-eval-result.json`
(`"interventions": []`).

Plus `INTERVENTION_LEDGER.md` at the workspace root: `[FACT]` 5 foundation-level interventions
during ATM-416 (authoring all contracts from scratch; choosing seed 42 / 200 users; choosing
mulberry32; designing the chainless scanner's `known_false_positives` allowance upfront).

`[FACT]` **Vitrine has no `INTERVENTION_LEDGER.md`.** The file is absent from its seal manifest
(50 files, no ledger entry) while both siblings include theirs. Its engineering eval-result records
`"interventions": []`.
`[INFERENCE]` Vitrine's intervention count is therefore **unrecorded, not verified-zero**. A
reviewer cannot distinguish "nothing was hand-edited" from "nobody wrote it down". This is flagged
as **D3** below rather than reported as a clean zero.

`[INFERENCE]` The interventions cluster in exactly two places the framework supplies nothing for:
**gate portability on Windows** (OneReel #3, Marginalia INT-001) and **craft/domain judgement**
(catalog design, brand framing, design-system choice — none of which any stage asks for).

### 1.4 Synthetic KPIs

All three cohorts: `seed=42`, `user_count=200`, schema `weave-v5/cohort/v1`.

| Metric | OneReel | Marginalia | Vitrine |
|---|---|---|---|
| views `[FACT]` | 200 | 200 | 200 |
| converts `[FACT]` | 26 | 27 | 20 |
| events emitted `[FACT]` | 368 | 378 | 342 |
| **conversion rate** `[FACT]` | 26/200 = **13.0%** | 27/200 = **13.5%** | 20/200 = **10.0%** |
| **AOV** `[FACT]` | **$5.72** | **$12.85** | **$30.35** |
| refunds `[FACT]` | 1 | 2 | 0 |
| **refund rate** `[FACT]` | 1/26 = **3.85%** | 2/27 = **7.41%** | **0.00%** |
| fulfills `[FACT]` | 26 | 24 | 20 |
| **fulfill rate** `[FACT]` | **100%** | 24/27 = **88.9%** | **100%** |
| **guardrail breach** `[FACT]` | false | false | false |
| Cohort runs sealed `[FACT]` | **1** | 2 | 2 |
| Determinism reproduced `[FACT]` | **cannot verify** | yes, byte-identical | yes, byte-identical |

Sources: `apps/video-storefront/proof/cohort-2026-07-22T21-27-14/cohort-result.json`;
`apps/sticker-storefront/proof/cohort-2026-07-22T22-22-26/` and `…T22-24-48/`;
`apps/nft-storefront/proof/cohort-2026-07-23T23-09-32/` and `…T23-11-00/`.

Guardrails from `contracts/kpi/formulas.json`: `[FACT]` refund rate max 0.15, conversion floor 0.01.
All three sit inside both — Marginalia's 7.41% refund is the closest approach, at 49% of the ceiling.

`[FACT]` **Determinism was verified by byte-comparison during this analysis**, not read off an
artifact: hashing each `cohort-result.json` with `generated_at` stripped gives identical digests for
Marginalia's two runs and identical digests for Vitrine's two runs. OneReel sealed only one run, so
its determinism cannot be reproduced from the sealed artifacts alone — **D4** below.

`[INFERENCE]` The spread in AOV ($5.72 → $30.35, a 5.3× range) tracks the catalog price points each
app's author chose, not any modelled willingness to pay. The spread in conversion (10.0% → 13.5%) is
a property of each spec's funnel table. Neither spread carries product information.

### 1.5 QA scores

| | OneReel | Marginalia | Vitrine |
|---|---|---|---|
| Method `[FACT]` | single-pass impeccable (assessment B degraded) | dual-agent sub-agents | dual-agent inline |
| Nielsen `[FACT]` | 30/40 = **7.5/10** | 29/40 = **7.25/10** | 34+34/80 = **8.5/10** |
| Rubric score `[FACT]` | 18/20 = 90.0% | — (gate form) | — (gate form) |
| **P0** `[FACT]` | **0** | **0** | **0** |
| P1 found / fixed `[FACT]` | 2 found, 0 fixed | 4 found, **3 fixed**, 1 deferred | 1 found, **1 fixed** |
| P2 `[FACT]` | 2 | 2 found, 2 fixed | 0 |
| AI-slop detector `[FACT]` | exit 0, zero findings | exit 0, CLEAN | exit 0, CLEAN |
| Gate result `[FACT]` | GO (≥84%) | PASS (≥7.0, P0=0) | PASS (≥7.0, P0=0) |

Sources: `apps/<app>/proof/qa-eval-result.json`.

`[FACT]` **All three cleared the `impeccable` gate (≥7/10, zero P0).** This is the change Entry 001
proposed as #4 and Entry 002 shipped: the design critique is a scored artifact with a binary P0
blocker, not a suggestion.

`[FACT]` **Marginalia deferred one P1 rather than fixing it** — `text-ink-faint` at ~2.9:1 contrast,
below the 4.5:1 WCAG AA floor for normal text, used in 8+ locations. Recorded as
`"status": "deferred_iteration"`. It is still open.

`[INFERENCE]` OneReel's QA is the weakest of the three despite the highest rubric percentage: its
assessment B ran degraded (sub-agent interrupted, no screenshots), it fixed **none** of its two P1s,
and its `evidence_quality` dimension was self-scored 3/4 for exactly that reason. The 90.0% figure
and the 7.5/10 Nielsen figure measure different things and should not be read as agreement.

### 1.6 Iteration: adaptation, delta, verdict

| | OneReel | Marginalia | Vitrine |
|---|---|---|---|
| Adaptation `[FACT]` | CTA framing ("Back this film" vs "Buy film") | variant-clarity (price deltas + finish descriptions in picker) | provenance-clarity ("no. X" promoted to 16px/black) |
| Δ conversion `[FACT]` | **0.0** | **0.0** | **0.0** |
| Δ AOV `[FACT]` | **0.0** | **0.0** | **0.0** |
| Δ refund `[FACT]` | **0.0** | **0.0** | **0.0** |
| Verdict recorded `[FACT]` | **ITERATE** | **GO** | *(no verdict field)* |
| Verdict required by frozen rule `[INFERENCE]` | ITERATE | ITERATE | ITERATE |

Sources: `apps/video-storefront/proof/iteration-eval-result.json`,
`apps/sticker-storefront/proof/iteration-result.json` + `lifecycle/lifecycle-state.json`,
`apps/nft-storefront/proof/iteration-result.json`.

`[FACT]` `contracts/kpi/formulas.json` `verdict_rules`: GO requires `retest conversion_rate >
baseline`; ITERATE is `retest conversion_rate <= baseline but within noise (<5% delta) AND no
guardrail breach`. A delta of exactly zero is not greater than baseline.

`[INFERENCE]` **All three should have recorded ITERATE.** OneReel did. Marginalia recorded GO on a
zero delta, which the frozen rule does not permit. Vitrine recorded no verdict at all. This is **D7**.

`[FACT]` **Four consecutive cycles have now produced a zero delta from a UI adaptation** — Entry 003,
Entry 004 Finding B, Entry 005 Finding B, Entry 006 Finding D. Vitrine's own iteration artifact says
it plainly: *"delta is exactly 0 — expected behavior; cohort engine is deterministic (seed=42) and
engine-blind to UI surface changes"*.

### 1.7 Cost and proof completeness

| | OneReel | Marginalia | Vitrine |
|---|---|---|---|
| Wall time `[UNKNOWN]` | not recorded | not recorded | not recorded |
| Model / token cost `[UNKNOWN]` | not recorded | not recorded | not recorded |
| Tool-use count `[UNKNOWN]` | not recorded | not recorded | not recorded |
| Proof artifacts on disk `[FACT]` | 9 eval-results + 1 cohort | 8 eval-results + 2 cohorts | 9 eval-results + 2 cohorts |
| Intervention ledger `[FACT]` | present | present | **absent** |
| Freeze commit recorded `[FACT]` | `164785a4` | `86766633` | **`null`** |

`[UNKNOWN]` **No per-stage or per-app cost ledger exists anywhere in this workspace.** The
improvement log's Collection Protocol (item 5) requires wall time and model/token cost per stage so
that improvement cost can be argued against ATM-415's 15% skill allocation. Nothing recorded it.
**The sprint's total token cost cannot be stated, and this document does not estimate it.** This is
a real proof-completeness gap and it means the "WEAVE is cheaper than an engineer" claim is
currently unmeasurable in either direction.

---

## 2. Defects found in the sealed evidence

Nine defects were found while assembling this table. **None were repaired.** All three apps are
sealed, and each app's `lifecycle-state.json` is itself listed inside its `seal-manifest.json` with
a sha256 — editing any of them invalidates the seal that is the sprint's whole deliverable.
Reporting them intact is worth more than a silently corrected record.

| ID | Defect | Evidence | Severity |
|---|---|---|---|
| **D1** | Vitrine's baseline is invalid by its own contract. `contracts/freeze-digests.json` sets `nft-storefront.frozen_at_commit: null` while two baseline cohort runs exist. The same file's governance note reads: *"if a baseline run exists with a null `frozen_at_commit`, it is invalid."* | `contracts/freeze-digests.json` vs `apps/nft-storefront/proof/cohort-2026-07-23T23-09-32/` | **High** — the freeze is what separates "building the app" from "running the experiment" |
| **D2** | All three apps have `baseline_run_ref: null`. The freeze ledger was never linked to any run, in any app. | `contracts/freeze-digests.json` | Medium |
| **D3** | Vitrine has no `INTERVENTION_LEDGER.md`; its intervention count is unrecorded, not zero. | `apps/nft-storefront/proof/seal-manifest.json` (50 files, no ledger) | Medium — ATM-422's honesty audit depends on these ledgers |
| **D4** | OneReel sealed one cohort run. Entry 004 claims two identical seed-42 runs; only one is on disk, so determinism is unreproducible for that app from sealed artifacts alone. | `apps/video-storefront/proof/` (single `cohort-*` dir) vs improvement log Entry 004 §"What held up well" | Medium |
| **D5** | Lifecycle-state schema drift: three apps, three vocabularies. `current_stage` is `complete` vs `sealed`; gated stages are `not_started`+`proof_state` vs `owner_gated_skipped`; scores are `eval_score_percent` vs `ac_pass_count` vs `eval_score_10`. Nothing in `contracts/` defines a lifecycle-stage state vocabulary — `contracts/state-transitions.json` covers *order* state only. | all three `lifecycle/lifecycle-state.json`; `contracts/state-transitions.json` | **High** — no validator can fail closed against a vocabulary that does not exist |
| **D6** | OneReel's proof artifacts cite `packages/weave-tool/evals/lifecycle/*.yaml` and schema `weave.eval-result/v0.1` — contracts from the wiped workspace. The references now dangle. | `apps/video-storefront/proof/qa-eval-result.json:7`, `analysis-eval-result.json`, `iteration-eval-result.json` | Medium |
| **D7** | Iteration verdicts inconsistent with the frozen rule (§1.6). Marginalia recorded GO on a zero delta; Vitrine recorded no verdict. | `contracts/kpi/formulas.json` `verdict_rules` vs each app's iteration artifact | **High** — a verdict that ignores its own frozen rule is not evidence |
| **D8** | No digest is emitted anywhere. `tools/cohort-runner.mjs` writes no checksum; `cohort-result.json` has no digest field. Determinism is provable only by byte-comparing two runs by hand. | `tools/cohort-runner.mjs`; `cohort-result.json` key list | **High** — the identical-retest contract has no machine-checkable artifact |
| **D9** | Vitrine's engineering AC count contradicts itself: `lifecycle-state.json` records `ac_pass_count: 11, ac_total: 12`; `engineering-eval-result.json` records `ac_pass_count: 12, ac_total: 12`. | `apps/nft-storefront/lifecycle/lifecycle-state.json` vs `proof/engineering-eval-result.json` | Low |

`[INFERENCE]` D1, D5, D7 and D8 share one root: **the workspace has strong contracts for the
commerce domain and none for the lifecycle record itself.** `contracts/` freezes order states, KPI
formulas, cohort seeds and negative contracts — but the file that says which stages passed is
governed by nothing. Every one of those four defects is a thing that would have been caught by a
validator, had a schema existed for it to validate against. That observation is the direct input to
ATM-421 and to §6.

---

## 3. Three decisions

Each verdict uses the frozen vocabulary in `contracts/kpi/formulas.json` and cites the sealed
artifact that forces it. **All three inherit the synthetic-only nonclaim in full**: none of these is
a statement about a market.

### 3.1 OneReel (video-storefront) — `[DECISION]` **ITERATE**

**Causal citation:** `apps/video-storefront/proof/iteration-eval-result.json` →
`experiment_summary.delta: 0.0`, `verdict: "ITERATE"`, with the recorded nonclaim *"Synthetic cohort
only. Delta of 0.0% does not prove CTA copy has no effect — simulator is copy-agnostic by design."*

**Why not GO:** the frozen rule requires `retest conversion_rate > baseline` for GO. The delta is
exactly zero. `[FACT]`

**Why not STOP or PIVOT:** no guardrail breached — refund 3.85% against a 0.15 ceiling, conversion
13.0% against a 0.01 floor `[FACT]` (`proof/cohort-2026-07-22T21-27-14/cohort-result.json`).

**What holds this app back, specifically:** it is the only app of the three with **two unfixed P1s**
and a **degraded QA assessment** — `proof/qa-eval-result.json` records `p1_count: 2` with no fix
record and `evidence_quality: 3/4` because screenshots were unavailable. `[FACT]` It is also the
only app whose determinism cannot be reproduced from its own seal (**D4**) and whose proof chain
points at deleted contracts (**D6**). `[INFERENCE]` Of the three, OneReel's proof chain is the
thinnest, and the ITERATE verdict should be read as "re-run QA and the baseline before trusting this
app's evidence", not as "the product is nearly there".

### 3.2 Marginalia (sticker-storefront) — `[DECISION]` **ITERATE**

**Causal citation:** `apps/sticker-storefront/proof/cohort-2026-07-22T22-24-48/cohort-result.json`
reproduces the baseline exactly (CR 13.5%, AOV $12.85, refund 7.41%) after the variant-clarity
adaptation → delta 0.0 → ITERATE under the frozen rule. `[FACT]`

**Correcting the recorded verdict:** the app recorded **GO**
(`lifecycle/lifecycle-state.json` iteration stage: `"verdict": "GO"`). `[FACT]` The frozen rule does
not permit GO on a zero delta. `[DECISION]` This document records **ITERATE** and flags the
divergence as **D7**. The recorded GO is not evidence of an improvement; it is a rule not applied.

**What holds this app back, specifically:** the one deferred P1 — `text-ink-faint` at ~2.9:1,
failing WCAG AA across 8+ locations, `"status": "deferred_iteration"` in
`proof/qa-eval-result.json`. `[FACT]` It is a one-token change with zero layout risk and it is still
open. `[INFERENCE]` Marginalia has the strongest proof chain of the three — two reproducing cohort
runs, a written ledger, a real freeze commit, 3 of 4 P1s and both P2s fixed inside QA — and the
weakest remaining blocker.

### 3.3 Vitrine (nft-storefront) — `[DECISION]` **ITERATE, gated on repairing D1**

**Causal citation:** `apps/nft-storefront/proof/iteration-result.json` → `conversion_rate_delta:
0.00`, with the explicit note that *"zero-delta between baseline and iteration is a property of the
synthetic engine, not a finding about UI efficacy"*. `[FACT]` Delta zero, no breach → ITERATE.

**Why "gated":** `contracts/freeze-digests.json` records `nft-storefront.frozen_at_commit: null`
while two baseline runs exist `[FACT]`, and the same file states that such a baseline **is invalid**.
`[INFERENCE]` Vitrine's KPI baseline therefore does not satisfy the contract that makes a retest
meaningful. The ITERATE verdict stands on the QA and engineering evidence, not on the KPI evidence,
until the freeze is recorded and the baseline re-established. **This is the single most consequential
finding in this document** — the app with the highest QA score (8.5/10, `proof/qa-eval-result.json`)
has the least valid measurement.

**What this app got right that the others did not:** the chainless prohibition proof. `[FACT]`
`contracts/negative/nft-chainless.json` enumerates forbidden terms with a
`known_false_positives` allowance; `tools/validate-contracts.mjs` runs the scan at every engineering
gate and passes with 9 checks, 0 warnings. When brand nonclaim copy ("skip the wallet", "no gas")
triggered the scanner, it was resolved through the allowlist rather than by rewording the brand or
loosening the scan (improvement log Entry 006 Finding B). `[INFERENCE]` This is the sprint's one
genuinely new proof type and the best argument for the framework in the whole comparison.

---

## 4. WEAVE contribution analysis

The honest question is: what changed because this work ran through WEAVE, rather than a competent
engineer building three Next.js storefronts?

### 4.1 What WEAVE demonstrably contributed `[FACT]` unless marked

| Contribution | Evidence | Would an engineer have done it unprompted? |
|---|---|---|
| **A frozen, reproducible measurement contract** | `contracts/cohort/seeds.json` (seed 42, `OWNER_GATE` to change), `contracts/kpi/formulas.json` (formulas + guardrails + verdict rules, frozen at ATM-416) | `[INFERENCE]` Rarely. Freezing the seed *before* seeing results, and gating changes to it, is a discipline that exists to stop the experimenter moving the goalposts. |
| **Prohibition contracts** | `contracts/negative/nft-chainless.json`, `public-safe-assets.json`, enforced at every engineering gate | `[INFERENCE]` Unlikely as a machine-checked artifact. "Don't add a wallet" is normally a code-review convention, not a gate. |
| **A uniform proof chain across three apps** | 26 eval-result artifacts + 5 cohort results + 3 seal manifests, same shape per app | `[INFERENCE]` No. This is the clearest framework contribution — a reviewer can open any app and find the same evidence in the same place. |
| **`impeccable` as a binding QA gate** | all three cleared ≥7/10 with 0 P0; 5 P1s and 2 P2s fixed *inside* QA rather than shipped | `[INFERENCE]` Sometimes, but not as a blocking threshold. Entry 001 documents what happened without it: 3.6/10 apps passing at 91–100% stage scores. |
| **Content-addressed seals** | per-file sha256 across 61/53/50 files (`proof/seal-manifest.json`) | `[INFERENCE]` No — a git tag is the usual substitute, and it does not detect a modified working tree. |

### 4.2 What WEAVE did not contribute

`[FACT]` **Every one of the five contrast defects across this sprint was found by the design
critique, not by the framework.** Build passed, tests passed, contracts validated — and
`--color-ink-faint` at 2.9:1 and `--ks-muted` at 3.94:1 both went through untouched. Contrast is
deterministic and scriptable; nothing in the lifecycle scripts it. (Entries 001, 004 Finding B,
005 Finding D, 006 Finding C.)

`[FACT]` **The framework provided no catalog, no pricing, no brand, no design system.** Those came
from per-app authorship recorded as interventions and from the UI sources under
`weave/docs/atm-415/ui/`. Three of the four numbers in every KPI row are downstream of a price
somebody chose by hand.

`[FACT]` **The measurement loop cannot see the product.** Four consecutive UI adaptations produced a
delta of exactly zero. The cohort's role is honestly limited to two things: confirming no guardrail
breach after a change, and providing a frozen baseline for comparison. It cannot rank a UI change,
and no amount of running it more times will change that.

`[FACT]` **The only non-self-attested component is inert outside its own repo.** OneReel's two
skipped engineering gates and one skipped qa gate are the fourth recorded occurrence of the
gate-portability wall (Entry 001 Change #1, Entry 003 Finding C, Entry 004 Finding D, and this
sprint). It remains open.

`[UNKNOWN]` **Whether WEAVE was cheaper, faster, or slower than an engineer.** No cost ledger exists
(§1.7). This document will not guess.

### 4.3 The honest summary

`[INFERENCE]` **WEAVE's contribution this sprint was evidentiary, not productive.** It did not make
the apps get built; it made the record of them auditable, uniform, and hard to fake — three sealed
proof chains a stranger can verify without talking to anyone who built them. That is a real and
underrated deliverable.

`[INFERENCE]` But the no-engineer claim is not yet supported. Two of the nine defects in §2 (D5, D8)
are missing infrastructure that an operator without engineering instincts could not have noticed;
three more (D1, D2, D9) are bookkeeping errors that a validator should have caught and there was no
validator to catch them. `[DECISION]` The correct claim as of this ticket is: **WEAVE produces
auditable evidence with an engineer in the loop.** ATM-422 will test the stronger claim; this
document does not make it in advance.

---

## 5. Risk comparison

`[UNKNOWN]` No legal review was performed on any app. This is a risk map, not a rights clearance.
Ranges are given because point estimates would be invented precision.

### 5.1 Rights and IP

| | OneReel | Marginalia | Vitrine |
|---|---|---|---|
| Content origin `[FACT]` | synthetic film titles, no licensing modelled | synthetic artwork | synthetic editions |
| Third-party rights modelled `[FACT]` | no | no | no |
| Public-safe scan `[FACT]` | clean | clean | clean |
| Real-launch exposure `[INFERENCE]` | **High** — a real catalog means film licensing, territory rights, takedown handling | **Medium** — artist agreements and royalty terms, well-trodden ground | **Medium** — artist licensing plus the resale question |

`[FACT]` `contracts/negative/public-safe-assets.json` fails the build on external URLs and real
brand names; `tools/validate-contracts.mjs` reports the scan clean for all three.
`[INFERENCE]` That control holds *committed* IP exposure at zero today. It says nothing about a real
catalog.

### 5.2 Platform dependency

`[FACT]` All three are `owner_gated_skipped` (or `not_started`) at `deployment`, with the recorded
reason `deployment_blocked_until_provider_access_validated`, and at `marketing` with
`no_real_channel_access`. No app has a hosting provider, payment processor, or channel.

`[INFERENCE]` **All three share one blocking dependency: a real payment processor.** None can leave
the synthetic envelope without it, and it is the same integration for all three. Marginalia carries
one extra: physical print-and-ship fulfilment, which is a vendor relationship, not an integration.

### 5.3 Regulatory

| | Exposure | Basis |
|---|---|---|
| OneReel | `[INFERENCE]` **Low–Medium** | Content platform obligations (takedown, moderation) scale with catalog size. Nothing incurred while synthetic. |
| Marginalia | `[INFERENCE]` **Medium** | Real physical goods → consumer protection, distance-selling, shipping and returns regulation. Well understood, not incurred. `[FACT]` The app's own analysis flags an undocumented domestic-only assumption (no country field in checkout). |
| Vitrine | `[INFERENCE]` **Medium–High at real launch, Low today** | Digital-collectible sales attract payment-processor policy scrutiny and, depending on framing, securities questions. |

`[FACT]` **Vitrine's chainless boundary is the mitigation, and it is real and verified.** Zero
wallet, chain, mint, token or RPC surface in any source file, dependency or config; production
dependencies are `next`/`react`/`react-dom` only; ownership is localStorage. Verified at every
engineering gate by `tools/validate-contracts.mjs` (`proof/qa-eval-result.json` assessment B, H5,
scored 4/4).

`[INFERENCE]` Chainlessness removes the custody, key-management and on-chain-asset surface entirely.
It does **not** remove payment-processor policy risk on collectible sales, and it does not remove the
need for a policy review before any spend. `[ASSUMPTION]` Vitrine's spec records this as risk R3 with
the nonclaim as mitigation — a documentation control, not a legal one.

### 5.4 Synthetic-vs-real demand gap

`[FACT]` Zero real users have seen any of these three apps. Every KPI derives from a 200-user PRNG
walk against a funnel table an author wrote.

`[INFERENCE]` The gap is **total, not narrow**. A useful sensitivity frame: if real conversion landed
anywhere in a plausible 0.5%–5% band for cold traffic to an unknown storefront, all three synthetic
figures (10.0%–13.5%) sit **2× to 27× above** it. That range is illustrative of the gap's size, not a
forecast — `[UNKNOWN]` nothing in this workspace supports a real conversion estimate for any of them.

`[INFERENCE]` Because the funnel table is the same shape across all three apps, the *relative*
ordering of their conversion rates is also uninformative. Vitrine converting lower than Marginalia
tells you about two hand-written probability tables, not about collectibles versus stickers.

---

## 6. Evidence-ranked WEAVE improvement backlog

Ranked by (recurrence count × impact on the no-engineer claim) ÷ effort. Effort is marked **spec**
(a document or schema change) or **code** (a script somebody has to write and test).

| # | Improvement | Evidence strength | Effort | Impact on no-engineer claim |
|---|---|---|---|---|
| **1** | **Lifecycle-state schema + fail-closed validator.** Define the stage-state vocabulary that `contracts/` does not contain, and validate against it. | **D5, D1, D2, D7, D9 — five defects, one root cause.** Three apps produced three incompatible state shapes in one workspace. | **code** (small) | **Highest.** Every one of those five defects is a thing an operator without engineering instincts would not spot. This is the difference between "the record is trustworthy" and "somebody has to read it carefully". |
| **2** | **Gate portability.** Ship the gate scripts with the skill and resolve every gate command relative to `--app-path`/`--root`. | **Four recurrences** — Entry 001 #1, Entry 003 Finding C, Entry 004 Finding D, and OneReel this sprint (2 of 5 engineering + 1 of 3 qa gates unexecuted). Open since 2026-07-21. | **code** (medium) | **Highest.** It is the skill's only non-self-attested component, and it is inert outside its own repo. An operator cannot fix this; they can only work around it, which is what happened. |
| **3** | **Programmatic contrast gate.** `node tools/check-contrast.mjs` over the app's token sheet, using canvas-based oklch→RGB (`getComputedStyle` returns oklch as-is). | **Five defects, five for five caught only by the design critique** — Entries 001, 004 B, 005 D, 006 C, plus Marginalia's still-deferred `text-ink-faint`. | **code** (small) | **High.** Contrast is fully deterministic. Leaving it to a subjective critique is the single largest avoidable gap between "gate" and "opinion". |
| **4** | **Emit a digest from the cohort runner.** Write a sha256 of the canonical event stream into `cohort-result.json`. | **D8**, plus D4 (OneReel's single run). Determinism is the foundation of every stage from kpi-setup onward and currently has no machine-checkable artifact. | **code** (trivial) | **High.** Turns "I compared two files by hand" into a one-line check. The identical-retest contract is unenforceable without it. |
| **5** | **Canonize prohibition contracts.** First-class `prohibition_contracts` in the plan stage; `negative_proof_bundle` (code/dep/config/runtime) as an engineering output type. | **One app, but a complete and clean success** — Vitrine's chainless proof, Entry 006 Finding A. Generalizes to medical advice, financial advice, PII, credentials, real payments. | **spec** | Medium. Doesn't fix a defect; adds the sprint's one genuinely new capability to the skill. |
| **6** | **State the cohort blind spot as a hard constraint, not a warning.** The cohort's role is (a) guardrail-checking after an adaptation and (b) frozen baseline capture. It cannot rank UI changes. | **Four consecutive cycles**, Entries 003/004/005/006. Robust enough to be a design constraint. | **spec** | Medium. Prevents an operator running experiments that cannot answer their question — a trap all three apps fell into this sprint. |
| **7** | **Cost ledger per stage.** Wall time, model, tokens, tool uses. | **`[UNKNOWN]` across all three apps** (§1.7). The improvement log's own Collection Protocol item 5 requires it; nothing recorded it. | **spec** | Medium. Without it, no claim about WEAVE's cost-effectiveness is checkable in either direction. |
| **8** | **Per-app funnel elasticity parameters** so a bounded change can legitimately move a KPI. | Proposed in Entries 003, 004 B, 005 B — three times. But: `[INFERENCE]` this manufactures precision from synthetic assumptions, which §5.4 and the ticket's own rigor rules argue against. | **code** (medium) | **Low, and contested.** Listed for completeness. A synthetic model that *appears* to measure UI quality is more dangerous than one that visibly cannot. Recommend not doing this. |
| **9** | **Critical-path reachability walker** — walk the declared user journey headlessly and require the app to complete it. | Entry 001 #2, deferred in Entry 002. No V5 app exhibited the defect it targets (all three golden paths verified live). | **code** (medium) | Low for now. Revisit if a future app ships an unreachable route. |

---

## 7. Best next investment

### `[DECISION]` Build the lifecycle-state schema and its fail-closed validator (backlog #1), and ship it inside the ATM-421 skill package so it is portable by construction (backlog #2).

**Why this and not the others.**

`[FACT]` **The causal evidence is `contracts/freeze-digests.json`.** That one file records
`nft-storefront.frozen_at_commit: null` alongside its own governance sentence stating that a baseline
run under a null freeze is invalid — and Vitrine ran two baselines anyway, sealed them, scored 8.5/10
at QA, and advanced through iteration and analysis to `sealed`. Nine stages verified. Nothing
stopped it. The contract that would have caught it was written, frozen, and never enforced by
anything.

`[INFERENCE]` That is the sprint's defining failure mode, and it is not specific to Vitrine. **Five
of the nine defects in §2 (D1, D2, D5, D7, D9) are the same failure**: a rule exists in `contracts/`
and no code reads it. Meanwhile the two domains that *do* have enforcement — commerce schemas via
`validate-contracts.mjs`, and design quality via the `impeccable` P0 blocker — produced zero defects
across three apps. `[FACT]` Every commerce contract validated clean at every gate; every app cleared
the QA threshold with zero P0.

`[INFERENCE]` The pattern is unambiguous: **in this workspace, enforced rules held and unenforced
rules drifted.** The lifecycle record is the largest body of unenforced rules remaining, and it is
the exact artifact ATM-422's fresh operator will have to produce and trust.

**Why it beats the closest alternative.** Backlog #2 (gate portability) has more recurrences — four
against five defects — and is the older open item. `[DECISION]` They are ranked together and
delivered together in ATM-421 rather than sequenced: the validator has to live in the skill package,
and the skill package lives in a different repo from the apps, so the validator cannot work at all
unless it resolves paths from `--root`. **Building #1 correctly forces #2 to be solved as a
precondition.** That is why one ticket can close both, and why neither is worth doing alone.

**What it does not fix.** `[INFERENCE]` A validator cannot detect a *wrong* proof, only a missing or
malformed one. It would not have caught any of the five contrast defects (that is backlog #3), and it
cannot make the synthetic cohort see a UI change (nothing can — backlog #6 is the honest response).
The claim here is narrow and checkable: it converts five recorded defects into build failures, and it
is the prerequisite for the ATM-422 operator having a record worth trusting.

---

## STATUS / PROOF / NEXT

**STATUS** — ATM-420 complete. One cross-app comparison document covering all seven required items:
normalized table (§1), three decisions (§3), WEAVE contribution analysis (§4), risk comparison (§5),
evidence-ranked backlog (§6), best next investment (§7), plus nine defects found in the sealed
evidence and reported without repair (§2). Every claim labeled; every number source-linked. Not
marked Done — the ATM-415 umbrella reserves that for controller verification.

**PROOF**
- This document: `weave/docs/atm-415/atm-420-cross-app-comparison.md`
- Sealed inputs: `apps/{video,sticker,nft}-storefront/proof/seal-manifest.json` +
  `lifecycle/lifecycle-state.json` + 26 eval-result artifacts + 5 cohort results
- Frozen contracts read, not modified: `contracts/kpi/formulas.json`,
  `contracts/cohort/seeds.json`, `contracts/freeze-digests.json`, `contracts/negative/*`
- Determinism re-verified during analysis by byte-comparison of the two-run pairs
  (Marginalia identical, Vitrine identical, OneReel single-run — **D4**)
- Improvement log entries 001–006 as recurrence evidence
- Deleted in this commit: `docs/atm-415/comparison/` (pre-wipe workspace; contradicted the sealed apps)

**NEXT** — ATM-421: package the lifecycle skill, implementing backlog #1 and #2 together as argued in
§7. Then ATM-422 (fresh-operator exam) and ATM-423 (closeout), where D1–D9 and backlog #3/#4 are the
natural insertion points.

**Not done, and why:** Linear was not consulted (OAuth unavailable in a non-interactive session), so
any scope change postdating `atm-420-todo.md` is not reflected here. D1–D9 were reported, not
repaired — the apps are sealed and their state files are inside the seal manifests. No cost figures
are given, in either direction; nothing recorded them.
