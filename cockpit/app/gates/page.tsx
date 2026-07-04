import { loadDomain } from "@/lib/weaveHome";
import { readOverlay, type Overlay } from "@/lib/overlay";
import { MirrorBadge, SectionHead, MonoMeta } from "@/components/ui";
import { GateDecision } from "@/components/actions";
import type { Gate } from "@/lib/types";

export const dynamic = "force-dynamic";

const BLAST_COLOR: Record<string, string> = {
  HIGH: "var(--attn-blocked)", MEDIUM: "var(--attn-approval)", LOW: "var(--proof-recorded)",
};
const BLAST_WASH: Record<string, string> = {
  HIGH: "var(--attn-blocked-wash)", MEDIUM: "var(--attn-approval-wash)", LOW: "var(--attn-review-wash)",
};

export default async function GateQueue() {
  const [domain, overlay] = await Promise.all([loadDomain(), readOverlay()]);

  const gateRows = domain.workspaces.flatMap((w) =>
    w.gates.map((gate) => ({ gate, workspaceName: w.name }))
  );

  const pending = gateRows.filter(({ gate }) => !overlay.gates[gate.id]);
  const decided = gateRows.filter(({ gate }) => overlay.gates[gate.id]);

  return (
    <div style={{ padding: "34px 44px 40px" }}>
      <div style={{ font: "500 38px/1.15 var(--font-display)", letterSpacing: "-.01em" }}>
        Gate Queue
      </div>
      <div style={{ marginTop: 9, font: "400 13.5px var(--font-text)", color: "var(--ink-3)" }}>
        Risky transitions blocked until you decide · external effects are SIMULATED only · decisions record locally.
      </div>

      {gateRows.length === 0 && (
        <div style={{ marginTop: 28, padding: "40px 0", textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, border: "2px solid var(--proof-recorded)", borderRadius: "50%", font: "600 20px var(--font-mono)", color: "var(--proof-recorded)" }}>✓</div>
          <div style={{ marginTop: 16, font: "500 24px var(--font-display)" }}>No gates awaiting you.</div>
          <div style={{ marginTop: 8, font: "400 13.5px var(--font-text)", color: "var(--ink-3)" }}>All transitions are either approved, held, or clear.</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, marginTop: 32, alignItems: "start" }}>
        {/* gate memos */}
        <div style={{ display: "grid", gap: 20 }}>
          {pending.map(({ gate, workspaceName }) => (
            <GateMemo key={gate.id} gate={gate} workspaceName={workspaceName} overlay={overlay} />
          ))}
          {decided.map(({ gate, workspaceName }) => (
            <GateMemo key={gate.id} gate={gate} workspaceName={workspaceName} overlay={overlay} />
          ))}
        </div>

        {/* right rail: honesty / legend */}
        <div style={{ display: "grid", gap: 24, paddingTop: 4 }}>
          <div>
            <SectionHead label="PROOF BOUNDARY" />
            <div style={{ marginTop: 12, display: "grid", gap: 10, font: "400 13px/1.6 var(--font-text)", color: "var(--ink-2)" }}>
              <div>Approving here records your decision to the <strong>local overlay only</strong>. No real deploy, DNS change, database write, or external message is performed.</div>
              <div>All effects are marked SIMULATED in the event log.</div>
              <div>Decisions survive refresh and server restart.</div>
            </div>
          </div>

          <div>
            <SectionHead label="BLAST RADIUS" />
            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              {["HIGH", "MEDIUM", "LOW"].map((level) => (
                <div key={level} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="blast-chip" data-blast={level} style={{ display: "inline-block" }}>
                    {level}
                  </span>
                  <span style={{ font: "400 12.5px var(--font-text)", color: "var(--ink-3)" }}>
                    {level === "HIGH" ? "Hard to reverse · external data at risk" : level === "MEDIUM" ? "Significant scope · reversible" : "Narrow · easily undone"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHead label="MIRROR WRITES" />
            <div style={{ marginTop: 12, font: "400 13px/1.6 var(--font-text)", color: "var(--ink-2)" }}>
              Gates marked with a Mirror badge touch an external tracker (Linear, GitHub, Slack). These are never executed — the write is SIMULATED and recorded as an overlay event.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GateMemo({ gate, workspaceName, overlay }: { gate: Gate; workspaceName: string; overlay: Overlay }) {
  const decision = overlay.gates[gate.id]?.decision ?? gate.decision;
  const approvable = gate.requires_owner_approval && !gate.blocked_by_provider_access;
  const blockedReason = gate.blocked_by_provider_access
    ? "Provider access not validated — this is a hard gate. Validate provider access before approving."
    : !gate.requires_owner_approval
    ? "This gate does not require owner approval."
    : undefined;

  return (
    <div style={{
      padding: "22px 26px",
      background: decision ? "var(--paper-2)" : "var(--paper-1)",
      border: decision
        ? `2px solid ${decision === "approved" ? "var(--proof-recorded)" : "var(--attn-blocked)"}`
        : `1.5px solid var(--line-card)`,
      boxShadow: decision ? "none" : "var(--shadow-card)",
      opacity: decision ? 0.85 : 1,
    }}>
      {/* gate header */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ font: "700 16px var(--font-text)", flex: 1 }}>{gate.action}</div>
        <span className="blast-chip" data-blast={gate.blast_radius}>{gate.blast_radius}</span>
        {gate.mirror && <MirrorBadge tool={gate.mirror} />}
      </div>

      <div style={{ display: "flex", gap: 14, marginTop: 8, alignItems: "center" }}>
        <MonoMeta>{gate.id}</MonoMeta>
        <span style={{ font: "400 12px var(--font-text)", color: "var(--ink-3)" }}>{workspaceName}</span>
        <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>
          launch_allowed: {String(gate.launch_allowed)}
        </span>
      </div>

      {/* providers */}
      {gate.providers.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-3)", marginBottom: 8 }}>PROVIDER VALIDATION</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {gate.providers.map((p) => (
              <div
                key={p.provider}
                style={{
                  padding: "5px 10px", font: "600 11px var(--font-mono)", borderRadius: "var(--r-chip)",
                  background: p.proof_state === "validated" ? "var(--attn-review-wash)" : "var(--attn-blocked-wash)",
                  color: p.proof_state === "validated" ? "var(--proof-recorded)" : "var(--attn-blocked)",
                  border: `1px solid ${p.proof_state === "validated" ? "var(--proof-recorded)" : "var(--attn-blocked)"}`,
                }}
              >
                {p.proof_state === "validated" ? "✓ " : "◆ "}{p.provider}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* non-claims */}
      {gate.non_claims.length > 0 && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-hair)" }}>
          <div style={{ font: "700 9.5px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-4)", marginBottom: 6 }}>NOT PROVEN BY APPROVING</div>
          {gate.non_claims.map((nc, i) => (
            <div key={i} style={{ font: "italic 400 12.5px/1.5 var(--font-display)", color: "var(--ink-3)", padding: "4px 0" }}>○ {nc}</div>
          ))}
        </div>
      )}

      {/* decision controls */}
      <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line-hair)" }}>
        <GateDecision
          gateId={gate.id}
          appId={gate.app_id}
          action={gate.action}
          blastRadius={gate.blast_radius}
          approvable={approvable}
          decision={decision}
          blockedReason={blockedReason}
        />
      </div>
    </div>
  );
}
