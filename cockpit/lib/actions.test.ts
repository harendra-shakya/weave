import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { applyAction, type ActionRequest } from "./actions";
import { readOverlay } from "./overlay";

let dir: string;
let file: string;
beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "cockpit-actions-"));
  file = path.join(dir, "cockpit-overlay.json");
});
afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("applyAction", () => {
  it("approves a gate, persists it, and records a SIMULATED event", async () => {
    const res = await applyAction(file, {
      type: "approve_gate",
      gateId: "habit-tracker__connect-linear-write",
      appId: "habit-tracker",
      action: "Connect Linear write access (mirror)",
      blastRadius: "MEDIUM",
    });
    expect(res.ok).toBe(true);
    const o = await readOverlay(file);
    expect(o.gates["habit-tracker__connect-linear-write"].decision).toBe("approved");
    expect(o.events.at(-1)!.simulated).toBe(true);
  });

  it("rejects an unknown action type instead of performing anything", async () => {
    const res = await applyAction(file, { type: "delete_everything" } as unknown as ActionRequest);
    expect(res.ok).toBe(false);
    const o = await readOverlay(file);
    expect(o.events).toHaveLength(0);
  });

  it("rejects an approval missing required fields (no silent external effect)", async () => {
    const res = await applyAction(
      file,
      { type: "approve_gate", appId: "habit-tracker" } as unknown as ActionRequest
    );
    expect(res.ok).toBe(false);
  });
});
