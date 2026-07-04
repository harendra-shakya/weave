import { loadDomain } from "@/lib/weaveHome";
import { readOverlay } from "@/lib/overlay";
import { MirrorBadge, SectionHead, MonoMeta } from "@/components/ui";
import { ResetOverlay } from "@/components/actions";

export const dynamic = "force-dynamic";

const CONN_COLOR: Record<string, string> = {
  connected: "var(--proof-recorded)", simulated: "var(--attn-approval)", disconnected: "var(--ink-4)",
};

export default async function Settings() {
  const [domain, overlay] = await Promise.all([loadDomain(), readOverlay()]);

  const decidedGates = Object.keys(overlay.gates).length;
  const postedNotes = overlay.notes.length;
  const acceptedReviews = Object.keys(overlay.reviewsAccepted ?? {}).length;
  const answeredTasks = Object.keys(overlay.taskAnswers ?? {}).length;
  const overlayEvents = overlay.events.length;

  return (
    <div style={{ padding: "34px 44px 40px" }}>
      <div style={{ font: "500 38px/1.15 var(--font-display)", letterSpacing: "-.01em" }}>Settings</div>
      <div style={{ marginTop: 9, font: "400 13.5px var(--font-text)", color: "var(--ink-3)" }}>
        Make the proof boundary explicit and honest. All decisions are local — nothing reaches external systems.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginTop: 28, alignItems: "start" }}>
        {/* left column */}
        <div style={{ display: "grid", gap: 24 }}>
          {/* data source */}
          <div>
            <SectionHead label="DATA SOURCE" />
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {(["fixture", "live"] as const).map((src) => (
                <div
                  key={src}
                  style={{
                    padding: "14px 18px",
                    background: domain.source === src ? "var(--accent-wash)" : "var(--paper-2)",
                    border: `1.5px solid ${domain.source === src ? "var(--accent)" : "var(--line-card)"}`,
                    display: "flex", alignItems: "baseline", gap: 12,
                  }}
                >
                  <span style={{ font: "600 11px var(--font-mono)", letterSpacing: ".08em", color: domain.source === src ? "var(--accent)" : "var(--ink-4)" }}>
                    {domain.source === src ? "●" : "○"}
                  </span>
                  <div>
                    <div style={{ font: "700 13px var(--font-text)" }}>
                      {src === "fixture" ? "Fixture data" : "Live local Domain"}
                      {domain.source === src && <span style={{ font: "600 10px var(--font-text)", letterSpacing: ".1em", color: "var(--accent)", marginLeft: 8 }}>ACTIVE</span>}
                    </div>
                    <div style={{ font: "400 12px var(--font-text)", color: "var(--ink-3)", marginTop: 2 }}>
                      {src === "fixture" ? "Bundled demo Domain — safe to explore" : "Set WEAVE_HOME env var to a real runs/ directory"}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 2px" }}>
                <span style={{ font: "600 10px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-3)" }}>RESOLVED PATH</span>
                <MonoMeta>{domain.source_path}</MonoMeta>
              </div>
            </div>
          </div>

          {/* node */}
          {domain.node && (
            <div>
              <SectionHead label="NODE" />
              <div style={{ marginTop: 14, display: "grid", gap: 0 }}>
                {[
                  ["Node ID", domain.node.node_id],
                  ["Kind", domain.node.kind],
                  ["Host", domain.node.host],
                  ["State path", domain.node.state_path],
                  ["Agents hosted", domain.node.hosts_agents.join(", ") || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "10px 0", borderBottom: "1px solid var(--line-hair)" }}>
                    <span style={{ font: "600 11px var(--font-text)", letterSpacing: ".08em", color: "var(--ink-3)" }}>{k}</span>
                    <MonoMeta>{v}</MonoMeta>
                  </div>
                ))}
              </div>
              {domain.node.non_claims.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ font: "700 9.5px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-4)", marginBottom: 6 }}>NODE NON-CLAIMS</div>
                  {domain.node.non_claims.map((nc, i) => (
                    <div key={i} style={{ font: "italic 400 12px/1.5 var(--font-display)", color: "var(--ink-4)", padding: "4px 0" }}>○ {nc}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* overlay stats */}
          <div>
            <SectionHead label="LOCAL OVERLAY" />
            <div style={{ marginTop: 14, display: "grid", gap: 0 }}>
              {[
                ["Gate decisions", String(decidedGates)],
                ["Notes posted", String(postedNotes)],
                ["Reviews accepted", String(acceptedReviews)],
                ["Questions answered", String(answeredTasks)],
                ["Events logged", String(overlayEvents)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "9px 0", borderBottom: "1px solid var(--line-hair)" }}>
                  <span style={{ font: "600 11px var(--font-text)", letterSpacing: ".08em", color: "var(--ink-3)" }}>{k}</span>
                  <span style={{ font: "500 14px var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line-hair)" }}>
              <div style={{ font: "400 12.5px var(--font-text)", color: "var(--ink-3)", marginBottom: 12 }}>
                Resetting clears all decisions, notes, and answers from the local overlay. The WEAVE state directory is untouched.
              </div>
              <ResetOverlay />
            </div>
          </div>
        </div>

        {/* right column */}
        <div style={{ display: "grid", gap: 24 }}>
          {/* mirrors */}
          <div>
            <SectionHead label="MIRRORS" />
            <div style={{ marginTop: 6, font: "400 12.5px var(--font-text)", color: "var(--ink-3)", marginBottom: 14 }}>
              Reflect or carry state — never the source of truth. Writes are SIMULATED only.
            </div>
            {domain.mirrors.map((m) => (
              <div key={m.tool} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--line-hair)", gap: 14 }}>
                <MirrorBadge tool={m.tool} />
                <span style={{ marginLeft: "auto", font: "600 10px var(--font-text)", letterSpacing: ".1em", color: CONN_COLOR[m.connection] }}>
                  {m.connection.toUpperCase()}
                </span>
                <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>{m.kind}</span>
              </div>
            ))}
            {domain.mirrors.length === 0 && (
              <div style={{ padding: "14px 0", font: "400 12.5px var(--font-text)", color: "var(--ink-4)" }}>No Mirrors configured.</div>
            )}
          </div>

          {/* proof boundary */}
          <div>
            <SectionHead label="PROOF BOUNDARY" />
            <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
              {[
                "Local-only cockpit — reads and writes files on this machine only.",
                "No secrets are read, requested, or shown.",
                "External actions (deploy, Slack, Linear, GitHub) are SIMULATED only.",
                "Owner decisions persist to a local overlay file — survives refresh and restart.",
                "Not production · not externally verified.",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, font: "400 13px/1.55 var(--font-text)", color: "var(--ink-2)" }}>
                  <span style={{ font: "600 11px var(--font-mono)", color: "var(--ink-4)", flexShrink: 0 }}>○</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* domain non-claims */}
          {domain.non_claims.length > 0 && (
            <div>
              <SectionHead label="DOMAIN NON-CLAIMS" />
              <div style={{ marginTop: 12, display: "grid", gap: 0 }}>
                {domain.non_claims.map((nc, i) => (
                  <div key={i} style={{ font: "italic 400 13px/1.6 var(--font-display)", color: "var(--ink-3)", padding: "8px 0", borderBottom: "1px solid var(--line-hair)" }}>
                    ○ {nc}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* about */}
          <div style={{ padding: "16px 20px", background: "var(--paper-0)", border: "1px solid var(--line-hair)" }}>
            <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".14em", color: "var(--ink-3)", marginBottom: 8 }}>ABOUT</div>
            <div style={{ font: "400 12.5px/1.6 var(--font-text)", color: "var(--ink-2)" }}>
              WEAVE 0.2 · Owner Cockpit · Local Sprint Deliverable
            </div>
            <div style={{ marginTop: 4, font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>
              Not production · not externally verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
