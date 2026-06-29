import Link from "next/link";
import { loadHome } from "@/lib/weaveHome";
import { ATTENTION_PRIORITY, attentionLabel, compareAttention } from "@/lib/attention";
import { AttentionPill } from "@/components/ui";
import { AttentionLegend } from "@/components/legend";
import { SourceIcon, runtimeIconName } from "@/components/SourceIcon";

export const dynamic = "force-dynamic";

const HEALTH_COLOR: Record<string, string> = {
  healthy: "var(--proof-real)",
  idle: "var(--attn-needs-owner)",
  blocked: "var(--attn-blocked)",
  offline: "var(--text-2)",
};

export default async function CommandCenter() {
  const home = await loadHome();
  const rooms = home.rooms;

  const counts = {
    activeRooms: rooms.length,
    openMissions: rooms.reduce((n, r) => n + r.missions.filter((m) => m.state !== "done_for_scope").length, 0),
    approvals: rooms.filter((r) => r.attention === "approval").length,
    blocked: rooms.filter((r) => r.attention === "blocked").length,
    ready: rooms.filter((r) => r.attention === "ready").length,
  };

  const attentionItems = rooms
    .filter((r) => r.attention !== "none")
    .sort((a, b) => compareAttention(a.attention, b.attention))
    .map((r) => ({
      app_id: r.app_id,
      name: r.name,
      attention: r.attention,
      reason: r.next_action || r.state,
      href:
        r.attention === "approval" || r.attention === "blocked"
          ? "/gates"
          : `/rooms/${r.app_id}`,
    }));

  return (
    <>
      <h1 className="page-title">Command Center</h1>
      <p className="page-sub">What needs you right now — across all Rooms</p>
      <AttentionLegend />

      <div className="kpi-strip">
        <div className="kpi"><div className="num">{counts.activeRooms}</div><div className="lbl">Active Rooms</div></div>
        <div className="kpi"><div className="num">{counts.openMissions}</div><div className="lbl">Open Missions</div></div>
        <div className="kpi"><div className="num" style={{ color: "var(--attn-approval)" }}>{counts.approvals}</div><div className="lbl">Needs-owner approvals</div></div>
        <div className="kpi"><div className="num" style={{ color: "var(--attn-blocked)" }}>{counts.blocked}</div><div className="lbl">Blocked</div></div>
        <div className="kpi"><div className="num" style={{ color: "var(--attn-ready)" }}>{counts.ready}</div><div className="lbl">Ready for review</div></div>
      </div>

      <div className="grid cols-2" style={{ gridTemplateColumns: "1.5fr 1fr", alignItems: "start" }}>
        <div className="panel">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="h2">Needs your attention</div>
            <span className="spacer" />
            <span className="muted" style={{ fontSize: "var(--fs-sm)" }}>severity-sorted · click to open</span>
          </div>
          {attentionItems.length === 0 ? (
            <div className="empty">All clear — nothing needs you.</div>
          ) : (
            attentionItems.map((it) => (
              <Link key={it.app_id} href={it.href} className="row clickable">
                <AttentionPill state={it.attention} />
                <div>
                  <div>{it.name}</div>
                  <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>{it.reason}</div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div>
          <div className="panel">
            <div className="h2">Active Rooms</div>
            <div className="grid cols-2">
              {rooms.map((r) => (
                <Link key={r.app_id} href={`/rooms/${r.app_id}`} className="row clickable" style={{ display: "block" }}>
                  <div>{r.name}</div>
                  <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 6 }}>stage: {r.current_stage}</div>
                  <AttentionPill state={r.attention} />
                </Link>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="h2">Latest runtime checkpoints</div>
            {home.runtimes.map((rt) => (
              <div key={rt.identity} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span className="dot" style={{ background: HEALTH_COLOR[rt.health], marginTop: 6 }} />
                <SourceIcon name={runtimeIconName(rt.identity)} size={14} style={{ marginTop: 4, color: "var(--text-1)" }} />
                <div>
                  <div className="sec">{rt.identity}</div>
                  <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>{rt.health} · {rt.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
