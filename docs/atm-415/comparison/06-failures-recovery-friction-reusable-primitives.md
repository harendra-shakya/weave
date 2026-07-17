# 06 — Failures, recovery, repeated friction, reusable primitives

## Failures & recovery (all within the one-bounded-retry rule; no owner gate)
Source: STATUS-2026-07-14/16 "Failures/recovery".
| # | Incident | App/scope | Recovery | Source |
|---|---|---|---|---|
| 1 | Windows `node --test` directory-arg quirk | tooling | test script switched to glob form | STATUS-14 [F] |
| 2 | Chain-boundary wording ambiguity ("payment token" → "payment authorization") | collectible spec | reworded before freeze | STATUS-14 [F] |
| 3 | Chainless gate flagged the execution agent's own draft for quoting forbidden vocabulary | nft evidence | referenced the contract without repeating its token list | STATUS-14 [F] |
| 4 | Browser `computer`/screenshot tool unresponsive full session | tooling | worked around with `read_page`/`get_page_text`/`javascript_tool` (real server actions) | STATUS-16 [F] |
| 5 | Retry-budget correctness bug (first decline reported retry spent) | video engine | one root-cause fix cycle + tests, re-verified live | STATUS-16 [F] |

- **[I]** 3 of 5 incidents were tooling/environment (Windows, browser pane, scanner
  self-flag), not app defects. Only #5 was a real product bug.

## Repeated friction (recurs across all three apps)
- **[F]** The cohort funnel's branch probabilities are hardcoded, price/state-blind
  constants (`packages/commerce-core/cohort.mjs`). So `conversion`, `refund`,
  `fulfillment`, and `cart_abandonment` are **structurally invariant** to any single-
  app bounded change — the same ceiling hit in **every** adaptation cycle (video,
  sticker, nft).
- **Root fix (recorded, not done):** per-app elasticity parameters in
  `commerce-core/cohort.mjs`, read from each app's frozen spec, so a bounded change
  can legitimately move those KPIs. [F] (recorded in all 3 adaptation reports)

## Reusable primitives / adapters / templates
Source: repo inventory (`packages/commerce-core/`, `tools/`).
| Primitive | What it is | Reused by |
|---|---|---|
| `commerce-core/cohort.mjs` | seeded deterministic funnel generator | all 3 |
| `commerce-core/ledger.mjs` | JSONL event ledger | all 3 |
| `commerce-core/digest.mjs` | SHA-256 digest + `buildManifest` seal | all 3 |
| `commerce-core/prng.mjs` | seeded PRNG (mulberry32) | all 3 |
| `commerce-core/validate.mjs` | schema validation | all 3 |
| `commerce-core/design-tokens.css` | one shared design system | all 3 |
| `tools/cohort-runner.mjs` | drives cohorts through each app's real engine | all 3 |
| `tools/seal-app.mjs` | one-shot seal manifest | all 3 |
| `tools/validate-contracts.mjs` | schema + negative-scan + freeze verify | all 3 |
| ownership⇆fulfillment engine adapter | bridges direct-purchase semantics | nft |
| frozen-contract + seal-manifest pattern | tamper-evident lineage | all 3 |
| 11-stage lifecycle surface template | intent→analysis scaffold | all 3 |

- **[I]** The reusable surface is broad and genuinely shared (one determinism/ledger/
  seal core across three domains); the only per-app adapter needed was the nft
  ownership bridge — evidence the framework generalizes across commerce models.
