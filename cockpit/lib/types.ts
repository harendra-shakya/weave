/**
 * WEAVE 0.2 cockpit — types (canonical model).
 * Primary vocabulary: Domain · Node · Workspace · Agent · Task · Event · Proof ·
 * Gate · Mirror · Context Pack. These mirror the real WEAVE COS schemas
 * (verified against docs/samples/cos-weave-skeleton and scripts/weave_cos_skeleton.py).
 * The cockpit reads these; it never invents a parallel model. Legacy terms
 * (Room/Mission/Runtime/Courier) are not used as the implementation model.
 *
 * Note: the engine's on-disk id field is `app_id` (a Workspace's id); it is kept
 * verbatim so the reader stays faithful to the engine and to live mode.
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

// ---- proof ----
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

// ---- agents ----
export type AgentId = "Codex" | "Claude" | "Local runtime";
export type AgentHealth = "healthy" | "idle" | "blocked" | "offline";
export interface Agent {
  identity: AgentId;
  health: AgentHealth;
  status: string;
  task_ref?: string;
  app_id?: string;
  at: string;
  input_request?: string;
  history?: { at: string; note: string }[];
}

// ---- task (bounded work given to an Agent) ----
export interface Task {
  task_id: string;
  app_id: string;
  stage: StageId;
  state: string;
  objective: string;
  worker_packet_ref?: string;
  review_loop?: string[];
  // cockpit-augmented (from fixture, optional)
  agent?: AgentId;
  due?: string;
  allowed?: string[];
  forbidden?: string[];
  non_claims?: string[];
  consulted_contract_refs?: string[];
  proof_state?: ProofState;
}

// ---- context pack (the bounded contract handed to an Agent for a Task) ----
export interface ContextPack {
  objective: string;
  allowed: string[];
  forbidden: string[];
  non_claims: string[];
  worker_packet_ref?: string;
  consulted_contract_refs?: string[];
}

/** Compose a Task's Context Pack from its fields. */
export function contextPackOf(task: Task): ContextPack {
  return {
    objective: task.objective,
    allowed: task.allowed ?? [],
    forbidden: task.forbidden ?? [],
    non_claims: task.non_claims ?? [],
    worker_packet_ref: task.worker_packet_ref,
    consulted_contract_refs: task.consulted_contract_refs,
  };
}

// ---- mirror (legacy alias: Courier for the carry-variant) ----
export type MirrorKind = "Mirror" | "Courier";
export interface Mirror {
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
  mirror?: Mirror["tool"];
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

// ---- node (the local host/runtime environment within the Domain) ----
export interface WeaveNode {
  node_id: string;
  kind: "local" | "remote";
  host: string;
  hosts_agents: AgentId[];
  state_path: string;
  non_claims: string[];
}

// ---- normalized workspace (one app) ----
export interface Workspace {
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
  tasks: Task[];
  tracker: Mirror;
  non_claims: string[];
  attention: AttentionState;
}

// ---- normalized domain (the owner's sovereign graph) ----
export interface Domain {
  active_app_id?: string;
  state: string;
  source: "fixture" | "live";
  source_path: string;
  node?: WeaveNode;
  workspaces: Workspace[];
  agents: Agent[];
  mirrors: Mirror[];
  events: WeaveEvent[];
  non_claims: string[];
}
