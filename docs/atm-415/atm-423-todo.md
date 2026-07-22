# ATM-423 Todo: Seal Three-App Source, Runtime, Simulation, Skill & Comprehension Proof

**The final closeout.** Produce the independently reviewable Friday package; stop any source/runtime/analytics/skill/comprehension claim from closing without evidence. Blocked by **all six** other children (417, 418, 419, 420, 421, 422). Due 2026-07-24.

> Budget: **10% evidence/teach-back allocation**.
> ⚠️ **A missing proof row is a BLOCK or FAILURE — never a documentation omission to waive.**
> Boundary: no push, PR, merge, deploy, publish, user contact, payment, wallet/chain, or real-demand claim.

---

## Authority (read + keep in context — governs this issue)
- **ATM-415 umbrella** — deliverables, acceptance matrix, and the rule that you never mark Done (controller verification only). See [atm-415-todo.md](atm-415-todo.md).
- **ATM-416 frozen contracts** — every reproduced number must re-derive against the frozen contracts; a contract that changed without an `OWNER_GATE` record is itself a FAIL row.

## 0. Preconditions
- [ ] All upstream ready for review: 3 apps (417/418/419), cross-app decision (420), skill (421), fourth-app proof (422)

## 1. Run the full V5 acceptance matrix
- [ ] Execute every required matrix row
- [ ] Classify each row: **PASS / FAIL / UNKNOWN / NONCLAIM**
- [ ] Each required row has **source-linked evidence** (points to a real artifact)

## 2. Source identity & fresh checks (per source)
- [ ] Record exact **source roots**, **base / ancestry / diff / commit identity** (where authorized)
- [ ] Fresh **build**
- [ ] Fresh **test**
- [ ] Fresh **type** check
- [ ] Fresh **lint**
- [ ] Fresh **security** scan
- [ ] Fresh **secret** scan
- [ ] Fresh **license** check
- [ ] Fresh **public-safety** scan

## 3. Reproduce the runtime & simulation
- [ ] Reproduce local user workflows (each app actually runs)
- [ ] Reproduce deterministic **cohort / retest** calculations (same seeds → same numbers)
- [ ] Confirm before/after deltas re-derive identically

## 4. Verify evidence integrity (per app)
- [ ] Event lineage intact (immutable, ordered)
- [ ] Manifests complete
- [ ] Checksums verify (nothing swapped)
- [ ] Failure / recovery evidence present
- [ ] Usage ledger present
- [ ] Cleanup proof (no residue)

## 5. Reconcile claims
- [ ] **Every Linear claim reconciled with proof** (no claim without a matching artifact)
- [ ] Flag any claim that lacks evidence as FAIL/UNKNOWN, not waived

## 6. Teach-back & comprehension debt
- [ ] **Harendra** teach-back complete
- [ ] **Fresh-operator** teach-back complete (from ATM-422)
- [ ] Classify comprehension debt **RED / AMBER / GREEN**

## 7. Final seal
- [ ] Every required matrix row has source-linked evidence
- [ ] **No disposable runtime residue remains**
- [ ] **No unauthorized external action occurred** (verify)
- [ ] Set final worker label: `READY_FOR_CONTROLLER_REVIEW_WEAVE_THREE_APPLICATIONS_V5`
- [ ] Hand off to the **independent controller** — only they may accept and move issues to Done

---

## The rule that defines this issue
This is the gate that prevents "looks done" from becoming "is Done." Its whole job is to catch claims that lack proof. If a row can't be independently reproduced from a linked artifact, it does NOT pass — it blocks. You produce the review-ready package; **you do not close it yourself.**
