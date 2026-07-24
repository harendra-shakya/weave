# Supported Envelope

`SKILL.md` describes a lifecycle written to be stack-neutral. This file records something
narrower and more useful: **where the skill has actually been proven, and what breaks inside
that boundary.**

Generic design is a claim about intent. An envelope is a claim about evidence. Only the second
is falsifiable, so only the second belongs in a seal.

**Established:** 2026-07-24, from ATM-415 (ATM-416 foundation, ATM-417/418/419 apps, ATM-420
cross-app comparison). Supersedes the pre-2026-07-24 envelope entirely — that workspace was
wiped and its numbers do not describe anything currently on disk.

---

## Validated envelope

**The local Next.js storefront family.**

An application that:

- is a Next.js 15 / TypeScript App Router web app run locally (`next dev` / `next build`);
- models catalog → cart/checkout → order → fulfilment → cancellation/refund;
- measures itself against a deterministic, seeded synthetic cohort, never real traffic;
- has no owner-gated surface in its critical path — no live deployment, no real payments,
  no real user data.

## What proves it

Three applications completed the lifecycle and sealed. All numbers below are on disk.

| App | Ticket | Seal | Evidence |
|---|---|---|---|
| video-storefront (OneReel) | ATM-417 | `164785a4`, 61 files | 12 routes, QA Nielsen 30/40 = 7.5/10, 0 P0; cohort seed 42 → CR 13.0%, AOV $5.72 |
| sticker-storefront (Marginalia) | ATM-418 | `86766633`, 53 files | 12 routes, QA Nielsen 29/40 = 7.25/10, 0 P0; cohort seed 42 → CR 13.5%, AOV $12.85; two reproducing runs |
| nft-storefront (Vitrine) | ATM-419 | `c4f17460`, 50 files | 8 routes, QA dual-agent 8.5/10, 0 P0; cohort seed 42 → CR 10.0%, AOV $30.35; two reproducing runs; chainless prohibition proof |

Apps repo: <https://github.com/harendra-shakya/weave-v5-apps>. Paths:
`apps/<app>/proof/seal-manifest.json` and `apps/<app>/lifecycle/lifecycle-state.json`.
Full cross-app analysis: `weave/docs/atm-415/atm-420-cross-app-comparison.md`.

All three ran: frozen baseline → one bounded adaptation → identical-seed retest → verdict.
**All three produced a delta of exactly zero.** See gap 3.

## Stage coverage

**9 of 11 stages proven. 2 gated and unexercised.**

`deployment` and `marketing` have never completed in any run, in any generation of this
workspace. The lifecycle reaches them, records the gate, and continues. That is by design —
but it means their behaviour is **unproven, not merely untested**. Do not describe this skill
as an 11-stage proven lifecycle.

## Outside the envelope

Outside this boundary the skill is **unproven, not broken.** The stages are domain-neutral and
there is no known reason they fail elsewhere — but "no known reason" is an assumption, and this
file does not upgrade assumptions.

Specifically unproven:

- any non-Next.js stack (CLI, mobile, API-only, data product, service);
- any app whose critical path crosses an owner gate — those stages have never run to completion;
- any app measured against real traffic. The iteration method assumes a rerunnable identical
  cohort. Real traffic is not rerunnable, so the retest contract does not transfer.

---

## Known gaps inside the envelope

Four disclosed gaps. An operator should meet these as expectations, not surprises.

### Gap 1 — The gate-portability wall *(open; four recurrences)*

**The skill's only non-self-attested component does not reliably execute.**

`weave-v5-apps/apps/video-storefront/proof/engineering-eval-result.json` records two of five
engineering hard gates as `"status": "windows-runner-incompatible"`, `"passed": "manual-verified"`
— `unit_tests_pass` uses bash `if [ -f ... ]`, `no_secret_leakage` uses `python3`. The same app's
`qa-eval-result.json` records `"runner_exit_code": 9009, "runner_error": "python3 not found on
Windows"` for `public_safe_scan_pass`.

So on that app **3 of 5 engineering gates and 2 of 3 qa gates executed**; the rest advanced on
operator judgement with the override disclosed. Recurrences: improvement log Entry 001 Change #1,
Entry 003 Finding C, Entry 004 Finding D, and ATM-417 in this sprint. Open since 2026-07-21.

**What this package does about it:** `tools/validate-lifecycle.mjs` is pure Node with no shell,
Python, or platform dependency, and resolves every path from `--root`. It is designed to run from
this repo against an app repo elsewhere — the exact cross-repo case that has failed every time.
That fixes the wall for *this* tool. The inherited Python/bash gates are **still not portable**;
an operator on Windows will still have to disclose an override for them.

### Gap 2 — The design-quality gap *(closed by a hard gate; keep it hard)*

The lifecycle grades whether behaviours exist and are proven. It has nothing of its own to say
about whether the result is any good. Before this seam was closed, apps passed every stage at
91–100% while an independent design review rated them 3.6/10 (improvement log Entry 001).

**The `qa` stage requires an `impeccable` critique result scoring ≥ 7/10 with zero P0 findings.**

This is a **hard gate, not a suggestion.** An app below 7/10, or with any P0 open, does not
advance — it returns to engineering. Across the three sealed apps the gate held: all three
cleared it, and 5 P1s plus 2 P2s were fixed *inside* QA rather than shipped.

