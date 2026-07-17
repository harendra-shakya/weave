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

Three applications completed the full lifecycle inside this envelope and sealed:

| App | Ticket | Evidence |
|-----|--------|----------|
| video-storefront | ATM-417 | 24 tests, 45-file seal, adaptation +9.93% aov, digest stable across 4 runs |
| sticker-storefront | ATM-418 | 38 tests, 45-file seal, synthetic COGS/packaging/shipping model |
| nft-storefront | ATM-419 | 32 tests, 39-file seal, chainless boundary (no wallet/key/mint/RPC surface) |

Each ran: frozen baseline → diagnosis → one bounded adaptation → identical-seed
retest → GO/ITERATE/PIVOT/STOP. All three returned ITERATE.

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

- **No UI/UX logic.** The lifecycle grades whether behaviors exist and are
  proven. It has nothing to say about whether the result is well-designed. The
  `qa` stage's registry entries (`impeccable`, `accessibility-audit`) are the seam
  where that judgment is meant to come from, and they are suggestions, not gates.
- **9 of 11 stages are self-attested.** Only `engineering` and `qa` have hard
  gates that execute anything. The rest score a review document against a rubric,
  which means a confident wrong answer scores as well as a right one. The runner's
  `checkProofIntegrity` catches missing proof, not wrong proof.
- **Owner-gated stages have never completed.** `deployment` and `marketing` are
  always `owner_gated_not_pursued` in every sealed example.

## Status

This envelope is the boundary as of 2026-07-17, established by ATM-416–ATM-421.
ATM-422 tests whether a context-free operator can work inside it using only this
skill. Whatever that operator hits — including the limitations above — is the
finding, and the envelope should be amended to match what it learns.
