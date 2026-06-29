import { describe, it, expect } from "vitest";
import path from "node:path";
import { loadHome } from "./weaveHome";
import { emptyOverlay } from "./overlay";
import type { Room } from "./types";

const FIXTURE = path.join(process.cwd(), "fixtures", "weave-home");

function roomById(rooms: Room[], id: string) {
  return rooms.find((r) => r.app_id === id)!;
}

describe("loadHome — parses the fixture into a normalized Home", () => {
  it("reads all four rooms", async () => {
    const home = await loadHome({ homePath: FIXTURE, overlay: emptyOverlay() });
    expect(home.rooms.map((r) => r.app_id).sort()).toEqual([
      "habit-tracker",
      "notes-app",
      "receipts-app",
      "tiny-local-calculator",
    ]);
  });

  it("derives the right attention state for each room", async () => {
    const home = await loadHome({ homePath: FIXTURE, overlay: emptyOverlay() });
    expect(roomById(home.rooms, "receipts-app").attention).toBe("blocked");
    expect(roomById(home.rooms, "habit-tracker").attention).toBe("approval");
    expect(roomById(home.rooms, "tiny-local-calculator").attention).toBe("ready");
    expect(roomById(home.rooms, "notes-app").attention).toBe("stale");
  });

  it("loads each room's 11 lifecycle stages in order", async () => {
    const home = await loadHome({ homePath: FIXTURE, overlay: emptyOverlay() });
    const receipts = roomById(home.rooms, "receipts-app");
    expect(receipts.stages).toHaveLength(11);
    expect(receipts.stages[0].stage).toBe("intent");
    expect(receipts.stages[10].stage).toBe("analysis");
  });

  it("exposes the Habit Tracker owner-approval gate", async () => {
    const home = await loadHome({ homePath: FIXTURE, overlay: emptyOverlay() });
    const habit = roomById(home.rooms, "habit-tracker");
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
    const home = await loadHome({ homePath: FIXTURE, overlay });
    const habit = roomById(home.rooms, "habit-tracker");
    expect(habit.gates[0].decision).toBe("approved");
    expect(habit.attention).toBe("none");
  });

  it("loads runtimes named Codex / Claude / Local runtime (no legacy term)", async () => {
    const home = await loadHome({ homePath: FIXTURE, overlay: emptyOverlay() });
    expect(home.runtimes.map((r) => r.identity).sort()).toEqual([
      "Claude",
      "Codex",
      "Local runtime",
    ]);
  });

  it("surfaces Linear/Slack/GitHub as simulated mirrors, never source of truth", async () => {
    const home = await loadHome({ homePath: FIXTURE, overlay: emptyOverlay() });
    const tools = home.mirrors.map((m) => m.tool).sort();
    expect(tools).toEqual(["GitHub", "Linear", "Slack"]);
    expect(home.mirrors.every((m) => m.connection !== "connected")).toBe(true);
  });
});
