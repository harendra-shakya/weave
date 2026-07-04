import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  readOverlay,
  recordGateDecision,
  recordAcknowledgement,
  recordNote,
  emptyOverlay,
} from "./overlay";

let dir: string;
let file: string;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "cockpit-overlay-"));
  file = path.join(dir, "cockpit-overlay.json");
});
afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("overlay persistence", () => {
  it("returns an empty overlay when the file does not exist", async () => {
    const o = await readOverlay(file);
    expect(o).toEqual(emptyOverlay());
  });

  it("persists a gate approval and reads it back (survives restart)", async () => {
    await recordGateDecision(file, {
      gateId: "habit-tracker__connect-linear-write",
      appId: "habit-tracker",
      action: "Connect Linear write access (mirror)",
      decision: "approved",
      blastRadius: "MEDIUM",
    });
    // simulate a fresh process: read from disk again
    const reread = await readOverlay(file);
    expect(reread.gates["habit-tracker__connect-linear-write"].decision).toBe("approved");
  });

  it("appends a SIMULATED gate.approved event and an effect.simulated event — never real ones", async () => {
    const o = await recordGateDecision(file, {
      gateId: "habit-tracker__connect-linear-write",
      appId: "habit-tracker",
      action: "Connect Linear write access (mirror)",
      decision: "approved",
      blastRadius: "MEDIUM",
    });
    // Two events: gate.approved then effect.simulated — both marked simulated.
    const decision = o.events.at(-2)!;
    expect(decision.simulated).toBe(true);
    expect(decision.event).toBe("gate.approved");
    expect(decision.app_id).toBe("habit-tracker");
    const effect = o.events.at(-1)!;
    expect(effect.simulated).toBe(true);
    expect(effect.event).toBe("effect.simulated");
  });

  it("records a blocker acknowledgement", async () => {
    const o = await recordAcknowledgement(file, {
      blockerId: "owner-context-needed",
      appId: "notes-app",
    });
    expect(o.acknowledgements["owner-context-needed"]).toBeTruthy();
  });

  it("records a local-only note with no external send", async () => {
    const o = await recordNote(file, {
      agent: "Codex",
      appId: "receipts-app",
      text: "Use the staging target, not prod.",
    });
    expect(o.notes.at(-1)).toMatchObject({ agent: "Codex", text: "Use the staging target, not prod." });
  });
});
