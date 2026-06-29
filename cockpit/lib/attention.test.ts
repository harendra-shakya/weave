import { describe, it, expect } from "vitest";
import {
  deriveAttention,
  ATTENTION_PRIORITY,
  attentionLabel,
  type AttentionFacts,
} from "./attention";

/**
 * The Owner Attention derivation is the cockpit's core vocabulary
 * (brief §3.3). Six states, strict priority order:
 *   blocked > approval > needs-owner > ready > stale > none
 * Every screen depends on this, so it is built test-first.
 */

function facts(over: Partial<AttentionFacts> = {}): AttentionFacts {
  return {
    currentStage: "intent",
    requestedStage: "intent",
    stages: [{ stage: "intent", state: "active", proof_state: "recorded" }],
    blockers: [],
    gates: [],
    proofRecorded: false,
    reviewPending: false,
    recentAdvancingEvent: true,
    ...over,
  };
}

describe("deriveAttention — priority order", () => {
  it("returns 'none' when nothing is pending", () => {
    expect(deriveAttention(facts())).toBe("none");
  });

  it("'blocked' when a blocker is blocked_until_validated", () => {
    expect(
      deriveAttention(facts({ blockers: [{ state: "blocked_until_validated" }] }))
    ).toBe("blocked");
  });

  it("'blocked' when the current stage is blocked_by_prior_gates", () => {
    expect(
      deriveAttention(
        facts({
          currentStage: "research",
          stages: [
            { stage: "research", state: "blocked_by_prior_gates", proof_state: "missing" },
          ],
        })
      )
    ).toBe("blocked");
  });

  it("'blocked' when provider access blocks a requested deployment", () => {
    expect(
      deriveAttention(
        facts({
          requestedStage: "deployment",
          gates: [
            {
              launch_allowed: false,
              blocked_by_provider_access: true,
              requires_owner_approval: false,
            },
          ],
        })
      )
    ).toBe("blocked");
  });

  it("'approval' when an owner-approval gate is pending and unapproved", () => {
    expect(
      deriveAttention(
        facts({
          gates: [
            {
              launch_allowed: false,
              blocked_by_provider_access: false,
              requires_owner_approval: true,
            },
          ],
        })
      )
    ).toBe("approval");
  });

  it("approval clears once the owner has approved the gate (overlay)", () => {
    expect(
      deriveAttention(
        facts({
          gates: [
            {
              launch_allowed: false,
              blocked_by_provider_access: false,
              requires_owner_approval: true,
              approved: true,
            },
          ],
        })
      )
    ).toBe("none");
  });

  it("'needs-owner' for an open_question blocker", () => {
    expect(
      deriveAttention(facts({ blockers: [{ state: "open_question" }] }))
    ).toBe("needs-owner");
  });

  it("'ready' when proof is recorded but review is still pending", () => {
    expect(
      deriveAttention(facts({ proofRecorded: true, reviewPending: true }))
    ).toBe("ready");
  });

  it("'stale' when the current stage proof is missing and nothing advanced it", () => {
    expect(
      deriveAttention(
        facts({
          stages: [{ stage: "intent", state: "active", proof_state: "missing" }],
          recentAdvancingEvent: false,
        })
      )
    ).toBe("stale");
  });

  it("blocked outranks approval, needs-owner, ready and stale", () => {
    expect(
      deriveAttention(
        facts({
          blockers: [{ state: "blocked_until_validated" }, { state: "open_question" }],
          gates: [
            {
              launch_allowed: false,
              blocked_by_provider_access: false,
              requires_owner_approval: true,
            },
          ],
          proofRecorded: true,
          reviewPending: true,
        })
      )
    ).toBe("blocked");
  });

  it("approval outranks needs-owner and ready", () => {
    expect(
      deriveAttention(
        facts({
          blockers: [{ state: "open_question" }],
          gates: [
            {
              launch_allowed: false,
              blocked_by_provider_access: false,
              requires_owner_approval: true,
            },
          ],
          proofRecorded: true,
          reviewPending: true,
        })
      )
    ).toBe("approval");
  });
});

describe("attention metadata", () => {
  it("exposes the six states in priority order", () => {
    expect(ATTENTION_PRIORITY).toEqual([
      "blocked",
      "approval",
      "needs-owner",
      "ready",
      "stale",
      "none",
    ]);
  });

  it("maps each state to its canonical label", () => {
    expect(attentionLabel("blocked")).toBe("Blocked");
    expect(attentionLabel("approval")).toBe("Approval required");
    expect(attentionLabel("needs-owner")).toBe("Needs owner");
    expect(attentionLabel("ready")).toBe("Ready for review");
    expect(attentionLabel("stale")).toBe("Stale / no proof");
    expect(attentionLabel("none")).toBe("None");
  });
});
