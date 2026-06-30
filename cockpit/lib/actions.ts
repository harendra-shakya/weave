/**
 * Owner action dispatch (the cockpit's only write path).
 *
 * Every action is LOCAL: it records a decision in the overlay and, for
 * external-surface actions, appends a SIMULATED event. Nothing here performs a
 * real deploy, tracker write, send, or credential access. Unknown or malformed
 * actions are rejected — never partially applied.
 */
import type { BlastRadius } from "./types";
import {
  recordGateDecision,
  recordAcknowledgement,
  recordNote,
  type Overlay,
} from "./overlay";

export type ActionRequest =
  | {
      type: "approve_gate" | "hold_gate";
      gateId: string;
      appId: string;
      action: string;
      blastRadius: BlastRadius;
    }
  | { type: "acknowledge_blocker"; blockerId: string; appId: string }
  | { type: "post_note"; agent: string; appId?: string; text: string };

export type ActionResult =
  | { ok: true; overlay: Overlay }
  | { ok: false; error: string };

export async function applyAction(file: string, req: ActionRequest): Promise<ActionResult> {
  switch (req?.type) {
    case "approve_gate":
    case "hold_gate": {
      if (!req.gateId || !req.appId || !req.action) {
        return { ok: false, error: "approve_gate/hold_gate requires gateId, appId, action" };
      }
      const overlay = await recordGateDecision(file, {
        gateId: req.gateId,
        appId: req.appId,
        action: req.action,
        decision: req.type === "approve_gate" ? "approved" : "held",
        blastRadius: req.blastRadius ?? "MEDIUM",
      });
      return { ok: true, overlay };
    }
    case "acknowledge_blocker": {
      if (!req.blockerId || !req.appId) {
        return { ok: false, error: "acknowledge_blocker requires blockerId, appId" };
      }
      const overlay = await recordAcknowledgement(file, {
        blockerId: req.blockerId,
        appId: req.appId,
      });
      return { ok: true, overlay };
    }
    case "post_note": {
      if (!req.agent || !req.text) {
        return { ok: false, error: "post_note requires agent, text" };
      }
      const overlay = await recordNote(file, {
        agent: req.agent,
        appId: req.appId,
        text: req.text,
      });
      return { ok: true, overlay };
    }
    default:
      return { ok: false, error: `unknown action type` };
  }
}
