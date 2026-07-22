# ATM-419 Todo: Strictly Chainless Synthetic NFT Storefront

App 3 of ATM-415. Models **collectible ownership** (NFT-style) with an **absolute local, synthetic, chainless boundary**. Must be distinct from ATM-417 (video) and ATM-418 (sticker). Due 2026-07-24.

> ⚠️ **This app's defining rule:** hitting any forbidden surface (wallet, chain, mint, token, etc.) is `OWNER_GATE` — you STOP and escalate. It is never a workaround opportunity. And you must *prove the absence* of every forbidden surface (negative proof), not just avoid adding it.

---

## Authority (read + keep in context — governs this issue)
- **ATM-415 umbrella** — deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only). See [atm-415-todo.md](atm-415-todo.md).
- **ATM-416 frozen contracts** — this app MUST conform to the frozen schemas/seeds/KPI in `weave-v5-apps/contracts/`. You may NOT change a frozen contract, seed, or KPI without a recorded `OWNER_GATE`.
- **Chainless negative contract** applies (`weave-v5-apps/contracts/negative/nft-chainless-contract.json`): the app must contain no wallet/mint/chain/custody/token surface, and `validate-contracts.mjs` chainless scan must pass.
- 🚩 **Known scanner collision:** the chainless scan is a naive substring match — it currently FALSE-POSITIVE-flags disclaimer text like "no custody" / "not on any chain," and it WILL flag the locked Vitrine copy ("Skip the wallet", "no wallet, no gas"). Resolve as a gate, not a workaround: fix the scanner (`ENGINEERING_REQUIRED`) or amend the frozen token list (`OWNER_GATE`) — do not silently reword the brand or bypass the scan.

## 0. George's cross-cutting directives (apply to everything below)
- [ ] **Operable, not a demo** — real usable UI + working (synthetic) chainless checkout, clickable end to end.
- [ ] **Daily log** — keep the improvement/progress log updated each working day.
- [ ] **Model split** — Fable 5 orchestrates planning/review; Sonnet 5 subagents execute. Record every delegation in the usage ledger.
- [ ] **Not a reskin** — distinct from video AND sticker apps (collectible-ownership mechanics, editions, provenance, local ownership fixture).
- [ ] Feed evidence into the [lifecycle skill improvement log](../weave-application-lifecycle-improvement-log.md).

## 1. Persona & Problem — DONE (brand locked)
- [x] Define distinct synthetic-collectible persona — anti-crypto collector who wants the "#7 of 50" edition/provenance/ownership feeling, NOT a speculator (see [atm-419-brand.md](atm-419-brand.md))
- [x] Problem is collecting-shaped — editions, provenance, "a shelf of what I own"; explicitly rejects wallet/gas/speculation
- [x] Brand direction locked: **Vitrine** / Collecting Without the Chain / Museum Label / Frustration Story ([atm-419-brand-ideation.md](atm-419-brand-ideation.md))
- [x] Distinctness vs OneReel AND Marginalia proven (brand doc carries the three-app not-a-reskin table)
- [ ] Link both docs from the app README as the persona + brand source
- [ ] **Baseline copy for the loop:** hero = "Own the edition. Skip the wallet." (deterministic seed copy — do not change before baseline run)

## 1b. Visual System (from brand)
- [ ] Apply Museum Label: gallery off-white base, **deep teal** accent (swap to oxblood if too cool), muted/never neon
- [ ] Refined serif for titles (museum-catalog feel), precise grotesque sans for labels/UI
- [ ] Wordmark: "Vitrine" with a glass-case / display-stand motif
- [ ] Each collectible framed like a hung work; museum-style caption blocks; edition # set like a catalogue entry
- [ ] **Brand-safety:** NO crypto/web3 look or language — no neon gradients, dark "vault" UI, "mint/token/chain/gas/floor/$"
- [ ] Use locked copy: "Add to collection" CTA, "Your Vitrine" owner view, edition mark "#7 of 50", empty-state lines from brand doc

