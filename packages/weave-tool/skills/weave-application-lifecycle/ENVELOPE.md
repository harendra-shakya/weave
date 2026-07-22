# Supported Envelope

`SKILL.md` describes a lifecycle that is deliberately generic — it assumes no
stack, commerce model, or deployment target. This file records something
different and narrower: **where the skill has actually been proven.**

The distinction matters. Generic *design* is a claim about intent. An envelope is
a claim about evidence. Only the second one is falsifiable, so only the second one
belongs in a seal.

## Validated envelope

**The local Next.js storefront family.**

Concretely, an application that:

- is a Next.js/TypeScript web app run locally (`next dev` / `next build`);
- models a catalog → cart → checkout → order → refund flow;
- measures itself against a deterministic, seeded synthetic cohort rather than
  real traffic;
- has no owner-gated surface in its critical path (no live deployment, no real
  payments, no real user data).

## What proves it

Four applications completed the full lifecycle inside this envelope and sealed:

| App | Ticket | Evidence |
|-----|--------|----------|
| video-storefront | ATM-417 | 24 tests, 45-file seal, adaptation +9.93% aov, digest stable across 4 runs |
| sticker-storefront | ATM-418 | 38 tests, 45-file seal, synthetic COGS/packaging/shipping model |
| nft-storefront | ATM-419 | 32 tests, 39-file seal, chainless boundary (no wallet/key/mint/RPC surface) |
| poster-storefront | ATM-415 | fresh-operator path; 5 of 6 hard gates ran on operator judgement (gate-portability wall) |

The first three ran: frozen baseline → diagnosis → one bounded adaptation →
identical-seed retest → GO/ITERATE/PIVOT/STOP. All three returned ITERATE.
poster-storefront is the evidence for the gate-portability failure documented in
the improvement log (Entry 001).

## Stage coverage

**9 of 11 stages are proven. 2 are gated and unexercised.**

`deployment` and `marketing` have never completed in any sealed example.
The process reaches them, records `owner_gated_not_pursued`, and continues.
This is not a defect — they are owner-gated by design — but it means the
lifecycle's behavior at those stages is unproven, not just untested.

## Outside the envelope

Outside this boundary the skill is **unproven, not broken.** The stages are
domain-neutral and there is no known reason they fail elsewhere — but "no known
reason" is an assumption, not evidence, and this file does not upgrade it.

Specifically unproven:

- any non-Next.js stack (CLI, mobile, API-only, data product);
- any app whose critical path crosses an owner gate (`deployment`, `marketing`) —
  those stages have never been executed to completion, only gated;
- any app measured against real traffic instead of a synthetic cohort. The
  iteration stage's whole method assumes a rerunnable identical cohort. Real
  traffic is not rerunnable, so the retest contract does not transfer.

## Known limitations inside the envelope

Recorded so a new operator meets them as expectations rather than surprises:

- **No UI/UX logic (partially addressed).** The lifecycle grades whether behaviors
  exist and are proven. The `qa` stage now requires an `impeccable` critique result
  (≥7/10, zero P0 findings) as a scored artifact with a minimum — see qa.yaml.
  Before that change, all four V5 apps passed qa while a 3.6/10 independent design
  review found invisible buy buttons, absent media players, and unstyled component
  families. The seam exists; the change closes it from suggestion to gate.
- **9 of 11 stages are self-attested.** Only `engineering` and `qa` have hard
  gates that execute anything. The rest score a review document against a rubric,
  which means a confident wrong answer scores as well as a right one. The runner's
  `checkProofIntegrity` catches missing proof, not wrong proof.
- **Hard gates do not execute outside the weave-tool repo without --app-path.**
  `scripts/check_no_secrets.py`, `scripts/public_safe_repo_scan.py`, and `bin/weave`
  exist only in the weave-tool repo. On poster-storefront (fresh-operator path),
  5 of 6 hard gates ran on operator judgement, not execution. The skill's only
  non-self-attested component is inert outside its own repository. This is a
  packaging bug; fixing it is Change #1 in the improvement log.
- **Owner-gated stages have never completed.** `deployment` and `marketing` are
  always `owner_gated_not_pursued` in every sealed example.

## Status

This envelope is the boundary as of 2026-07-21, established by ATM-415–ATM-421.
ATM-422 tested a context-free operator. That operator hit the gate-portability wall
(5 of 6 hard gates ran on judgement, not execution) and the design-quality gap
(four apps completed lifecycle at 91–100% stage scores; independent review rated
the same apps 3.6/10). Both findings are recorded in
`docs/weave-application-lifecycle-improvement-log.md` (Entry 001) and partially
addressed in this cycle (qa.yaml: impeccable now required; engineering.yaml: UX
rubric now names contrast and journey-completability; plan.yaml: proof_date gate).
The gate-portability fix (Change #1 in the log) remains open.
