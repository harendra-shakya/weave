import { loadHome } from "@/lib/weaveHome";
import { BlastTag, NonClaims, MirrorBadge } from "@/components/ui";
import { GateDecision } from "@/components/actions";
import type { Gate } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function GateQueue() {
  const home = await loadHome();
  const gates: { gate: Gate; roomName: string }[] = home.rooms.flatMap((r) =>
    r.gates.map((gate) => ({ gate, roomName: r.name }))
  );

  return (
    <>
      <h1 className="page-title">Gate / Approval Queue</h1>
      <p className="page-sub">Risky transitions blocked until you approve — external effects are simulated only</p>

      {gates.length === 0 ? (
        <div className="panel"><div className="empty">No gates awaiting you — nothing to approve.</div></div>
      ) : (
        gates.map(({ gate, roomName }) => {
          const approvable = gate.requires_owner_approval && !gate.blocked_by_provider_access;
          const blockedReason = gate.blocked_by_provider_access
            ? "Not owner-approvable until provider access is validated (hard gate)."
            : undefined;
          return (
            <div key={gate.id} className="panel">
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div className="h2" style={{ margin: 0 }}>{gate.action}</div>
                <BlastTag blast={gate.blast_radius} />
                {gate.mirror && <MirrorBadge mirror={{ tool: gate.mirror, kind: "Mirror", connection: "simulated" }} />}
                <span className="spacer" />
                <span className="muted" style={{ fontSize: "var(--fs-sm)" }}>{roomName}</span>
              </div>

              <div className="grid cols-2" style={{ marginTop: 12, alignItems: "start" }}>
                <div>
                  <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 6 }}>Required approval / proof</div>
                  {gate.providers.length === 0 ? (
                    <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>No provider validation required.</div>
                  ) : (
                    gate.providers.map((p) => (
                      <div key={p.provider} className="tag" data-blast={p.proof_state === "not_validated" ? "HIGH" : "LOW"} style={{ marginRight: 6, marginBottom: 6 }}>
                        {p.provider} · {p.proof_state}
                      </div>
                    ))
                  )}
                </div>
                <div>
                  <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 6 }}>
                    Decision · launch_allowed = {String(gate.launch_allowed)}
                  </div>
                  <GateDecision
                    gateId={gate.id}
                    appId={gate.app_id}
                    action={gate.action}
                    blastRadius={gate.blast_radius}
                    approvable={approvable}
                    decision={gate.decision}
                    blockedReason={blockedReason}
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <NonClaims items={gate.non_claims} label="Not proven by approving here" />
              </div>
            </div>
          );
        })
      )}
    </>
  );
}
