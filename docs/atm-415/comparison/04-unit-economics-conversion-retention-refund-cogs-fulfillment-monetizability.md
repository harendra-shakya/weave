# 04 — Conversion, retention, refund, COGS, fulfillment, monetizability

Baseline cohorts are identical in size and construction: **200 sessions, 1 session
per persona, seed `atm41X-baseline-v1`** (`contracts/cohort/seeds.json`). Numbers
from `apps/<app>/proof/**/kpi.json`; arithmetic shown.

## Side-by-side (baseline)
| Metric | video | sticker | nft |
|---|---|---|---|
| sessions | 200 | 200 | 200 |
| orders | 69 | 65 | 90 |
| **conversion** | 69/200 = **0.345** [F] | 65/200 = **0.325** [F] | 90/200 = **0.45** [F] |
| **retention** | **not modeled [U]** | **not modeled [U]** | **not modeled [U]** |
| refunds | 4 | 1 | 5 |
| **refund rate** | 4/69 = 0.058 [F] | 1/65 = 0.0154 [F] | 5/90 = 0.0556 [F] |
| fulfilled | 59 | 56 | 75 |
| **fulfillment success** | 59/69 = 0.855 [F] | 56/65 = 0.862 [F] | 75/90 = 0.833 [F] |
| cart_abandonment | n/a (no cart) | 1−100/118 = 0.153 [F] | n/a (addToCart=0) [F] |
| **gross revenue** | $1,415 [F] | $368 [F] | $7,714 [F] |
| **AOV** | 1415/69 = $20.51 [F] | 368/65 = $5.66 [F] | 7714/90 = $85.71 [F] |
| est. margin | not computed [U] | rev−111 = $257 [F] | rev−42.5 = $7,671.50 [F] |

## COGS models (synthetic spec assumptions — `contracts/specs/*`, analysis JSON)
| App | COGS structure | Fixed COGS in margin |
|---|---|---|
| video | per-stream access; encoding amortized; **no unit COGS** [A] | — (margin not modeled) |
| sticker | `cogs_per_unit 1.2 + packaging 0.35 + shipping 2.5 + refund_processing 1.0` [A] | $111 (implied: 368−257) [F] |
| nft | `platform_fee_per_sale 0.4 + storage_per_item 0.05` [A] | $42.5 (implied: 7714−7671.5) [F] |

- **[A]** All COGS values are synthetic per-app spec assumptions; no real COGS.
- **[I]** Sticker carries the heaviest COGS structure (physical-goods), nft the
  lightest (platform fee + storage) — which is why nft's margin is ~99.4% of
  revenue vs sticker's ~70%.

## Retention — explicit non-modeling
- **[U]** No app models retention. The cohort is `sessions_per_persona: 1` /
  `personas: 200`, so there is exactly one session per persona and no repeat-visit
  or repeat-purchase signal. Any retention figure would be invented.

## Monetizability
- **[F]** AOV, not conversion, drives revenue: nft ($85.71 × 90 = $7,714) produces
  **~21× sticker revenue** ($5.66 × 65 = $368) at a comparable order count and a
  higher conversion rate.
- **[I]** On the encoded synthetic unit-economics alone, nft is the most monetizable
  and sticker the least. This describes the **assumptions in the specs**, not real
  demand — see the nonclaim below.

## Nonclaim
- No claim of real demand, real purchase intent, or real-world monetizability is
  made from these synthetic cohorts. Conversion/refund/fulfillment are outputs of a
  fixed, price-blind funnel (see 07).
