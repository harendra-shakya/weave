# 03 — Time, model/tool/token/resource cost and proof completeness

## Usage ledger (what was actually recorded)
Source: the "Model/tool/usage ledger" section of each STATUS file (weave repo).

| Day | Actor | Model | Tokens | Tool uses | Time | Source |
|---|---|---|---|---|---|---|
| 1 | Orchestrator | Fable 5 | not itemized [U] | — | "this session" | STATUS-14 |
| 1 | Execution agent | Sonnet 5 | **143,328** [F] | 62 | ~16 min | STATUS-14 |
| 1 | Execution agent 2 | Sonnet 5 | **207,714** [F] | 91 | ~13 min | STATUS-14 |
| 2 | Session (video full loop) | Sonnet 5 | not itemized [U] | — | single session | STATUS-16 |
| 3 | Session (nft + analysis + skill) | Sonnet (trailer: 4.6) | not itemized [U] | — | not recorded | commit `9951626` |

- **[F]** Only Day 1 has itemized counts — **351,042 tokens / 153 tool uses / ~29 min**
  across two Sonnet 5 agents, for the contract package + 3-app intent pass.
- **[U]** Days 2 and 3 record model and role but **not** token/tool/time — a real
  proof-completeness gap; the total sprint token cost cannot be stated.
- **[F]** Day-3's build commit `9951626` carries a `Co-Authored-By: Claude Sonnet 4.6`
  trailer; the sprint directive specifies Sonnet 5 (review deviation #2).

## Proof completeness (per app, re-verified 2026-07-17)
| Proof | video | sticker | nft |
|---|---|---|---|
| Test suite | 24/24 [F] | 38/38 [F] | 32/32 [F] |
| Determinism digest reproduced ×2 | `e5ad0a24…` [F] | `cfe71a9a…` [F] | `2bcca125…` [F] |
| KPIs recompute from ledger | yes [F] | yes [F] | yes [F] |
| `next build` | clean [F] | clean [F] | clean [F] |
| Seal manifest self-verifies | (n/a here) | **45/45** after reseal [F] (was 41/42, finding F2) | **39/39** [F] |

- Full apps suite: **122/122** (24+38+32 app + 28 contract) [F].
- **[F]** Two proof defects found & handled: the chainless "0 tokens / 39 files"
  claim was not reproducible (finding F1 — boundary intact, scanner too blunt);
  the early sticker seal was stale three ways (finding F2 — hash drift + 3 omitted
  files + tool self-listing; fixed and re-sealed).

## Resource cost is dominated by WEAVE overhead, not the apps
- **[F]** A single app at Intent (nothing built yet) is ~253KB / ~65K tokens, with
  all 11 stage contracts loaded upfront and 3 confirmed byte-identical duplicate
  writes (limitations L8/L9). This overhead is per-app and front-loaded.
- **[I]** So the marginal token cost of *building* an app is smaller than the fixed
  cost WEAVE imposes just to stand one up — the biggest cost lever is L8/L9, not the app code.
