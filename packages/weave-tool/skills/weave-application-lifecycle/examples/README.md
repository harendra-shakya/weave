# Three finalized examples

Three apps completed this lifecycle and sealed under ATM-415. They are **linked, not duplicated** —
the artifacts live in the apps repo and are the authority. Each illustrates something different.

Root: `P:\Development\Projects\weave-v5-apps\apps\`
Cross-app analysis: `weave/docs/atm-415/atm-420-cross-app-comparison.md`

| App | Ticket | Seal | Illustrates |
|---|---|---|---|
| [video-storefront](../../../../../weave-v5-apps/apps/video-storefront) | ATM-417 | `164785a4`, 61 files | the gate-portability wall, in the record |
| [sticker-storefront](../../../../../weave-v5-apps/apps/sticker-storefront) | ATM-418 | `86766633`, 53 files | dual-agent QA, and a verdict rule not applied |
| [nft-storefront](../../../../../weave-v5-apps/apps/nft-storefront) | ATM-419 | `c4f17460`, 50 files | the prohibition contract as a lifecycle gate |

---

## OneReel — `video-storefront` (ATM-417)

An indie-film patronage storefront: 12 routes, Archival Warmth design system, single-item
checkout, refund flow. QA scored Nielsen 30/40 (7.5/10) with zero P0; synthetic cohort at seed 42
returned 13.0% conversion and $5.72 AOV.

**Read this one for what a portability failure looks like when it is recorded honestly rather than
papered over.** `proof/engineering-eval-result.json` marks two of five hard gates
`"status": "windows-runner-incompatible"`, `"passed": "manual-verified"`, and
`proof/qa-eval-result.json` records `"runner_exit_code": 9009, "runner_error": "python3 not found
on Windows"`. Three of five engineering gates and two of three qa gates actually executed; the rest
advanced on operator judgement with the override disclosed. That disclosure is the right behaviour
and it is also the clearest statement of the gap: the lifecycle's only non-self-attested component
does not run everywhere. It is also the weakest of the three proof chains — two P1s left unfixed, a
degraded QA assessment, one cohort run instead of two, and proof artifacts citing eval contracts
from a workspace that no longer exists.

## Marginalia — `sticker-storefront` (ATM-418)

A sticker marketplace: 12 routes, Vinyl Pop design system, variant cart (size × finish × sheet
count), a fulfilment state machine (ordered → packed → shipped → delivered) that correctly blocks
cancellation after shipping, and an artist upload + curator review queue. Cohort at seed 42: 13.5%
conversion, $12.85 AOV, 7.41% refund. **Two cohort runs that reproduce byte for byte** — the
determinism proof done properly.

**Read this one for the QA stage working as intended.** The dual-agent critique ran both
assessments as parallel sub-agents; Assessment B's browser accessibility-tree pass surfaced five
issues — a heading-level skip, a doubled `role="status"`, missing `aria-invalid`, eight
simultaneous `role="alert"` regions, an unlabelled remove button — that no build, test, or contract
check would ever have found. Three of four P1s and both P2s were fixed *inside* QA rather than
shipped.

**Also read it for the counter-example.** Its iteration recorded verdict **GO** on a delta of
exactly zero, which `contracts/kpi/formulas.json` `verdict_rules` do not permit — GO requires the
retest to beat the baseline. A frozen rule that nothing enforces gets applied inconsistently. The
validator in this package now rejects it.

## Vitrine — `nft-storefront` (ATM-419)

A chainless collectible storefront: 8 routes, Keepsake design system, six numbered editions,
localStorage-only ownership. Highest QA score of the three — dual-agent 8.5/10, zero P0, one P1
(muted text at 3.94:1) fixed to 4.92:1 before seal.

**Read this one for the prohibition contract**, the sprint's one genuinely new proof type.
`contracts/negative/nft-chainless.json` enumerates 19 forbidden terms and 7 known false positives;
`tools/validate-contracts.mjs` scans at every engineering gate. Zero wallet, chain, mint, token or
RPC surface in any source file, dependency, or config — production dependencies are `next`,
`react`, `react-dom` and nothing else. When the scanner flagged the brand's own negation copy
("skip the wallet", "no gas"), it was resolved through `known_false_positives` rather than by
rewording the brand or loosening the scan. That resolution path is now documented in `SKILL.md`.

**And read it for the cautionary half.** The app with the best QA score has the least valid
measurement: `contracts/freeze-digests.json` records its `frozen_at_commit` as `null` while two
baseline cohort runs exist, which that file's own governance calls invalid. It also sealed with no
`INTERVENTION_LEDGER.md`, so its intervention count is unrecorded rather than verified-zero. Both
were caught only afterwards, during ATM-420 — which is precisely why the validator now checks them.

---

## Running the validator against them

```bash
node ../tools/validate-lifecycle.mjs --root <path-to-weave-v5-apps> --app nft-storefront
```

**They do not come back clean** — 2, 3 and 4 errors respectively. That is the intended result. The
defects are real and documented in `atm-420-cross-app-comparison.md` §2; the apps are sealed, so
they were reported rather than repaired; and a validator that passed all three would not be failing
closed. Use them as the reference for what the checks actually catch.
