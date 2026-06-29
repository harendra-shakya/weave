import { loadHome } from "@/lib/weaveHome";
import { SourceIcon, runtimeIconName } from "@/components/SourceIcon";
import { PostNote } from "@/components/actions";

export const dynamic = "force-dynamic";

const HEALTH_COLOR: Record<string, string> = {
  healthy: "var(--proof-real)",
  idle: "var(--attn-needs-owner)",
  blocked: "var(--attn-blocked)",
  offline: "var(--text-2)",
};

export default async function RuntimePanel() {
  const home = await loadHome();
  return (
    <>
      <h1 className="page-title">Runtime / Agent</h1>
      <p className="page-sub">Second channel to your agents — local notes only, nothing is sent externally</p>

      {home.runtimes.length === 0 ? (
        <div className="panel"><div className="empty">No runtimes attached.</div></div>
      ) : (
        home.runtimes.map((rt) => (
          <div key={rt.identity} className="panel">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <SourceIcon name={runtimeIconName(rt.identity)} size={16} style={{ color: "var(--text-1)" }} />
              <div className="h2" style={{ margin: 0 }}>{rt.identity}</div>
              <span className="tag" style={{ color: HEALTH_COLOR[rt.health] }}>{rt.health}</span>
              <span className="spacer" />
              <span className="muted" style={{ fontSize: "var(--fs-sm)" }}>{rt.app_id ?? ""}</span>
            </div>
            <div className="muted" style={{ fontSize: "var(--fs-sm)", margin: "6px 0" }}>{rt.status}</div>

            {rt.input_request && (
              <div className="row" style={{ display: "block", borderColor: "var(--proof-sim)" }}>
                <div className="sec" style={{ fontWeight: 700 }}>Needs owner</div>
                <div className="muted" style={{ fontSize: "var(--fs-sm)", marginTop: 4 }}>“{rt.input_request}”</div>
              </div>
            )}

            {rt.history && rt.history.length > 0 && (
              <div style={{ margin: "10px 0" }}>
                <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 4 }}>Recent status history</div>
                {rt.history.map((h, i) => (
                  <div key={i} className="muted" style={{ fontSize: "var(--fs-sm)" }}>· {h.note}</div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 10 }}>
              <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 4 }}>Leave a note</div>
              <PostNote runtime={rt.identity} appId={rt.app_id} />
            </div>
          </div>
        ))
      )}
    </>
  );
}
