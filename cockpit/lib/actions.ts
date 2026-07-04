/**
 * Owner action dispatch (the cockpit's only write path).
 *
 * Every action is LOCAL: it records a decision in the overlay and, for
 * external-surface actions, appends a SIMULATED event. Nothing here performs a
 * real deploy, tracker write, send, or credential access.
 */
import type { BlastRadius } from "./types";
import {
  recordGateDecision,
  recordAcknowledgement,
  recordNote,
  recordReviewAcceptance,
  recordTaskAnswer,
  resetOverlay,
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
  | { type: "post_note"; agent: string; appId?: string; text: string }
  | { type: "accept_review"; reviewId: string; appId: string }
  | { type: "answer_task"; taskId: string; appId: string; agent: string; text: string }
  | { type: "reset_overlay" };

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
    case "accept_review": {
      if (!req.reviewId || !req.appId) {
        return { ok: false, error: "accept_review requires reviewId, appId" };
      }
      const overlay = await recordReviewAcceptance(file, {
        reviewId: req.reviewId,
        appId: req.appId,
      });
      return { ok: true, overlay };
    }
    case "answer_task": {
      if (!req.taskId || !req.appId || !req.agent || !req.text) {
        return { ok: false, error: "answer_task requires taskId, appId, agent, text" };
      }
      const overlay = await recordTaskAnswer(file, {
        taskId: req.taskId,
        appId: req.appId,
        agent: req.agent,
        text: req.text,
      });
      return { ok: true, overlay };
    }
    case "reset_overlay": {
      const overlay = await resetOverlay(file);
      return { ok: true, overlay };
    }
    default:
      return { ok: false, error: `unknown action type` };
  }
}
