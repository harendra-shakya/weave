/**
 * Shared presentational components (DESIGN_SYSTEM §5): AttentionPill, StageRail,
 * MirrorBadge, NonClaims, BlastTag, ProofTag, EmptyState, ErrorPanel, ReviewLoop,
 * ContextPack (§5.12), DomainNode (§5.13). All token-driven; no hard-coded colors.
 */
import type { ReactNode } from "react";
import {
  type AttentionState,
  type LifecycleStage,
  type Mirror,
  type BlastRadius,
  type ContextPack as ContextPackData,
  type WeaveNode,
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

const TOOL_ICON: Record<Mirror["tool"], SourceName> = {
  Linear: "linear",
  Slack: "slack",
  GitHub: "github",
};

export function MirrorBadge({ mirror }: { mirror: Mirror }) {
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
      <div className="lbl">Couldn’t read the Domain</div>
      <div className="muted" style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

/**
 * Context Pack panel (DESIGN_SYSTEM §5.12) — the bounded "what this Agent may and
 * may not do" contract for one Task: Allowed / Forbidden / Non-claims, with the
 * linked packet ref. Read-only; it frames why a local action may be disabled.
 */
export function ContextPack({ pack }: { pack: ContextPackData }) {
  return (
    <div className="panel">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="h2" style={{ margin: 0 }}>Context Pack</div>
        <span className="spacer" />
        {pack.worker_packet_ref && (
          <span className="mono muted" style={{ fontSize: "var(--fs-xs)" }}>{pack.worker_packet_ref}</span>
        )}
      </div>
      <div className="grid cols-2" style={{ marginTop: 10, alignItems: "start" }}>
        <div className="scope" data-kind="allowed">
          <div className="h2">Allowed</div>
          <ul className="tight">{pack.allowed.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
        <div className="scope" data-kind="forbidden">
          <div className="h2">Forbidden</div>
          <ul className="tight">{pack.forbidden.map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <NonClaims items={pack.non_claims} />
      </div>
      {pack.consulted_contract_refs && pack.consulted_contract_refs.length > 0 && (
        <div className="muted mono" style={{ fontSize: "var(--fs-xs)", marginTop: 8 }}>
          contracts: {pack.consulted_contract_refs.join(" · ")}
        </div>
      )}
    </div>
  );
}

/**
 * Domain · Node header strip (DESIGN_SYSTEM §5.13) — names the active sovereign
 * graph + the local host the cockpit is reading on every screen.
 */
export function DomainNode({ state, node }: { state: string; node?: WeaveNode }) {
  return (
    <div className="domain-node">
      <SourceIcon name="weave" size={12} style={{ color: "var(--accent)" }} />
      <span className="sec">Domain</span>
      <span className="muted">{state}</span>
      <span className="sep">·</span>
      <span className="sec">Node</span>
      <span className="muted">{node ? `${node.node_id} · ${node.host}` : "local-node"}</span>
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
