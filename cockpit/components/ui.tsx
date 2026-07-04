/**
 * Shared Ledger components. All token-driven via CSS variables; no hard-coded colors.
 * data-attn / data-proof / data-state drive all state-variant styling.
 */
import type { CSSProperties, ReactNode } from "react";
import type { AttentionState, LifecycleStage, Mirror } from "@/lib/types";

/* ---------- Attention ---------- */

const ATTN_GLYPH: Record<AttentionState, string> = {
  blocked: "◆",
  approval: "●",
  "needs-owner": "◉",
  ready: "○",
  stale: "◌",
  none: "✓",
};
const ATTN_LABEL: Record<AttentionState, string> = {
  blocked: "BLOCKED",
  approval: "APPROVAL",
  "needs-owner": "NEEDS OWNER",
  ready: "REVIEW",
  stale: "STALE",
  none: "ALL CLEAR",
};

export function attentionGlyph(state: AttentionState): string { return ATTN_GLYPH[state]; }
export function attentionLabel(state: AttentionState): string { return ATTN_LABEL[state]; }

export function AttentionPill({ state }: { state: AttentionState }) {
  return (
    <span className="attn-pill" data-attn={state}>
      {ATTN_GLYPH[state]} {ATTN_LABEL[state]}
    </span>
  );
}

/* ---------- Proof tags ---------- */

export function ProofTag({ kind }: { kind: "recorded" | "simulated" }) {
  return (
    <span className="proof-tag" data-proof={kind}>
      {kind === "recorded" ? "✓ RECORDED" : "SIMULATED"}
    </span>
  );
}

/* ---------- Mirror badge ---------- */

export function MirrorBadge({ tool }: { tool: Mirror["tool"] }) {
  return <span className="mirror-badge">⇄ MIRROR · {tool}</span>;
}

/* ---------- Stage rail (11 circles) ---------- */

