/**
 * Owner Attention derivation (brief §3.3) — the cockpit's core status vocabulary.
 *
 * WEAVE does not store a single "attention" field; the cockpit derives it per
 * Workspace/Task from real fields (blockers + review queue + stage proof_state +
 * gates). Six states, evaluated in strict priority order — a Workspace shows its
 * highest-priority match:
 *
 *   blocked > approval > needs-owner > ready > stale > none
 *
 * This module is pure and has no filesystem/React dependency so it can be the
 * first thing built test-first; lib/weaveHome assembles AttentionFacts from the
 * parsed WEAVE Domain and calls deriveAttention().
 */
import { STAGE_ORDER, type AttentionState, type StageId } from "./types";

export const ATTENTION_PRIORITY: AttentionState[] = [
  "blocked",
  "approval",
  "needs-owner",
  "ready",
  "stale",
  "none",
];

const LABELS: Record<AttentionState, string> = {
  blocked: "Blocked",
  approval: "Approval required",
  "needs-owner": "Needs owner",
  ready: "Ready for review",
  stale: "Stale / no proof",
  none: "None",
};

export function attentionLabel(state: AttentionState): string {
  return LABELS[state];
}

export interface AttentionGateFacts {
  launch_allowed: boolean;
  blocked_by_provider_access: boolean;
  requires_owner_approval: boolean;
  /** owner approved locally (merged from overlay) */
  approved?: boolean;
}

export interface AttentionFacts {
  currentStage: StageId;
  requestedStage?: StageId;
  stages: { stage: StageId; state: string; proof_state: string }[];
  blockers: { state: string }[];
  gates: AttentionGateFacts[];
  proofRecorded: boolean;
  reviewPending: boolean;
  recentAdvancingEvent: boolean;
}

function stageIndex(stage?: StageId): number {
  if (!stage) return -1;
  return STAGE_ORDER.indexOf(stage);
}

const DEPLOYMENT_INDEX = STAGE_ORDER.indexOf("deployment");

/** True when the requested stage is at or beyond deployment. */
function deploymentRequested(requested?: StageId): boolean {
  const i = stageIndex(requested);
  return i >= 0 && i >= DEPLOYMENT_INDEX;
}

export function deriveAttention(f: AttentionFacts): AttentionState {
  const current = f.stages.find((s) => s.stage === f.currentStage);
  const deployReq = deploymentRequested(f.requestedStage);

  // 1 — blocked: a hard block exists.
  if (f.blockers.some((b) => b.state === "blocked_until_validated")) return "blocked";
  if (current?.state === "blocked_by_prior_gates") return "blocked";
  if (
    deployReq &&
    f.gates.some((g) => g.blocked_by_provider_access && !g.approved)
  ) {
    return "blocked";
  }

  // 2 — approval required: an owner-approvable gate awaits an unrecorded decision.
  if (f.gates.some((g) => g.requires_owner_approval && !g.approved)) return "approval";
  if (
    deployReq &&
    f.gates.some((g) => g.launch_allowed === false && !g.approved)
  ) {
    return "approval";
  }

  // 3 — needs owner: an open question is waiting on the owner.
  if (f.blockers.some((b) => b.state === "open_question")) return "needs-owner";

  // 4 — ready for review: proof recorded, review not yet accepted.
  if (f.proofRecorded && f.reviewPending) return "ready";

  // 5 — stale / no proof: current stage proof missing and nothing advanced it.
  if (current?.proof_state === "missing" && !f.recentAdvancingEvent) return "stale";

  // 6 — none.
  return "none";
}

/** Sort helper: highest-priority attention first. */
export function compareAttention(a: AttentionState, b: AttentionState): number {
  return ATTENTION_PRIORITY.indexOf(a) - ATTENTION_PRIORITY.indexOf(b);
}
