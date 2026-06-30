import { loadDomain } from "@/lib/weaveHome";
import { SourceIcon, agentIconName } from "@/components/SourceIcon";
import { PostNote } from "@/components/actions";

export const dynamic = "force-dynamic";

const HEALTH_COLOR: Record<string, string> = {
  healthy: "var(--proof-real)",
  idle: "var(--attn-needs-owner)",
  blocked: "var(--attn-blocked)",
  offline: "var(--text-2)",
};

export default async function AgentsPanel() {
  const domain = await loadDomain();
  return (
    <>
      <h1 className="page-title">Agents</h1>
      <p className="page-sub">Second channel to your Agents — local notes only, nothing is sent externally</p>

      {domain.agents.length === 0 ? (
        <div className="panel"><div className="empty">No Agents attached.</div></div>
      ) : (
        domain.agents.map((ag) => (
          <div key={ag.identity} className="panel">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <SourceIcon name={agentIconName(ag.identity)} size={16} style={{ color: "var(--text-1)" }} />
              <div className="h2" style={{ margin: 0 }}>{ag.identity}</div>
              <span className="tag" style={{ color: HEALTH_COLOR[ag.health] }}>{ag.health}</span>
              <span className="spacer" />
              <span className="muted" style={{ fontSize: "var(--fs-sm)" }}>{ag.app_id ?? ""}</span>
            </div>
            <div className="muted" style={{ fontSize: "var(--fs-sm)", margin: "6px 0" }}>{ag.status}</div>

            {ag.input_request && (
              <div className="row" style={{ display: "block", borderColor: "var(--proof-sim)" }}>
                <div className="sec" style={{ fontWeight: 700 }}>Needs owner</div>
                <div className="muted" style={{ fontSize: "var(--fs-sm)", marginTop: 4 }}>“{ag.input_request}”</div>
              </div>
            )}

            {ag.history && ag.history.length > 0 && (
              <div style={{ margin: "10px 0" }}>
                <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 4 }}>Recent status history</div>
                {ag.history.map((h, i) => (
                  <div key={i} className="muted" style={{ fontSize: "var(--fs-sm)" }}>· {h.note}</div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 4 }}>Leave a note</div>
              <PostNote agent={ag.identity} appId={ag.app_id} />
            </div>
          </div>
        ))
      )}
    </>
  );
}
