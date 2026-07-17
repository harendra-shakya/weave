# ATM-420 — Cross-App Comparison Set

Per-topic evidence set expanding `docs/atm-420-cross-app-analysis.json` (numbers
source) and `docs/atm-420-required-comparison.md` (one-page summary) into one
document per item George asked for in ATM-420's "Required comparison".

All three apps compared side by side: **video-storefront** (ATM-417),
**sticker-storefront** (ATM-418), **nft-storefront** (ATM-419). Every number
recomputes from committed ledgers/KPIs (re-verified 2026-07-17). Synthetic and
local only — **no claim of real demand** is made anywhere in this set.

## Label legend
- **[F]** fact — traces to a named file or command output
- **[I]** inference — reasoning from facts
- **[A]** assumption — a synthetic spec value, not measured reality
- **[U]** unknown — not measured / not modeled (never guessed)

## Index
| File | Item |
|---|---|
| [01](01-lifecycle-executed-vs-documented.md) | Which lifecycle steps WEAVE executed vs only documented |
| [02](02-human-interventions-and-why.md) | Human/engineering interventions and why they were necessary |
| [03](03-cost-time-token-resource-and-proof-completeness.md) | Time, model/tool/token/resource cost and proof completeness |
| [04](04-unit-economics-conversion-retention-refund-cogs-fulfillment-monetizability.md) | Conversion, retention, refund, COGS, fulfillment, monetizability |
| [05](05-rights-ip-platform-regulatory-risk.md) | Rights/licensing, IP, platform, regulatory risk |
| [06](06-failures-recovery-friction-reusable-primitives.md) | Failures, recovery, repeated friction, reusable primitives |
| [07](07-before-after-kpi-and-guardrails.md) | Before/after KPI results and guardrails from identical cohorts |
| [08](08-weave-improvements-and-best-next-investment.md) | Evidence-ranked WEAVE improvements + best next investment |

## The three decisions (GO / ITERATE / PIVOT / STOP)
| App | Decision | Basis (detail in 07) |
|---|---|---|
| video | **ITERATE** | +9.93% aov/gross on a bounded change, guardrails held; conversion/fulfillment structurally unreachable this cycle |
| sticker | **ITERATE** | +5.51% gross, +7.9% margin, guardrails held; cart ceiling is structural |
| nft | **ITERATE** | +$143 gross/margin at highest AOV, guardrails held; tier elasticity headroom |

None GO (no real-demand evidence exists), none STOP (all improved a reachable
metric with no regression), none PIVOT (domain models sound; the ceiling is the
shared price-blind cohort, not any app).

## Honest gaps (labelled [U] throughout, not filled)
- **Retention** — not modeled; the cohort runs 1 session per persona.
- **Days 2–3 token/tool/time** — not itemized; only Day 1 has counts.
- **Rights/regulatory** — risk flags from specs/contracts only; no legal review.
- **Chainless "0 tokens / 39 files"** — not reproducible (finding F1); the boundary
  is intact but the shipped scanner is too blunt. See
  `weave/docs/plans/atm-415-evidence/REVIEW-2026-07-17.md`.

## Would this survive George recomputing every number?
Yes — every KPI, lift, determinism digest, and seal count here reproduces from the
committed ledgers; the only non-reproducible original claim (F1) is flagged, not repeated.
