import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttentionPill, ProofTag, MirrorBadge, StageRail } from "./ui";
import type { LifecycleStage } from "@/lib/types";

describe("AttentionPill", () => {
  it("renders the Ledger glyph + label and data-attn for approval", () => {
    const { container } = render(<AttentionPill state="approval" />);
    expect(screen.getByText(/● APPROVAL/)).toBeInTheDocument();
    expect(container.querySelector('[data-attn="approval"]')).not.toBeNull();
  });

  it("renders blocked with the blocked data-attn and glyph", () => {
    const { container } = render(<AttentionPill state="blocked" />);
    expect(screen.getByText(/◆ BLOCKED/)).toBeInTheDocument();
    expect(container.querySelector('[data-attn="blocked"]')).not.toBeNull();
  });

  it("renders needs-owner with data-attn needs-owner", () => {
    const { container } = render(<AttentionPill state="needs-owner" />);
    expect(screen.getByText(/◉ NEEDS OWNER/)).toBeInTheDocument();
    expect(container.querySelector('[data-attn="needs-owner"]')).not.toBeNull();
  });

  it("renders stale with dashed data-attn", () => {
    const { container } = render(<AttentionPill state="stale" />);
    expect(container.querySelector('[data-attn="stale"]')).not.toBeNull();
  });
});

describe("ProofTag", () => {
  it("renders RECORDED tag with data-proof recorded", () => {
    const { container } = render(<ProofTag kind="recorded" />);
    expect(screen.getByText(/✓ RECORDED/)).toBeInTheDocument();
    expect(container.querySelector('[data-proof="recorded"]')).not.toBeNull();
  });

  it("renders SIMULATED tag with data-proof simulated", () => {
    const { container } = render(<ProofTag kind="simulated" />);
    expect(screen.getByText(/SIMULATED/)).toBeInTheDocument();
    expect(container.querySelector('[data-proof="simulated"]')).not.toBeNull();
  });
});

describe("MirrorBadge", () => {
  it("labels the tool as a mirror with the MIRROR badge", () => {
    render(<MirrorBadge tool="Linear" />);
    expect(screen.getByText(/MIRROR · Linear/)).toBeInTheDocument();
  });
});

describe("StageRail", () => {
  it("renders every stage with its label and proof state", () => {
    const stages: LifecycleStage[] = [
      { stage: "intent", label: "Intent", state: "complete", proof_state: "recorded" },
      { stage: "engineering", label: "Engineering", state: "active", proof_state: "missing" },
      { stage: "qa", label: "QA", state: "not_started", proof_state: "not_required_yet" },
    ];
    render(<StageRail stages={stages} />);
    expect(screen.getByText("Intent")).toBeInTheDocument();
    expect(screen.getByText("Engineering")).toBeInTheDocument();
    expect(screen.getByText("QA")).toBeInTheDocument();
    // done stage shows ✓ in circle, active shows NO PROOF label
    expect(screen.getByText("PROOF ✓")).toBeInTheDocument();
    expect(screen.getByText("NO PROOF")).toBeInTheDocument();
  });
});
