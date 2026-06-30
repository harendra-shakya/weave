/**
 * Owner-action overlay (brief §3.4, A3).
 *
 * Owner decisions taken in the cockpit (gate approve/hold, blocker
 * acknowledgement, Agent notes) are persisted to a LOCAL overlay file under
 * the gitignored runs/ directory — the read-only WEAVE fixtures stay pristine
 * and state survives refresh + dev-server restart.
 *
 * Every external-surface decision appends a SIMULATED event. The cockpit never
 * performs the real external effect; it only records that the owner decided.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import type { BlastRadius, WeaveEvent } from "./types";

export interface GateDecisionRecord {
  decision: "approved" | "held";
  app_id: string;
  action: string;
  at: string;
  simulated: true;
}

export interface Overlay {
  schema: "weave-cockpit-overlay/v0.1";
  gates: Record<string, GateDecisionRecord>;
  acknowledgements: Record<string, { app_id: string; at: string }>;
  notes: { agent: string; app_id?: string; text: string; at: string }[];
  events: WeaveEvent[];
}

export function emptyOverlay(): Overlay {
  return {
    schema: "weave-cockpit-overlay/v0.1",
    gates: {},
    acknowledgements: {},
    notes: [],
    events: [],
  };
}

/** Default overlay location: <cwd>/runs/cockpit-overlay.json (runs/ is gitignored). */
export function defaultOverlayPath(): string {
  return (
    process.env.COCKPIT_OVERLAY ??
    path.join(process.cwd(), "runs", "cockpit-overlay.json")
  );
}

export async function readOverlay(file = defaultOverlayPath()): Promise<Overlay> {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<Overlay>;
    return { ...emptyOverlay(), ...parsed };
  } catch {
    return emptyOverlay();
  }
}

async function writeOverlay(file: string, overlay: Overlay): Promise<void> {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(overlay, null, 2) + "\n", "utf8");
}

export async function recordGateDecision(
  file: string,
  args: {
    gateId: string;
    appId: string;
    action: string;
    decision: "approved" | "held";
    blastRadius: BlastRadius;
  }
): Promise<Overlay> {
  const overlay = await readOverlay(file);
  const at = new Date().toISOString();
  overlay.gates[args.gateId] = {
    decision: args.decision,
    app_id: args.appId,
    action: args.action,
    at,
    simulated: true,
  };
  overlay.events.push({
    app_id: args.appId,
    at,
    event: `gate.${args.decision}`,
    intent: args.action,
    state: args.decision,
    simulated: true,
    blast_radius: args.blastRadius,
  });
  await writeOverlay(file, overlay);
  return overlay;
}

export async function recordAcknowledgement(
  file: string,
  args: { blockerId: string; appId: string }
): Promise<Overlay> {
  const overlay = await readOverlay(file);
  const at = new Date().toISOString();
  overlay.acknowledgements[args.blockerId] = { app_id: args.appId, at };
  overlay.events.push({
    app_id: args.appId,
    at,
    event: "blocker.acknowledged",
    intent: args.blockerId,
    state: "acknowledged",
    simulated: true,
  });
  await writeOverlay(file, overlay);
  return overlay;
}

export async function recordNote(
  file: string,
  args: { agent: string; appId?: string; text: string }
): Promise<Overlay> {
  const overlay = await readOverlay(file);
  const at = new Date().toISOString();
  overlay.notes.push({ agent: args.agent, app_id: args.appId, text: args.text, at });
  overlay.events.push({
    app_id: args.appId,
    at,
    event: "agent.note_posted",
    intent: `note to ${args.agent}`,
    state: "local_only",
    simulated: true,
  });
  await writeOverlay(file, overlay);
  return overlay;
}
