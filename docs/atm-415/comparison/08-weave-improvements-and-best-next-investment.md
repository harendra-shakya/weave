# 08 — Evidence-ranked WEAVE improvements + best next investment

The issue conflates two backlogs; separated here. Both are evidence-ranked.

## A. WEAVE-tool improvements (ranked by evidence + leverage)
Source: `weave/limitations-and-future-improvements.md` (L1–L9) + findings F1–F13.

| Rank | Improvement | Evidence | Leverage |
|---|---|---|---|
| 1 | **Make the two executing gates actually check the target app** | `engineering`/`qa` are the only stages with command gates. All five fail outside the weave repo (F10). The one that "passed" for all three sealed apps passed **vacuously on zero discovered tests** — `video-storefront/proof/engineering-eval-result.json:12` records `"Ran 0 tests in 0.000s\n\nOK"` as `passed: true` (F9) [F] | This is the whole product. Without it, "verified" means "someone wrote a document" for 11 of 11 stages |
| 2 | Fix `check_no_secrets.py` to scan what it is pointed at | `check_no_secrets.py:18` resolves `REPO_ROOT` from its own file location, so `--app-path` can never redirect it (F10). Every app's `no_secret_leakage: passed` never scanned that app [F] | A security gate that scans the wrong directory is worse than none — it produces false assurance |
| 3 | Give the runner a state value for a stop | `ENGINEERING_REQUIRED` is prose with no schema field; `nextStage()` knows only `verified` and `owner_gated_not_pursued` (F11) [F] | ATM-422's operator had to overrule a blocked gate *because there was nowhere to record the block*. The tool creates the pressure to lie to it |
| 4 | Existence-check manual-gate evidence | 9/11 stages trust free-text (L2); runner advanced with zero proof on disk (F5, fixed + mutation-tested) [F] | Closes the integrity gap the review actually caught |
| 5 | Wire craft skills into stages | "design" appears once in the codebase, as a regex keyword (L1) [F] | Addresses the polish bar at the framework level (started: `skill-registry.json` + guided mode) |
| 6 | Lazy-load stage contracts + remove 3 duplicate writes | ~65K-token Intent overhead, 11 contracts loaded upfront (L8/L9) [F] | Biggest token-cost lever |
| 7 | Scanner precision + seal provenance | chainless claim not reproducible (F1, OWNER_GATE); seal self-listed (F2, fixed); `created_for` hardcoded to one ticket (F7, fixed) [F] | Makes proof tooling produce reproducible claims |
| 8 | Run the skill's own tests in CI | `public-safe-ci.yml` runs no Node; the 30-test suite protecting the fail-closed guarantee is CI-invisible [F] | A guarantee nothing automatically checks is a guarantee that decays |

## B. Best next product investment (app-side)
Source: `docs/atm-420-cross-app-analysis.json` `ranked_next_investment` (reproduced).
| Rank | Investment | Rationale |
|---|---|---|
| 1 | Real payment provider | Unblocks all three deployment gates with one integration |
| 2 | Real user-cohort replay | The only thing that converts synthetic ITERATEs into demand evidence; `cohort.mjs` already accepts any seed |
| 3 | NFT policy review | Before any collectible-launch spend (highest real-launch risk — see 05) |
| 4 | Sticker cart-recovery flow | 15.3% abandonment, low-cost frontend addition |
| 5 | Lifecycle loop automation | intent→seal pattern proven across 3 domains |

## Single highest-value next step
- **[I]** **B2 — real-cohort replay.** Until synthetic baselines are tested against
  real sessions, every ITERATE decision (07) and every price-elasticity observation
  is unvalidated. Engineering cost is low (`cohort.mjs` already accepts any seed;
  the real data just replaces the PRNG sequence). It is the one step that upgrades
  the whole sprint's evidence from "reproducible synthetic" to "tested against reality".
- **[F]** No real-demand claim is made from any synthetic result in this set.

---

## C. Controller feedback — where WEAVE should be aimed