The residual, now narrowed: **contrast used to be checked by human judgement only.** Five
deterministic contrast defects across this sprint were caught only by the critique — never by build,
tests, or contracts (Entries 001, 004 Finding B, 005 Finding D, 006 Finding C, plus one still
deferred in sticker-storefront at ~2.9:1). That class is now scriptable *and scripted*:
`tools/check-contrast.mjs` computes WCAG ratios over a token sheet (hex / RGB-channel / oklch, pure
Node) and fails closed below AA. It cross-checks against reality — it computes Vitrine's `--ks-muted`
at 4.92:1, the value that app sealed at. **What remains open:** it must be *run* against a declared
pairs manifest; it is not yet wired as an auto-blocking gate in the app repo, and it cannot see
contrast produced at runtime (gradients, images, overlaid text) — only declared token pairs.

### Gap 3 — The cohort blind spot *(four cycles; treat as a hard constraint)*

**The synthetic cohort cannot detect UI surface changes. This is structural, not a bug.**

`weave-v5-apps/tools/cohort-runner.mjs` walks a `mulberry32` PRNG against a per-app funnel
probability table. It has no representation of price, copy, layout, contrast, or any rendered
surface. Four consecutive bounded adaptations produced a delta of exactly zero:

| Cycle | Adaptation | Δ |
|---|---|---|
| Entry 003 | re-theme | 0.0 |
| Entry 004 (OneReel) | CTA framing | 0.0 |
| Entry 005 (Marginalia) | variant clarity | 0.0 |
| Entry 006 (Vitrine) | provenance clarity | 0.0 |

State it as a constraint, in these words:

> The synthetic cohort cannot be used to rank or validate UI adaptations. Its role is limited to
> (a) confirming no guardrail breach after an adaptation, and (b) providing a frozen KPI baseline
> for cross-app comparison. Ranking UI adaptations requires real user data.

**Do not "fix" this by adding elasticity parameters** that make the model appear to respond to
copy or layout. A synthetic model that visibly cannot measure UI quality is safer than one that
appears to and cannot. This is argued in `atm-420-cross-app-comparison.md` §6 item 8.

### Gap 4 — Prohibition contracts are new and not yet canonized

`weave-v5-apps/contracts/negative/nft-chainless.json` is the sprint's one genuinely new proof
type: a contract that proves the **absence** of a feature surface, enforced as a hard gate.
Nineteen forbidden terms, seven `known_false_positives`, scanned by
`tools/validate-contracts.mjs` at every engineering gate; Vitrine passed with 9 checks, 0 warnings.

This generalizes to any domain with hard-forbidden surfaces — medical advice, financial advice,
PII handling, credentials, real payments. **The lifecycle has no first-class concept for it yet.**
`SKILL.md` documents the pattern and the plan stage accepts a `prohibition_contracts` field, but
no gate requires one and no schema validates the negative proof bundle.

**Recorded resolution path for scanner false positives** (improvement log Entry 006 Finding B):
if the scanner flags your own brand's negation copy ("skip the wallet", "no gas"), resolve it via
`known_false_positives`. Do **not** reword the brand (that erodes the proof) and do **not** edit
the contract (frozen — `OWNER_GATE`).

---

## Defects observed in the sealed examples

Nine defects were found in the three sealed apps during ATM-420 and **reported without repair** —
the apps are sealed and each `lifecycle-state.json` is inside its own seal manifest, so editing one
invalidates the seal. They are listed here because they define what a new operator will hit.

| ID | Defect | Caught by `tools/validate-lifecycle.mjs`? |
|---|---|---|
| D1 | Vitrine's `frozen_at_commit` is `null` while two baseline runs exist — invalid per that file's own governance | **Yes** — error, confirmed against the sealed app |
| D2 | All three apps have `baseline_run_ref: null`; the freeze ledger was never linked to a run | **Yes** — error on all three, confirmed |
| D3 | Vitrine has no `INTERVENTION_LEDGER.md`; count is unrecorded, not zero | **Yes** — error, confirmed |
| D4 | OneReel sealed one cohort run, so determinism is unreproducible from its seal | Warning only — the record cannot say how many runs were intended |
| D5 | Lifecycle-state schema drift: three apps, three vocabularies | **Yes** — `schema/lifecycle-state.schema.json` is the vocabulary that did not exist |
| D6 | OneReel's proof cites `evals/lifecycle/*.yaml` from the wiped workspace | No — dangling contract refs are out of scope |
| D7 | Iteration verdicts contradict the frozen `verdict_rules` (GO on a zero delta) | **Yes** — error on sticker-storefront, confirmed |
| D8 | No digest is emitted by the cohort runner; determinism has no machine-checkable artifact | No — needs a change to `cohort-runner.mjs` in the apps repo |
| D9 | Vitrine's AC count contradicts itself between state and eval-result (11/12 vs 12/12) | No — cross-artifact reconciliation is out of scope |
| **D10** | **Nonclaim drift.** All three apps wrote their own paraphrase of the synthetic-only nonclaim, and **none of the three says the words "real demand"**. Found while running this validator (improvement log Entry 007). | **Yes** — error on all three; the literal is now required exactly |

`[Confirmed outcome]` **Running `tools/validate-lifecycle.mjs` against all three sealed apps does
not come back clean** — 2, 3 and 4 errors respectively, cross-repo from this package. That is the
intended result: the defects are real, the apps are sealed so they were reported rather than
repaired, and a validator that passed all three would not be failing closed. See `SKILL.md`
§Validation for the exact output.

## What this envelope does not claim

- It does not claim the apps are good products. It claims their evidence is auditable.
- It does not claim WEAVE is cheaper or faster than an engineer. **No cost ledger exists** for
  any of the three apps — not wall time, not tokens, not tool uses. That claim is currently
  unmeasurable in either direction.
- It does not claim the no-engineer path works end to end. That is ATM-422's question. What is
  proven today is: **WEAVE produces auditable evidence with an engineer in the loop.**
