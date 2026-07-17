# 05 — Rights/licensing, IP, platform, and regulatory risk

Risk **flags** derived from the specs and negative contracts. **[U]** No legal
review was performed — this is a risk map, not a rights clearance.

## Per-app
| App | Rights / IP | Platform | Regulatory |
|---|---|---|---|
| video | Synthetic titles; no real content licensing modeled [A] | Needs a real host + payment processor (owner-gated) [F] | Low as synthetic; a real catalog would raise content-licensing / takedown exposure [I] |
| sticker | Synthetic art; public-safe (real brand names fail a fail-closed scan list) [F] | Real print + ship + processor, all owner-gated [F] | Real physical goods → consumer/shipping regulation (not incurred; synthetic) [I] |
| nft | Synthetic pieces; **chainless** — no token/securities surface [F] | Payment-processor + app-store policy for digital collectibles flagged (backlog rank 3) [F] | Digital-collectible sales can draw payment-processor and possibly securities scrutiny in a real launch [I] |

## Cross-cutting controls (what holds real-IP exposure to zero today)
- **[F]** `contracts/negative/public-safe-asset-contract.json` — external URLs and
  real brand names fail the scan over the asset paths; the contract validator
  reports "public-safe asset scan clean".
- **[F]** `contracts/negative/nft-chainless-contract.json` — forbids wallet / mint /
  chain / rpc / web3 surface; nft dependencies are `next`/`react` only (lockfile
  clean). Caveat: the file-scan wording "0 tokens / 39 files" is **not reproducible**
  (finding F1) — the boundary is intact, but the scanner also flags the app's own
  negated "no custody" disclaimers; fixing that touches a **frozen** contract
  (owner-gate).

## Reading
- **[I]** The one app carrying materially higher **real-launch** platform/regulatory
  risk is nft (payment-processor + collectible policy) — the reason the next-
  investment backlog places an NFT policy review ahead of nft marketing spend (08).
- **[I]** sticker's real-launch risk is operational/consumer (shipping, returns);
  video's is content-licensing. Both are zero today because everything is synthetic.
- **[U]** None of these has been assessed by counsel; treat as engineering risk
  flags to route to a real review before any launch.