**Harendra's judgment, offered to the controller.** Labelled `[I]` throughout: this
is an engineer's read of the evidence, not a finding. The evidence it rests on is
`[F]` and cited.

### The thesis

**Invest in making WEAVE a quality-assurance agent harness.**

As an engineer, I would not reach for WEAVE today. I want to be direct about that,
because it is the most useful thing I can tell you. The four things that would
change it: **scaling applications, demonstrable security, genuinely beautiful
design, and seamless UX.** If WEAVE can promise those, people will use it. Right
now it promises process, and process is not a reason to adopt a tool.

### Why the QA harness is the right aim — this is the part with evidence behind it

The most valuable thing WEAVE did in this entire sprint was **catch that its own
sealed claims were false.** Not generate the apps — catch the lies.

- **[F]** F3: the skill was never registered; the package validator exited 1 — the
  exact opposite of its own acceptance criterion.
- **[F]** F5: the lifecycle runner failed *open*. Every stage self-attested
  `verified`, zero proof on disk, and it printed `ALL STAGES COMPLETE`, exit 0.
- **[F]** F2/F7: a seal manifest was stale and self-referential; another claimed
  the wrong ticket's provenance.
- **[F]** F9: the `engineering` gate passed on **zero discovered tests** for all
  three sealed apps.
- **[F]** F1: a sealed chainless claim was not reproducible.

**[I]** Every one of those was found by *re-running* rather than re-reading. That
is the product. An adversarial evidence harness that fails closed and re-executes
what a document claims is something engineers would actually pay for, because it
solves a problem we genuinely have and cannot solve by being careful. A document
generator is not — we have those, and they are free.

**[I]** The sprint accidentally demonstrated the market: WEAVE's *lifecycle* needed
a human-directed review pass to be trustworthy, and that review pass found six
real defects in four hours. Sell the review pass.

### The gap, stated plainly

**[F]** Limitation L1: WEAVE has no UI/UX logic. "design" appears once in the
entire codebase, as a regex keyword. That is my "beautiful designs, seamless UX"
complaint, arrived at independently by the review and by me.

**[F]** ATM-422 is the other half. A context-free operator could not use the skill
without writing its own PRNG and overruling a blocked gate. In its words:
*"without that override, this run does not reach closeout."* That is the
"no reason to use it" complaint, measured rather than asserted.

**[I]** So the honest current position: WEAVE cannot promise scaling, cannot speak
to design or UX at all, and its two security-adjacent gates scan the wrong
directory. Four pillars, zero of them currently standing. That is not a reason to
stop — it is a reason to pick one and actually stand it up.

### One amendment to my own framing

**[I]** I said "security without flaws." I want to withdraw the wording, and the
reason matters more than the phrase.

Nobody can promise flawless security. More to the point, *this sprint is a
demonstration of what overclaiming costs*: F1 exists because a seal said "0
forbidden tokens across 39 files" when the scanner could not actually distinguish
a token's mention from its use. The claim was too strong, the boundary underneath
it was real, and the overreach is what made the evidence worthless. A project whose
entire discipline is non-claims cannot ship a promise it would reject from anyone
else.

So: **demonstrable security** — fails closed, scans what it is pointed at, and
produces evidence a third party can re-run and get the same answer. That is
sellable, defensible, and unlike flawlessness, it is true when we say it. The
four-pillar argument is unchanged and stronger for the edit.

### Ranked, if you take one thing from this

1. **[I]** Fix the two executing gates (A1/A2). Until `verified` means something a
   machine checked, every other investment compounds on sand. This is also the
   cheapest — the gates exist, they are pointed at the wrong directory.
2. **[I]** Then decide whether WEAVE is a QA harness or an app builder. The sprint
   evidence says it is good at the first and absent at the second (L1). Trying to
   be both is why the fourth app needed an engineer.
3. **[I]** Design and UX (A5) only become tractable *after* 2 — they are craft
   skills to wire in, not logic to write, and the `skill-registry.json` seam
   already exists.
