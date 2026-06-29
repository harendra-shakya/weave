import { loadHome } from "@/lib/weaveHome";
import { NonClaims, ReviewLoop, ProofTag } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ProofLedger() {
  const home = await loadHome();
  const proofs = home.rooms.flatMap((r) => r.proofs.map((p) => ({ ...p, room: r.name })));

  return (
    <>
      <h1 className="page-title">Proof / Evidence Ledger</h1>
      <p className="page-sub">Every claim, its evidence, and what it does NOT prove</p>

      <div className="grid cols-2" style={{ gridTemplateColumns: "1.6fr 1fr", alignItems: "start" }}>
        <div className="panel">
          <div className="h2">Proof envelopes</div>
          {proofs.length === 0 ? (
            <div className="empty">No proof envelopes recorded yet.</div>
          ) : (
            proofs.map((p, i) => (
              <div key={i} className="row" style={{ display: "block" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <strong>“{p.claim}”</strong>
                  <span className="spacer" />
                  <ProofTag kind="real" />
                </div>
                <div className="muted" style={{ fontSize: "var(--fs-sm)", margin: "4px 0" }}>
                  {p.room} · <span className="mono">{p.proof_surface}</span> · state: {p.state}
                </div>
                <div className="muted mono" style={{ fontSize: "var(--fs-xs)" }}>
                  {p.artifact_refs.join(" · ")}
                </div>
                <div style={{ margin: "8px 0" }}><ReviewLoop state={p.review_loop_state} /></div>
                <NonClaims items={p.non_claims} label="Not proven (non-claims)" />
              </div>
            ))
          )}
        </div>

        <div className="panel">
          <div className="h2">Event log</div>
          <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 8 }}>append-only · newest first</div>
          {home.events.map((e, i) => (
            <div key={i} className="row" style={{ display: "block", borderColor: e.simulated ? "var(--proof-sim)" : undefined }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {e.simulated ? <ProofTag kind="sim" /> : <ProofTag kind="real" />}
                <span className="mono" style={{ fontSize: "var(--fs-xs)" }}>{e.event}</span>
              </div>
              <div className="muted" style={{ fontSize: "var(--fs-sm)", marginTop: 4 }}>
                {e.app_id ?? "—"} · {e.intent ?? e.state ?? ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
