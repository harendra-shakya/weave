# 07 — Before/after KPI results and guardrails (identical cohorts)

Each app applied exactly **one bounded adaptation** (a price change), then re-ran
the **identical** baseline seed. Numbers from `apps/<app>/proof/**/kpi.json` and
`proof/adaptation/adaptation-report.json`.

## Before → after
| App | Adaptation | AOV | Gross revenue | Est. margin | Lift |
|---|---|---|---|---|---|
| video | mid-tier price +~10% | 20.51 → 22.54 [F] | 1415 → 1555.5 [F] | — | +$140.5 / **+9.93%** [F] |
| sticker | pack price +10% (3 packs) | 5.66 → 5.97 [F] | 368 → 388.3 [F] | 257 → 277.3 [F] | +$20.3 / **+5.51%** [F] |
| nft | rare tier +10% (col-005/006/007) | 85.71 → 87.30 [F] | 7714 → 7857 [F] | 7671.5 → 7814.5 [F] | +$143 / **+1.85%** [F] |

Arithmetic checks: sticker +$20.3 = 65 pack-inclusive orders' price delta; nft
+$143 = 26 rare-tier orders × +$5.50; video +$140.5 / 1415 = 9.93%. All reproduce.

## What did NOT move (and why)
| KPI | video | sticker | nft | Reason |
|---|---|---|---|---|
| conversion | 0.345 → 0.345 | 0.325 → 0.325 | 0.45 → 0.45 | price not in event stream [F] |
| refund rate | unchanged | unchanged | unchanged | same [F] |
| fulfillment | unchanged | unchanged | unchanged | same [F] |
| cart_abandonment | n/a | 0.153 → 0.153 | n/a | same [F] |

- **[F]** Determinism: each app's baseline and retest ledger digests are
  **byte-identical** (`e5ad0a24…` / `cfe71a9a…` / `2bcca125…`), reproduced twice
  this review — because price is read at KPI-computation time, not recorded in the
  event stream. Only aov/gross/margin can move.

## Guardrails
- **[F]** All four guardrails held in every app: no conversion regression, no refund
  increase, no fulfillment regression, no frozen-contract/cross-app surface touched
  (each adaptation was a single catalog-fixture edit; `catalog.json` is absent from
  `contracts/freeze-digests.json`).

## Decisions
| App | Decision | Basis |
|---|---|---|
| video | **ITERATE** | aov/gross +9.93%, guardrails held; conversion/fulfillment structurally unreachable this cycle |
| sticker | **ITERATE** | gross +5.51%, margin +7.9%, guardrails held; cart-abandonment ceiling is structural |
| nft | **ITERATE** | +$143 gross/margin at highest AOV, guardrails held; rare/ultra-rare tier headroom |

- **[I]** All three show price inelasticity to a 5–10% subset increase — **but that
  is a structural consequence of the price-blind cohort, not evidence of real price
  inelasticity.** Nonclaim: do not read it as demand.