## 2. Catalog & Content
- [ ] Source synthetic/public-safe collectible assets + metadata (no copyrighted/real art, no real NFT metadata)
- [ ] Build catalog of collectibles with **edition numbering** (e.g. #7 of 50) and **provenance** fields
- [ ] Rights manifest listing every asset and confirming public-safe/synthetic status

## 3. Storefront App
- [ ] Catalog listing page
- [ ] Collectible detail page (edition #, provenance, synthetic metadata)
- [ ] **Chainless checkout / order** (synthetic, no payment, no chain)
- [ ] **Local ownership fixture** — ownership recorded in a local file/store, never on any chain
- [ ] Owner view ("a shelf of what I own")
- [ ] Cancellation / refund flow
- [ ] Empty state (no results, empty collection)
- [ ] Invalid state (bad ID, invalid edition)
- [ ] Failure state (checkout failure, network error)

## 4. Absolute Boundary & Negative Proof (UNIQUE TO THIS APP — REQUIRED)
- [ ] Enumerate every forbidden surface: wallet, private key, seed, mint, smart contract, chain RPC/transaction, token, real payment, custody, marketplace listing, financial promotion, real NFT, credential
- [ ] **Negative CODE proof** — no code paths toward any forbidden surface (grep/audit evidence)
- [ ] **Negative DEPENDENCY proof** — no wallet/chain/crypto libraries in the dependency tree (lockfile audit)
- [ ] **Negative CONFIG proof** — no RPC endpoints, chain IDs, keys, or chain config anywhere
- [ ] **Negative RUNTIME proof** — no outbound chain/RPC calls at runtime (network-trace evidence)
- [ ] Document the `OWNER_GATE` escalation path: if any forbidden path is encountered, STOP and escalate (do not work around)
- [ ] **Synthetic-only nonclaims (LOCKED placement: footer + first-purchase notice)** — persistent one-line footer disclaimer on every page + one-time notice before first "Add to collection"; main UI stays immersive; every loop verdict output also carries the nonclaim. Copy in [atm-419-brand.md](atm-419-brand.md).

## 5. Tests & Build
- [ ] Focused tests covering main flows (incl. ownership-fixture correctness, edition uniqueness)
- [ ] Test that asserts the negative-proof invariants (no chain deps/config/calls)
- [ ] Reproducible `build` and `run` commands documented
- [ ] All tests passing locally

## 6. Product-Learning Loop
- [ ] Freeze KPI/cohort seeds (lock random seed)
- [ ] Run deterministic baseline — synthetic feedback/funnel/order/refund events
- [ ] Record baseline metrics digest (hash/snapshot)
- [ ] Feed events into WEAVE lifecycle skill
- [ ] WEAVE ranks bounded adaptations by evidence / impact / effort / risk
- [ ] Pick top-ranked adaptation and apply one bounded local change (candidate: provenance-clarity / edition-scarcity presentation on detail page — how prominently "#7 of 50" + provenance show; or "Add to collection" CTA framing)
- [ ] Rerun identical cohorts against changed app
- [ ] Compare KPI / guardrail and unit-economics results
- [ ] Issue verdict: GO / ITERATE / PIVOT / STOP — with **explicit synthetic-only nonclaims** (no real ownership/value/demand claims)
- [ ] Record source diff/commit identity for the applied change

## 7. Immutable Event Ledger
- [ ] Append-only log of all synthetic events (baseline + retest)
- [ ] Ledger must not be editable retroactively

## 8. Usage Ledger
- [ ] Log all model calls, cost, and delegation (Fable planning/review vs Sonnet execution)

## 9. Proof Package
- [ ] Baseline digest + retest digest (before/after comparison)
- [ ] KPI analysis
- [ ] Unit-economics analysis
- [ ] **IP analysis** (rights/ownership of synthetic assets)
- [ ] **Platform analysis** (what a real platform would require — and why we don't)
- [ ] **Regulatory analysis** (collectible/securities/financial-promotion considerations, why chainless avoids them)
- [ ] **Negative proof bundle** for every forbidden surface (code/runtime/config/dependency)
- [ ] Authorized source identity (diff/commit where authorized)
- [ ] Failures and recovery evidence
- [ ] Artifacts + checksums for all key files
- [ ] Cleanup — no temp files, secrets, or side effects

## 10. Closing Statement
- [ ] Write `STATUS / PROOF / NEXT`

---

## Absolute boundary (do NOT cross — `OWNER_GATE` on contact)
No wallet, private key, seed, mint, smart contract, chain RPC/transaction, token, real payment, custody, marketplace listing, financial promotion, real NFT, credential, push, PR, merge, deployment, or production action. Encountering any such path is `OWNER_GATE`, not a workaround. One bounded recovery per failure. Stop at missing adapter/schema/security invariant, owner gate, budget cap, or any chain-boundary ambiguity.
