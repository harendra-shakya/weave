/**
 * Shared presentational components (DESIGN_SYSTEM §5): AttentionPill, StageRail,
 * MirrorBadge, NonClaims, BlastTag, ProofTag, EmptyState, ErrorPanel, ReviewLoop.
 * All token-driven; no hard-coded colors.
 */
import type { ReactNode } from "react";
import {
  type AttentionState,
  type LifecycleStage,
  type MirrorCourier,
  type BlastRadius,
} from "@/lib/types";
import { attentionLabel } from "@/lib/attention";
import { SourceIcon, type SourceName } from "./SourceIcon";

const ATTN_DATA: Record<AttentionState, string> = {
  blocked: "blocked",
  approval: "approval",
  "needs-owner": "needs-owner",
  ready: "ready",
  stale: "stale",
  none: "none",
};

export function AttentionPill({ state, label }: { state: AttentionState; label?: string }) {
  return (
    <span className="pill" data-attn={ATTN_DATA[state]}>
      {label ?? attentionLabel(state)}
    </span>
  );
}

export function StageRail({ stages }: { stages: LifecycleStage[] }) {
  return (
    <div className="rail">
      {stages.map((s) => (
        <span key={s.stage} className="step" data-state={s.state} title={`${s.label} · ${s.state} · proof ${s.proof_state}`}>
          {s.label}
          <span className="dot" data-proof={s.proof_state} />
        </span>
      ))}
    </div>
  );
}

const TOOL_ICON: Record<MirrorCourier["tool"], SourceName> = {
  Linear: "linear",
  Slack: "slack",
  GitHub: "github",
};

export function MirrorBadge({ mirror }: { mirror: MirrorCourier }) {
  return (
    <span className="mirror-badge" title={`${mirror.tool} ${mirror.kind} — not source of truth · ${mirror.connection}`}>
      <SourceIcon name={TOOL_ICON[mirror.tool]} size={12} />
      {mirror.tool} · {mirror.kind} — not source of truth
    </span>
  );
}

export function BlastTag({ blast }: { blast: BlastRadius }) {
  return <span className="tag" data-blast={blast}>blast radius: {blast}</span>;
}

export function ProofTag({ kind }: { kind: "real" | "sim" }) {
  return (
    <span className="proof-tag" data-kind={kind}>
      {kind === "real" ? "real local proof" : "SIMULATED external"}
    </span>
  );
}

export function NonClaims({ items, label = "Not proven" }: { items: string[]; label?: string }) {
  if (!items?.length) return null;
  return (
    <div className="nonclaims">
      <div className="lbl">{label}</div>
      <ul className="tight">
        {items.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}

export function ReviewLoop({ state }: { state?: Record<string, string> }) {
  const steps = ["observe", "validate", "govern", "review", "sync"];
  return (
    <div className="rail">
      {steps.map((s) => {
        const v = state?.[s];
        const done = v && /recorded|written|gates_recorded/.test(v);
        return (
          <span key={s} className="step" data-state={done ? "active" : undefined} title={v ?? "pending"}>
            {s[0].toUpperCase() + s.slice(1)} {done ? "✓" : v ? "•" : "○"}
          </span>
        );
      })}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function ErrorPanel({ children }: { children: ReactNode }) {
  return (
    <div className="error-panel">
      <div className="lbl">Couldn’t read the WEAVE home</div>
      <div className="muted" style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

export function Panel({ title, right, children }: { title?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="panel">
      {(title || right) && (
        <div style={{ display: "flex", alignItems: "center" }}>
          {title && <div className="h2">{title}</div>}
          <span className="spacer" />
          {right}
        </div>
      )}
      {children}
    </div>
  );
}