export function StageRail({ stages }: { stages: LifecycleStage[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 0, marginTop: 18 }}>
      {stages.map((s, i) => {
        const done = s.state === "complete";
        const active = s.state === "active";
        const proofLabel =
          s.proof_state === "recorded" ? "PROOF ✓" :
          s.proof_state === "missing" && (done || active) ? "NO PROOF" : "—";
        const proofColor =
          s.proof_state === "recorded" ? "var(--proof-recorded)" :
          s.proof_state === "missing" && (done || active) ? "var(--ink-4)" : "var(--ink-4)";

        return (
          <div key={s.stage} className="stage-cell" style={{ display: "grid", gap: 7, justifyItems: "center", padding: "0 2px", position: "relative" }}>
            {/* connector hairline */}
            {i < stages.length - 1 && (
              <div style={{ position: "absolute", top: 14, left: "50%", right: "-50%", height: 1, background: "var(--line-hair)" }} />
            )}
            {/* circle */}
            <div style={{
              position: "relative", zIndex: 1,
              width: 28, height: 28, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: done ? "var(--proof-recorded)" : active ? "var(--paper-2)" : "transparent",
              border: done ? "1px solid var(--proof-recorded)" : active ? "2px solid var(--accent)" : "1px solid var(--line-mid)",
              color: done ? "var(--proof-recorded-ink)" : active ? "var(--accent)" : "var(--ink-4)",
              font: "600 12px var(--font-mono)",
              boxShadow: active ? "0 0 0 4px var(--accent-wash)" : "none",
            }}>
              {done ? "✓" : i + 1}
            </div>
            {/* stage name */}
            <div style={{ font: "500 10.5px var(--font-text)", color: active ? "var(--ink-1)" : done ? "var(--ink-2)" : "var(--ink-4)", textAlign: "center", lineHeight: 1.2 }}>
              {s.label}
            </div>
            {/* proof label */}
            <div style={{ font: "500 8.5px var(--font-mono)", letterSpacing: ".08em", color: proofColor }}>
              {proofLabel}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Mini lifecycle ticks (workspace list) ---------- */

export function LifecycleTicks({ stages }: { stages: LifecycleStage[] }) {
  return (
    <span style={{ display: "flex", gap: 3 }}>
      {stages.map((s) => {
        const done = s.state === "complete";
        const active = s.state === "active";
        const blocked = s.state === "blocked_by_prior_gates";
        return (
          <span key={s.stage} style={{
            width: 14, height: 8,
            background: done ? "var(--proof-recorded)" : active ? "var(--accent-wash)" : "transparent",
            border: done ? "1px solid var(--proof-recorded)" : active ? "1px solid var(--accent)" : blocked ? "1px solid var(--attn-blocked)" : "1px solid var(--line-mid)",
          }} />
        );
      })}
    </span>
  );
}

/* ---------- Review-loop stepper ---------- */

const STEP_NAMES = ["Draft", "Build", "Self-check", "Owner review", "Accepted"];

export function ReviewStepper({ step }: { step: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {STEP_NAMES.map((name, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <div key={name} style={{ display: "flex", alignItems: "center" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 14px",
              border: done ? "1px solid var(--proof-recorded)" : current ? "1px solid var(--ink-1)" : "1px solid var(--line-mid)",
              borderRadius: "var(--r-pill)",
              background: current ? "var(--ink-1)" : done ? "var(--attn-review-wash)" : "transparent",
            }}>
              <span style={{ font: "600 10px var(--font-mono)", color: current ? "var(--paper-2)" : done ? "var(--proof-recorded)" : "var(--ink-4)" }}>
                {done ? "✓" : current ? "●" : "○"}
              </span>
              <span style={{ font: "600 11px var(--font-text)", letterSpacing: ".06em", color: current ? "var(--paper-2)" : done ? "var(--proof-recorded)" : "var(--ink-4)" }}>
                {name}
              </span>
            </div>
            {i < STEP_NAMES.length - 1 && (
              <div style={{ width: 26, height: 1, background: "var(--line-mid)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Context pack 3-column sheet ---------- */

export function ContextPack({ allowed, forbidden, nonClaims, packRef }: {
  allowed: string[];
  forbidden: string[];
  nonClaims: string[];
  packRef?: string;
}) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "4px 14px" }} className="section-head">
        <span>CONTEXT PACK — THE AGENT'S CONTRACT</span>
        {packRef && <span style={{ font: "400 10.5px var(--font-mono)", color: "var(--ink-4)", fontWeight: 400, borderBottom: "none", letterSpacing: 0 }}>{packRef}</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginTop: 0 }}>
        <div style={{ padding: "16px 18px 16px 0", borderRight: "1px solid var(--line-hair)" }}>
          <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--proof-recorded)", marginBottom: 10 }}>✓ ALLOWED</div>
          {allowed.map((a, i) => (
            <div key={i} style={{ font: "400 12.5px/1.55 var(--font-text)", color: "var(--ink-2)", padding: "5px 0", borderBottom: "1px solid var(--paper-0)" }}>{a}</div>
          ))}
        </div>
        <div style={{ padding: "16px 18px", borderRight: "1px solid var(--line-hair)" }}>
          <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--attn-blocked)", marginBottom: 10 }}>◆ FORBIDDEN</div>
          {forbidden.map((f, i) => (
            <div key={i} style={{ font: "400 12.5px/1.55 var(--font-text)", color: "var(--ink-2)", padding: "5px 0", borderBottom: "1px solid var(--paper-0)" }}>{f}</div>
          ))}
        </div>
        <div style={{ padding: "16px 0 16px 18px" }}>
          <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-3)", marginBottom: 10 }}>○ NON-CLAIMS</div>
          {nonClaims.map((n, i) => (
            <div key={i} style={{ font: "italic 400 12.5px/1.55 var(--font-display)", color: "var(--ink-3)", padding: "5px 0", borderBottom: "1px solid var(--paper-0)" }}>{n}</div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------- Section head ---------- */

export function SectionHead({ label, right, style }: { label: string; right?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "4px 14px", borderBottom: "2px solid var(--ink-1)", paddingBottom: "var(--sp-2)", ...style }}>
      <span style={{ font: "700 11px var(--font-text)", letterSpacing: ".16em" }}>{label}</span>
      {right && <span style={{ font: "400 10.5px var(--font-mono)", color: "var(--ink-4)" }}>{right}</span>}
    </div>
  );
}

/* ---------- Mono meta ---------- */

export function MonoMeta({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ font: "400 10.5px var(--font-mono)", color: "var(--ink-4)", ...style }}>{children}</span>
  );
}

/* ---------- Empty state ---------- */

export function EmptyDocket() {
  return (
    <div style={{ padding: "46px 0 40px", textAlign: "center" }} className="rise-in">
      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, border: "2px solid var(--proof-recorded)", borderRadius: "50%", font: "600 22px var(--font-mono)", color: "var(--proof-recorded)" }}>✓</div>
      <div style={{ marginTop: 18, font: "500 26px var(--font-display)" }}>The ledger is closed.</div>
      <div style={{ marginTop: 8, font: "400 13.5px/1.6 var(--font-text)", color: "var(--ink-3)", maxWidth: 380, margin: "8px auto 0" }}>
        Every line is settled. Your Agents will write here the moment something needs you — until then, this page stays quiet.
      </div>
    </div>
  );
}

/* ---------- Error state ---------- */

export function ErrorState({ onRetry, onSettings }: { onRetry?: () => void; onSettings?: () => void }) {
  return (
    <div style={{ padding: "60px 44px", flex: 1, display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: 620, width: "100%" }}>
        <div style={{ font: "500 34px/1.2 var(--font-display)" }}>The ledger could not be opened.</div>
        <div style={{ marginTop: 14, font: "400 14px/1.65 var(--font-text)", color: "var(--ink-2)" }}>
          WEAVE couldn't read the local state directory. Most often the directory has moved, or another process is holding the lock. Nothing has been lost — the ledger is append-only.
        </div>
        <div style={{ marginTop: 22, background: "var(--paper-2)", border: "1px solid var(--line-card)", padding: "18px 22px" }}>
          <div style={{ font: "700 10.5px var(--font-text)", letterSpacing: ".14em", color: "var(--ink-3)", marginBottom: 8 }}>WHAT TO CHECK</div>
          <div style={{ display: "grid", gap: 7, font: "400 13px/1.55 var(--font-text)", color: "var(--ink-2)" }}>
            <div style={{ display: "flex", gap: 10 }}><span style={{ font: "600 12px var(--font-mono)", color: "var(--ink-3)" }}>1</span>The state directory is where Settings says it is.</div>
            <div style={{ display: "flex", gap: 10 }}><span style={{ font: "600 12px var(--font-mono)", color: "var(--ink-3)" }}>2</span>No other WEAVE process is running against the same Domain.</div>
            <div style={{ display: "flex", gap: 10 }}><span style={{ font: "600 12px var(--font-mono)", color: "var(--ink-3)" }}>3</span>The dev server was started from the Domain root.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 22, alignItems: "center" }}>
          {onRetry && <button className="btn-primary" onClick={onRetry}>Try again</button>}
          {onSettings && <button className="btn-ghost" onClick={onSettings}>Open Settings</button>}
          <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>error is local · no paths are shown or logged</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Loading skeleton ---------- */

export function LoadingSkeleton() {
  return (
    <div style={{ padding: 44, flex: 1 }}>
      <div style={{ font: "500 13px var(--font-mono)", color: "var(--ink-3)", letterSpacing: ".1em" }}>OPENING THE LEDGER…</div>
      <div style={{ marginTop: 10, font: "400 13px var(--font-text)", color: "var(--ink-4)" }}>Reading the local state directory. This never takes long.</div>
      <div style={{ marginTop: 30, display: "grid", gap: 0, maxWidth: 900 }}>
        <div style={{ height: 44, borderBottom: "2px solid var(--ink-1)", display: "flex", alignItems: "center" }}>
          <div style={{ width: 180, height: 12 }} className="skeleton-bar" />
        </div>
        {[46, 58, 38, 52, 30].map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, height: 58, borderBottom: "1px solid var(--line-hair)" }}>
            <div style={{ width: 26, height: 10 }} className="skeleton-bar" />
            <div style={{ width: 96, height: 20, border: "1px solid var(--line-hair)" }} className="skeleton-bar" />
            <div style={{ width: `${w}%`, height: 12 }} className="skeleton-bar" />
          </div>
        ))}
      </div>
    </div>
  );
}
