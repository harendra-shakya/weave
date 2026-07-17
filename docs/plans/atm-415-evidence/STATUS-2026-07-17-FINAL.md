# ATM-415 Final Status — 2026-07-17 (ATM-422 + ATM-423)

**Supersedes `STATUS-2026-07-17.md`**, which is left unedited as a dated record.
That file declared "SPRINT COMPLETE" before the review and before ATM-422/423 ran.
Several of its claims are now known false; §Corrections lists each one.

## STATUS: ATM-422 and ATM-423 complete. Sprint ready for controller review.

The headline is not the one the earlier status expected:

> **The fourth app is real. The claim it was built to test is not.**
> A context-free operator completed a full lifecycle — and could only do it by
> writing its own PRNG and overruling a gate that said `blocked`. In its own
> words: *"without that override, this run does not reach closeout."*

And the finding that outranks it:

> **WEAVE's only two executing gates do not verify the app.** One passes vacuously
> on zero discovered tests (F9); the other cannot scan what it is pointed at (F10).
> For all four apps, "verified" reduces to self-attestation.

Neither is a reason to discard the sprint. Both are the sprint working: this is
what an evidence harness is *for*, and it caught its own failures.

---

## PROOF — everything below was re-run in this session

| Check | Result |
|---|---|
| Package validator | exit 0 — 12 skills, 11 primitives, 12 eval contracts |
| Secret scan | exit 0 |
| Public-safe scan | ok |
| `git diff --check` | clean, both roots |
| Skill test suite | **30/30** (was 21) — mutation-verified |
| Apps test suite | **150/150** (video 24, sticker 38, nft 32, contracts 28, poster 28) |
| Unit tests (weave) | 76/80 — 4 Windows-only, one verified root cause |
| Determinism digests | **4/4 reproduce byte-for-byte** |
| Seal manifests | **163/163 files, zero drift** |

### Determinism — reproduced live from frozen seeds

| App | Seed | Digest | vs committed |
|---|---|---|---|
| video | `atm417-baseline-v1` | `e5ad0a24a8411e05…` | MATCH |
| sticker | `atm418-baseline-v1` | `cfe71a9ae5d7c880…` | MATCH |
| nft | `atm419-baseline-v1` | `2bcca125a2d7eb5b…` | MATCH |
| poster | `42` | `0675bbe0eee1b128…` | MATCH (both runs) |

This is the sprint's most solid result and it is worth saying plainly: **the
determinism thesis holds.** Identical seed, identical digest, every time, across
four independent apps and two authors.

### Seals

| App | Ticket | Files | Drift |
|---|---|---|---|
| video | ATM-417 | 45/45 | 0 |
| sticker | ATM-418 | 45/45 | 0 |
| nft | ATM-419 | 39/39 | 0 |
| poster | ATM-422 | 34/34 | 0 |

---

## Corrections to `STATUS-2026-07-17.md`

Each was a claim that did not survive re-execution.

| Claim | Reality |
|---|---|
| "Chainless boundary holds (**0 forbidden tokens**)" and "0 forbidden tokens across 39 NFT files" | **False as worded (F1).** The scan yields 6 failures on a clean checkout; the scanner cannot tell a token's *mention* from its *use*. The boundary itself is real (deps: next/react/react-dom only). Fixing requires editing a frozen contract → **OWNER_GATE**, recorded not worked around. |
| "sticker: **90/90** tests" | 38. |
| "sticker seal: **42 files**" | 45 — the manifest was stale and omitted 3 proof files (F2). |
| "negative.test.mjs — **9/9**" | 30/30 now. At the time the skill was also unregistered, so the package validator exited 1 (F3). |
| "nft retest digest **identical** to baseline" | True, and it is a **weakness, not a strength**: price is not in the event stream, so the retest re-ran an unchanged ledger. The fourth app's adaptation (retry budget) *does* change the stream, and its digests correctly differ. |
| "ATM-421 COMPLETE" | Four acceptance criteria failed on re-run: 421.5, 421.6, 421.7, 421.8 (see matrix). |
| "ATM-422 / ATM-423 out of this sprint's scope" | Both complete. They were the sprint's thesis. |
| "SPRINT COMPLETE" | Premature by six findings. |

