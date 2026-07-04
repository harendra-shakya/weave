import { loadDomain } from "@/lib/weaveHome";
import { AttentionPill, SectionHead, MonoMeta } from "@/components/ui";
import { PostNote } from "@/components/actions";

export const dynamic = "force-dynamic";

const HEALTH_BG: Record<string, string> = {
  healthy: "var(--proof-recorded)",
  idle: "transparent",
  blocked: "var(--attn-blocked)",
  offline: "transparent",
};
const HEALTH_BORDER: Record<string, string> = {
  healthy: "none",
  idle: "1.5px solid var(--ink-4)",
  blocked: "none",
  offline: "1.5px solid var(--line-mid)",
};
const HEALTH_LABEL: Record<string, string> = {
  healthy: "HEALTHY", idle: "IDLE", blocked: "BLOCKED", offline: "OFFLINE",
};

export default async function AgentsPanel() {
  const domain = await loadDomain();
  const agents = domain.agents;

  const inputRequired = agents.filter((a) => a.input_request);

  return (
    <div style={{ padding: "34px 44px 40px" }}>
      <div style={{ font: "500 38px/1.15 var(--font-display)", letterSpacing: "-.01em" }}>
        {agents.length === 0 ? "No Agents." : `${agents.length} ${agents.length === 1 ? "Agent" : "Agents"}`}
        {inputRequired.length > 0 && (
          <span style={{ marginLeft: 16, font: "500 22px var(--font-display)", color: "var(--attn-owner)" }}>
            — {inputRequired.length} waiting for you
          </span>
        )}
      </div>
      <div style={{ marginTop: 9, font: "400 13.5px var(--font-text)", color: "var(--ink-3)" }}>
        Second channel to your Agents · notes are local only, nothing is sent externally.
      </div>

      {agents.length === 0 && (
        <div style={{ marginTop: 28, padding: "40px 0", font: "400 13.5px var(--font-text)", color: "var(--ink-4)" }}>
          No Agents attached to this Domain.
        </div>
      )}

      <div style={{ display: "grid", gap: 20, marginTop: 28, maxWidth: 860 }}>
        {agents.map((ag) => (
          <div
            key={ag.identity}
            style={{
              padding: "22px 28px",
              background: "var(--paper-2)",
              border: ag.input_request ? "1.5px solid var(--accent)" : "1px solid var(--line-card)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {/* agent header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  width: 9, height: 9, borderRadius: "50%",
                  background: HEALTH_BG[ag.health] ?? "transparent",
                  border: HEALTH_BORDER[ag.health] ?? "1.5px solid var(--line-mid)",
                  display: "inline-block", flexShrink: 0,
                }} />
                <span style={{ font: "700 17px var(--font-text)" }}>{ag.identity}</span>
              </div>
              <span style={{ font: "600 9.5px var(--font-text)", letterSpacing: ".13em", color: HEALTH_BG[ag.health] !== "transparent" ? HEALTH_BG[ag.health] : "var(--ink-4)" }}>
                {HEALTH_LABEL[ag.health] ?? ag.health.toUpperCase()}
              </span>
              <span style={{ marginLeft: "auto", font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>
                {ag.task_ref ?? "—"} {ag.app_id ? `· ${ag.app_id}` : ""}
              </span>
            </div>

            <div style={{ marginTop: 8, font: "400 13.5px var(--font-text)", color: "var(--ink-2)" }}>
              {ag.status}
            </div>

            {/* open question */}
            {ag.input_request && (
              <div style={{ marginTop: 16, padding: "14px 18px", background: "var(--attn-owner-wash)", border: "1px solid var(--accent-wash)" }}>
                <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 6 }}>◉ AWAITING YOUR INPUT</div>
                <div style={{ font: "500 15px/1.5 var(--font-display)" }}>"{ag.input_request}"</div>
                <div style={{ marginTop: 6, font: "400 12px var(--font-text)", color: "var(--ink-3)" }}>
                  Paused until you respond · answer via Tasks or the note below.
                </div>
              </div>
            )}

            {/* history */}
            {ag.history && ag.history.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-3)", marginBottom: 8 }}>RECENT HISTORY</div>
                {ag.history.slice(0, 5).map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid var(--line-hair)" }}>
                    <MonoMeta>{h.at.slice(11, 16)}</MonoMeta>
                    <span style={{ font: "400 12.5px/1.4 var(--font-text)", color: "var(--ink-2)" }}>{h.note}</span>
                  </div>
                ))}
              </div>
            )}

            {/* note composer */}
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line-hair)" }}>
              <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-3)", marginBottom: 10 }}>LEAVE A NOTE</div>
              <PostNote agent={ag.identity} appId={ag.app_id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
