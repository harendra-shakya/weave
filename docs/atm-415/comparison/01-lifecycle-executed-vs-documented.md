# 01 — Lifecycle steps: executed vs only documented

Question: for each of the 11 WEAVE lifecycle stages, did WEAVE *execute and check*
the work, or only *record* agent-written evidence?

Source of truth: `packages/weave-tool/evals/lifecycle/*.yaml` (weave repo) defines
each stage's gates as `kind: command` (a shell command whose exit code is checked
— real execution) or `kind: manual` (a `review.json` trusted at face value —
documentation). Per-app results: `apps/<app>/proof/*-eval-result.json`.

## Stage-by-stage (same for all three apps)
| Stage | Gate kind | Executed or documented |
|---|---|---|
| intent | manual (ran with `--run-gates --strict`) | **Executed** — eval ran per app [F] |
| research | manual | Documented [F] |
| selection | manual | Documented [F] |
| plan | manual | Documented [F] |
| engineering | **command** ×3 | **Executed** — tests run, exit code checked [F] |
| qa | **command** ×3 | **Executed** — gates run [F] |
| deployment | manual (owner-gated) | Not pursued — `owner_gated_not_pursued` [F] |
| kpi-setup | manual | Documented [F] |
| marketing | manual (owner-gated) | Not pursued — `owner_gated_not_pursued` [F] |
| iteration | manual | Documented (adaptation report is the artifact) [F] |
| analysis | manual | Documented [F] |

**[F]** Of 11 stages, only **engineering** and **qa** have command gates that
actually run and check an exit code. Intent ran through the eval runner but its
hard gates resolve to manual evidence.

## Per-app intent execution (the one non-eng/qa stage that genuinely ran)
| App | intent eval score | hard gates | Source |
|---|---|---|---|
| video | 93.75% [F] | both green | STATUS-2026-07-14; `apps/video-storefront/proof/intent-eval-result.json` |
| sticker | 93.75% [F] | both green | `apps/sticker-storefront/proof/intent-eval-result.json` |
| nft | 100% [F] | both green | `apps/nft-storefront/proof/intent-eval-result.json` |

## Cross-cutting caveat (why "executed" is weaker than it looks)
- **[F]** Even the engineering/qa command gates cannot reach the managed app:
  `scripts/weave_eval.py:16` hardcodes `REPO_ROOT` to the WEAVE tool repo, and the
  `eval` CLI has no `--app-path` override (limitation L3). So those gates run
  WEAVE's own suite, not each storefront's.
- **[F]** The apps genuinely pass through WEAVE machinery: `weave cos-bootstrap`
  created all 11-stage surfaces, proof/blocker trays, deployment gates, and
  readback (STATUS-2026-07-14 addendum).
- **[I]** Net: WEAVE executed *scaffolding, intent-gating, and freeze/seal/
  determinism tooling*; stage **content** (research→analysis) was produced by the
  agent and recorded as evidence, not independently verified by WEAVE. 9 of 11
  stages are self-attested (limitation L2).
- **[F]** Live corroboration: the lifecycle runner advanced a synthetic state to
  "ALL STAGES COMPLETE" with zero proof files on disk (review finding F5, since
  fixed) — direct evidence that "documented" ≠ "executed" for the manual stages.
