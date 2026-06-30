/**
 * WEAVE Domain reader (brief §1, §4).
 *
 * Reads the local WEAVE home (the committed fixture by default, or a live
 * runs/cos-weave-home via WEAVE_HOME) and normalizes it into the cockpit's
 * canonical Domain/Workspace model. Owner decisions from the local overlay are
 * merged in, and the Owner Attention state is derived per Workspace via
 * lib/attention.
 *
 * Strictly local file reads. No outbound network calls.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  type Domain,
  type Workspace,
  type LifecycleStage,
  type Blocker,
  type Gate,
  type ProofEnvelope,
  type ReviewItem,
  type Task,
  type Agent,
  type Mirror,
  type WeaveNode,
  type WeaveEvent,
  type StageId,
} from "./types";
import { deriveAttention, type AttentionFacts } from "./attention";
import { readOverlay, type Overlay } from "./overlay";

export function resolveHomePath(): string {
  if (process.env.WEAVE_HOME) return process.env.WEAVE_HOME;
  return path.join(process.cwd(), "fixtures", "weave-home");
}

export function homeSource(): "fixture" | "live" {
  return process.env.WEAVE_HOME ? "live" : "fixture";
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

/** Read a file that may live at one of several relative paths (fixture flat vs live nested). */
async function readJsonAny<T>(base: string, candidates: string[], fallback: T): Promise<T> {
  for (const rel of candidates) {
    try {
      return JSON.parse(await fs.readFile(path.join(base, rel), "utf8")) as T;
    } catch {
      /* try next */
    }
  }
  return fallback;
}

async function readEvents(homePath: string): Promise<WeaveEvent[]> {
  try {
    const raw = await fs.readFile(path.join(homePath, "updates", "events.jsonl"), "utf8");
    return raw
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0)
      .map((l) => JSON.parse(l) as WeaveEvent);
  } catch {
    return [];
  }
}

const ADVANCING = /(proof|advanced|stage|gate\.)/i;

function buildAttentionFacts(ws: Omit<Workspace, "attention">, events: WeaveEvent[]): AttentionFacts {
  const proofRecorded = ws.proofs.some((p) => p.state === "recorded");
  const reviewPending = ws.reviews.some(
    (r) => /pending/i.test(r.state) || r.decision === "not_accepted_as_done"
  );
  const recentAdvancingEvent = events.some(
    (e) => e.app_id === ws.app_id && ADVANCING.test(e.event)
  );
  return {
    currentStage: ws.current_stage,
    requestedStage: ws.requested_stage,
    stages: ws.stages.map((s) => ({ stage: s.stage, state: s.state, proof_state: s.proof_state })),
    blockers: ws.blockers.map((b) => ({ state: b.state })),
    gates: ws.gates.map((g) => ({
      launch_allowed: g.launch_allowed,
      blocked_by_provider_access: g.blocked_by_provider_access,
      requires_owner_approval: g.requires_owner_approval,
      approved: g.decision === "approved",
    })),
    proofRecorded,
    reviewPending,
    recentAdvancingEvent,
  };
}

interface AppRegistryEntry {
  app_id: string;
  name: string;
  current_stage: string;
  state: string;
}

async function loadWorkspace(
  homePath: string,
  entry: AppRegistryEntry,
  overlay: Overlay,
  events: WeaveEvent[]
): Promise<Workspace> {
  const id = entry.app_id;
  const appBase = path.join(homePath, "apps", id);

  const app = await readJson<Record<string, any>>(path.join(appBase, "app.json"), {});
  const lifecycle = await readJson<{ stages?: LifecycleStage[] }>(
    path.join(appBase, "lifecycle.json"),
    {}
  );
  const blockerTray = await readJsonAny<{ blockers?: Blocker[] }>(
    appBase,
    ["blocker-tray.json", "blockers/blocker-tray.json"],
    {}
  );
  const proofTray = await readJsonAny<{ items?: ProofEnvelope[] }>(
    appBase,
    ["proof-tray.json", "proof/proof-tray.json"],
    {}
  );
  const reviewQueue = await readJsonAny<{ items?: ReviewItem[] }>(
    appBase,
    ["review-queue.json", "review/review-queue.json"],
    {}
  );
  const taskLedger = await readJson<{ tasks?: Task[] }>(path.join(appBase, "tasks.json"), {});
  const gateFile = await readJson<{ gates?: Gate[] }>(path.join(appBase, "gates.json"), {});

  const gates: Gate[] = (gateFile.gates ?? []).map((g) => ({
    ...g,
    decision: overlay.gates[g.id]?.decision,
  }));

  const tracker: Mirror = {
    tool: "Linear",
    kind: "Mirror",
    connection: app.tracker?.linear_required ? "simulated" : "disconnected",
  };

  const base: Omit<Workspace, "attention"> = {
    app_id: id,
    name: app.name ?? entry.name ?? id,
    owner_intent: app.owner_intent ?? "",
    current_stage: (app.current_stage ?? entry.current_stage ?? "intent") as StageId,
    requested_stage: app.requested_stage as StageId | undefined,
    state: app.state ?? entry.state ?? "",
    next_action: app.next_action,
    stages: lifecycle.stages ?? [],
    blockers: blockerTray.blockers ?? [],
    gates,
    proofs: proofTray.items ?? [],
    reviews: reviewQueue.items ?? [],
    tasks: taskLedger.tasks ?? [],
    tracker,
    non_claims: app.non_claims ?? [],
  };

  return { ...base, attention: deriveAttention(buildAttentionFacts(base, events)) };
}

export interface LoadDomainOptions {
  homePath?: string;
  overlay?: Overlay;
}

export async function loadDomain(opts: LoadDomainOptions = {}): Promise<Domain> {
  const homePath = opts.homePath ?? resolveHomePath();
  const overlay = opts.overlay ?? (await readOverlay());

  const state = await readJson<Record<string, any>>(path.join(homePath, "state.json"), {});
  const registry = await readJson<{ apps?: AppRegistryEntry[]; active_app_id?: string }>(
    path.join(homePath, "apps", "registry.json"),
    {}
  );
  const agentsFile = await readJson<{ agents?: Agent[] }>(
    path.join(homePath, "agents.json"),
    {}
  );
  const node = await readJson<WeaveNode | undefined>(path.join(homePath, "node.json"), undefined);
  const fixtureEvents = await readEvents(homePath);

  const entries = registry.apps ?? [];
  const workspaces = await Promise.all(
    entries.map((e) => loadWorkspace(homePath, e, overlay, fixtureEvents))
  );

  // Mirrors — reflected/carried, never source of truth. Simulated this sprint.
  const mirrors: Mirror[] = [
    { tool: "Linear", kind: "Mirror", connection: "disconnected" },
    { tool: "Slack", kind: "Courier", connection: "disconnected" },
    { tool: "GitHub", kind: "Mirror", connection: "disconnected" },
  ];

  // Merge fixture events with SIMULATED overlay events, newest first.
  const events = [...fixtureEvents, ...overlay.events].sort((a, b) =>
    (b.at ?? "").localeCompare(a.at ?? "")
  );

  return {
    active_app_id: registry.active_app_id ?? state.active_app_id,
    state: state.state ?? "local_skeleton_ready",
    source: homeSource(),
    source_path: opts.homePath ? "(custom)" : homeSource() === "fixture" ? "<cockpit>/fixtures/weave-home" : "(live)",
    node,
    workspaces,
    agents: agentsFile.agents ?? [],
    mirrors,
    events,
    non_claims: state.non_claims ?? [],
  };
}
