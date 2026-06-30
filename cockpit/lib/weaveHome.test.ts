import { describe, it, expect } from "vitest";
import path from "node:path";
import { loadDomain } from "./weaveHome";
import { emptyOverlay } from "./overlay";
import type { Workspace } from "./types";

const FIXTURE = path.join(process.cwd(), "fixtures", "weave-home");

function workspaceById(workspaces: Workspace[], id: string) {
  return workspaces.find((w) => w.app_id === id)!;
}

describe("loadDomain — parses the fixture into a normalized Domain", () => {
  it("reads all four workspaces", async () => {
    const domain = await loadDomain({ homePath: FIXTURE, overlay: emptyOverlay() });
    expect(domain.workspaces.map((w) => w.app_id).sort()).toEqual([
      "habit-tracker",
      "notes-app",
      "receipts-app",
      "tiny-local-calculator",
    ]);
  });

  it("derives the right attention state for each workspace", async () => {
    const domain = await loadDomain({ homePath: FIXTURE, overlay: emptyOverlay() });
    expect(workspaceById(domain.workspaces, "receipts-app").attention).toBe("blocked");
    expect(workspaceById(domain.workspaces, "habit-tracker").attention).toBe("approval");
    expect(workspaceById(domain.workspaces, "tiny-local-calculator").attention).toBe("ready");
    expect(workspaceById(domain.workspaces, "notes-app").attention).toBe("stale");
  });

  it("loads each workspace's 11 lifecycle stages in order", async () => {
    const domain = await loadDomain({ homePath: FIXTURE, overlay: emptyOverlay() });
    const receipts = workspaceById(domain.workspaces, "receipts-app");
    expect(receipts.stages).toHaveLength(11);
    expect(receipts.stages[0].stage).toBe("intent");
    expect(receipts.stages[10].stage).toBe("analysis");
  });

  it("exposes the Habit Tracker owner-approval gate", async () => {
    const domain = await loadDomain({ homePath: FIXTURE, overlay: emptyOverlay() });
    const habit = workspaceById(domain.workspaces, "habit-tracker");
    expect(habit.gates[0].requires_owner_approval).toBe(true);
    expect(habit.gates[0].decision).toBeUndefined();
  });

  it("recovers attention to 'none' once the owner approval gate is approved in the overlay", async () => {
    const overlay = emptyOverlay();
    overlay.gates["habit-tracker__connect-linear-write"] = {
      decision: "approved",
      app_id: "habit-tracker",
      action: "Connect Linear write access (mirror)",
      at: "2026-06-29T10:00:00Z",
      simulated: true,
    };
    const domain = await loadDomain({ homePath: FIXTURE, overlay });
    const habit = workspaceById(domain.workspaces, "habit-tracker");
    expect(habit.gates[0].decision).toBe("approved");
    expect(habit.attention).toBe("none");
  });

  it("composes a Task's Context Pack (objective + allowed/forbidden/non-claims)", async () => {
    const domain = await loadDomain({ homePath: FIXTURE, overlay: emptyOverlay() });
    const habit = workspaceById(domain.workspaces, "habit-tracker");
    const task = habit.tasks[0];
    expect(task.agent).toBe("Claude");
    expect((task.allowed ?? []).length).toBeGreaterThan(0);
    expect((task.forbidden ?? []).length).toBeGreaterThan(0);
  });

  it("loads the local Node (single local-node this sprint)", async () => {
    const domain = await loadDomain({ homePath: FIXTURE, overlay: emptyOverlay() });
    expect(domain.node?.node_id).toBe("local-node");
    expect(domain.node?.kind).toBe("local");
  });

  it("loads agents named Codex / Claude / Local runtime (no legacy term)", async () => {
    const domain = await loadDomain({ homePath: FIXTURE, overlay: emptyOverlay() });
    expect(domain.agents.map((a) => a.identity).sort()).toEqual([
      "Claude",
      "Codex",
      "Local runtime",
    ]);
  });

  it("surfaces Linear/Slack/GitHub as simulated mirrors, never source of truth", async () => {
    const domain = await loadDomain({ homePath: FIXTURE, overlay: emptyOverlay() });
    const tools = domain.mirrors.map((m) => m.tool).sort();
    expect(tools).toEqual(["GitHub", "Linear", "Slack"]);
    expect(domain.mirrors.every((m) => m.connection !== "connected")).toBe(true);
  });
});
