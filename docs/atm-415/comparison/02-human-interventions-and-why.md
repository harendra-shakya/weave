# 02 — Human/engineering interventions and why they were necessary

Every point where a human or engineering judgment was required, with the reason
it could not be left to the framework. Sources: STATUS-2026-07-14/16 (weave repo)
and `docs/atm-420-cross-app-analysis.json` `human_interventions`.

## Interventions (which apps, and why)
| Intervention | Apps | Why it was necessary | Source |
|---|---|---|---|
| Re-bootstrap the apps *through* `weave cos-bootstrap` rather than beside it | all 3 | "Use WEAVE to build" requires the tool's own machinery; the first pass placed the apps beside it | STATUS-14 addendum, commit `f506032` [F] |
| `design-standards` + `impeccable` UI pass; replaced a thick side-tab border with background-tint | all 3 (shared tokens) | Day-1 engineering was functionally correct but visually generic — George's "functional not polished" bar; the border was a recognizable AI-UI tell | STATUS-16 [F] |
| Retry-budget correctness fix in `checkout.authorize()` (added `isRetryAttempt`, default false) | video (shared engine) | Live interaction found a bug the 100%-passing QA gate missed: the first decline reported the single bounded retry already spent, violating frozen `retry_rule` | STATUS-16 [F] |
| Per-app domain framing (video access · sticker packs/variants · chainless collectible) | each | The cohort/engine framework is generic; product meaning is per-domain judgment | analysis JSON [F] |
| Catalog design — items, prices, rarity tiers, art hues | each | Framework provides no catalog; pricing/tiering is a product decision | analysis JSON [F] |
| Per-app UI identity (green / raspberry / gold over one shared token sheet) | each | So three apps read as one family, not three unrelated demos | STATUS-16 [F] |
| Per-app KPI formula variant (sticker adds `cart_abandonment`; nft substitutes `ownershipAssigned`) | sticker, nft | Shared KPI module doesn't cover cart or ownership semantics | analysis JSON [F] |
| Engine-adapter wiring in the cohort-runner (ownership ⇆ fulfillment) | nft | nft is direct-purchase; `ownership.assignOwnership` plays the role `fulfillment.fulfill` plays elsewhere | `tools/cohort-runner.mjs` [F] |

## Reading
- **[I]** Interventions cluster in exactly the two areas WEAVE provides nothing
  for: **visual/UX craft** (limitation L1 — "design" appears once in the whole
  codebase, as a regex stage keyword) and **domain modeling**. The framework
  carried scaffolding, determinism, and gating; humans carried craft and meaning.
- **[F]** One intervention (the retry-budget fix) was a genuine correctness defect
  invisible to the automated gate — evidence that human review remains load-bearing
  for correctness, not just polish.
- **[I]** nft required the most engineering intervention (the ownership adapter),
  because its direct-purchase, chainless model diverges most from the shared
  fulfillment engine.