---

## Cleanup proof

Disposable runtime residue in `weave-v5-apps`, both gitignored and regenerable:

**Before:** `node_modules` 357M; `.next` × 4 = 298M (nft 69M, poster 77M, sticker 77M, video 75M). **Total ≈ 655M.**

Verified disposable before deleting:
- `git check-ignore -v` → `.gitignore:1:node_modules/`, `.gitignore:5:.next/`
- `git ls-files | grep -cE "node_modules|\.next/"` → **0** tracked files inside

**After** `rm -rf node_modules apps/*/.next`:
- `.next` directories remaining: **0**
- `node_modules`: `No such file or directory`
- `git status --short`: only untracked `.claude/` — **nothing tracked was removed**

Regenerate with `npm install`.

---

## Linear reconciliation — for Harendra to apply

The Linear MCP server is **not authenticated in this session**, so I could not set
the label or post comments. Prepared text follows. **Nothing was moved to Done —
that is controller-only.**

### Label to set on ATM-415
```
READY_FOR_CONTROLLER_REVIEW_WEAVE_THREE_APPLICATIONS_V5
```

### Comment to post on ATM-415

> **V5 sprint ready for controller review.** Full acceptance matrix:
> `docs/plans/atm-415-evidence/ACCEPTANCE-MATRIX-2026-07-17.md` — every row cites
> a command re-run in the audit session; any row that could not be re-run is
> marked UNKNOWN, not PASS.
>
> **Delivered:** ATM-416–419 (contracts freeze + three storefronts, all sealed,
> all digests reproduce), ATM-420 (cross-app analysis), ATM-421 (lifecycle skill),
> ATM-422 (fourth app by a context-free operator), ATM-423 (this audit).
>
> **Two results the controller should read before anything else:**
>
> 1. **ATM-422's no-engineer claim FAILS.** The fourth app (`poster-storefront`)
>    is real — builds, 28 tests, determinism reproduces live. But the operator
>    could only finish by writing its own PRNG (the skill never mentions cohorts,
>    seeds, or digests) and by overruling a gate that said `blocked`. Its words:
>    *"without that override, this run does not reach closeout."*
>
> 2. **WEAVE's only two executing gates do not verify the app.** `engineering`'s
>    `unit_tests_pass` runs Python unittest discovery against TypeScript apps,
>    finds zero tests, and exits 0 — recorded as `passed: true` for all three
>    sealed apps (F9). `check_no_secrets.py` resolves its scan root from its own
>    file location and can never scan an app it is pointed at (F10). For all four
>    apps, "verified" means self-attestation.
>
> **Open OWNER_GATE:** F1 — the sealed "0 forbidden tokens across 39 files"
> chainless claim is not reproducible. The boundary is genuinely intact
> (deps: next/react/react-dom only, no web3/ethers/viem/wagmi). The *claim* is
> false as worded. Correcting it requires editing the frozen
> `contracts/negative/nft-chainless-contract.json` — an owner decision, not mine.
>
> **Process finding, recorded rather than quietly fixed:** ATM-418/419/420/421 were
> moved to Done on 2026-07-16, before controller verification and before the review
> that found four criteria failures among them. Three of those four (F3, F5, and
> ATM-421's unregistered skill) were acceptance-criteria failures, not cosmetics.
> Nothing has been moved to Done in this session.
>
> **Comprehension debt:** 2 RED, 4 AMBER, 3 GREEN — see the matrix.
>
> Controller feedback on where to aim WEAVE next:
> `docs/atm-415/comparison/08-weave-improvements-and-best-next-investment.md` §C.

---

## NEXT

- **Controller:** review the matrix; rule on the F1 OWNER_GATE (amend the frozen
  contract, or accept the claim's withdrawal as-is).
- **Rank 1 engineering work:** make `engineering`/`qa` gates check the target app.
  Until then WEAVE's central claim does not hold.
- **Open option:** a human second operator for ATM-422. This run shows an engineer
  with no sprint context could not use the skill unaided; it cannot show whether a
  non-engineer could, and that is the question the skill's own quickstart criterion
  (421.5) is about.
