import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttentionPill, StageRail, MirrorBadge, NonClaims } from "./ui";
import type { LifecycleStage } from "@/lib/types";

describe("AttentionPill", () => {
  it("renders the canonical label and data-attn for a state", () => {
    const { container } = render(<AttentionPill state="approval" />);
    expect(screen.getByText("Approval required")).toBeInTheDocument();
    expect(container.querySelector('[data-attn="approval"]')).not.toBeNull();
  });

  it("renders blocked with the blocked data-attn", () => {
    const { container } = render(<AttentionPill state="blocked" />);
    expect(container.querySelector('[data-attn="blocked"]')).not.toBeNull();
  });
});

describe("StageRail", () => {
  it("renders every stage with its proof dot", () => {
    const stages: LifecycleStage[] = [
      { stage: "intent", label: "Intent", state: "complete", proof_state: "recorded" },
      { stage: "deployment", label: "Deployment", state: "active", proof_state: "missing" },
    ];
    const { container } = render(<StageRail stages={stages} />);
    expect(screen.getByText("Intent")).toBeInTheDocument();
    expect(screen.getByText("Deployment")).toBeInTheDocument();
    expect(container.querySelectorAll(".dot")).toHaveLength(2);
  });
});

describe("MirrorBadge", () => {
  it("labels the tool as a Mirror and not source of truth", () => {
    render(<MirrorBadge mirror={{ tool: "Linear", kind: "Mirror", connection: "disconnected" }} />);
    expect(screen.getByText(/Linear · Mirror — not source of truth/)).toBeInTheDocument();
  });
});

describe("NonClaims", () => {
  it("renders the non-claims list under a 'Not proven' label", () => {
    render(<NonClaims items={["does not prove deployment", "does not store secrets"]} />);
    expect(screen.getByText("Not proven")).toBeInTheDocument();
    expect(screen.getByText("does not prove deployment")).toBeInTheDocument();
  });

  it("renders nothing when there are no items", () => {
    const { container } = render(<NonClaims items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
