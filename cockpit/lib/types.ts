/**
 * WEAVE 0.2 cockpit — types.
 * These mirror the real WEAVE COS schemas (verified against
 * docs/samples/cos-weave-skeleton and scripts/weave_cos_skeleton.py).
 * The cockpit reads these; it never invents a parallel model.
 */

// ---- lifecycle ----
export const STAGE_ORDER = [
  "intent",
  "research",
  "selection",
  "plan",
  "engineering",
  "qa",
  "deployment",
  "kpi-setup",
  "marketing",
  "iteration",
  "analysis",
] as const;
export type StageId = (typeof STAGE_ORDER)[number];

export type StageState =
  | "active"
  | "complete"
  | "blocked_by_prior_gates"
  | "not_started";

export type ProofState = "missing" | "not_required_yet" | "recorded" | "not_started";

export interface LifecycleStage {
  stage: StageId;
  label: string;
  state: StageState;
  proof_state: ProofState;
}

// ---- blockers ----
export type BlockerState = "open_question" | "blocked_until_validated";
export interface Blocker {
  id: string;
  state: BlockerState;
  missing: unknown[];
  next_action: string;
}

// ---- deployment gate (provider access) ----
export type ProviderProofState = "not_validated" | "validated";
export interface GateProvider {
  provider: string;
  proof_state: ProviderProofState;
  required_capabilities: string[];
}

// ---- proof envelope ----
export interface ProofEnvelope {
  task_id?: string;
  claim: string;
  proof_surface: string;
  artifact_refs: string[];
  non_claims: string[];
  review_loop_state?: Record<string, string>;
  state: string; // "recorded"
  app_id?: string;
}

// ---- review queue ----
export interface ReviewItem {
  id: string;
  artifact_refs: string[];
  decision: string; // e.g. "not_accepted_as_done"
  loop: string[];
  state: string; // e.g. "pending_owner_context"
}

// ---- mission / task ----
export interface Mission {
  task_id: string;
  app_id: string;
  stage: StageId;
  state: string;
  objective: string;
  worker_packet_ref?: string;
  review_loop?: string[];
  // cockpit-augmented (from fixture, optional)
  runtime?: RuntimeId;
  due?: string;
  allowed?: string[];
  forbidden?: string[];
  non_claims?: string[];
  proof_state?: ProofState;
}

// ---- runtimes ----
export type RuntimeId = "Codex" | "Claude" | "Local runtime";
export type RuntimeHealth = "healthy" | "idle" | "blocked" | "offline";
export interface RuntimeCheckpoint {
  identity: RuntimeId;
  health: RuntimeHealth;
  status: string;
  mission_ref?: string;
  app_id?: string;
  at: string;
  input_request?: string;
  history?: { at: string; note: string }[];
}

// ---- mirror / courier ----
export type MirrorKind = "Mirror" | "Courier";
export interface MirrorCourier {
  tool: "Linear" | "Slack" | "GitHub";
  kind: MirrorKind;
  connection: "disconnected" | "simulated" | "connected";
}

// ---- gates (cockpit-facing, owner-approvable) ----
export type BlastRadius = "LOW" | "MEDIUM" | "HIGH";
export interface Gate {
  id: string;
  app_id: string;
  action: string;
  blast_radius: BlastRadius;
  requires_owner_approval: boolean;
  launch_allowed: boolean;
  blocked_by_provider_access: boolean;
  providers: GateProvider[];
  non_claims: string[];
  /** present on external-surface gates (e.g. Linear write) */
  mirror?: MirrorCourier["tool"];
  /** owner decision merged from the local overlay; undefined = no decision yet */
  decision?: "approved" | "held";
}

// ---- attention ----
export type AttentionState =
  | "blocked"
  | "approval"
  | "needs-owner"
  | "ready"
  | "stale"
  | "none";

// ---- event log ----
export interface WeaveEvent {
  app_id?: string;
  at: string;
  event: string;
  intent?: string;
  state?: string;
  simulated?: boolean;
  blast_radius?: BlastRadius;
}

// ---- normalized room (one app) ----
export interface Room {
  app_id: string;
  name: string;
  owner_intent: string;
  current_stage: StageId;
  requested_stage?: StageId;
  state: string;
  next_action?: string;
  stages: LifecycleStage[];
  blockers: Blocker[];
  gates: Gate[];
  proofs: ProofEnvelope[];
  reviews: ReviewItem[];
  missions: Mission[];
  tracker: MirrorCourier;
  non_claims: string[];
  attention: AttentionState;
}

// ---- normalized home (the castle) ----
export interface Home {
  active_app_id?: string;
  state: string;
  source: "fixture" | "live";
  source_path: string;
  rooms: Room[];
  runtimes: RuntimeCheckpoint[];
  mirrors: MirrorCourier[];
  events: WeaveEvent[];
  non_claims: string[];
}
