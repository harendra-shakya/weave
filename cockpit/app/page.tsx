import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import { compareAttention } from "@/lib/attention";
import { AttentionPill, DomainNode } from "@/components/ui";
import { AttentionLegend } from "@/components/legend";
import { SourceIcon, agentIconName } from "@/components/SourceIcon";

export const dynamic = "force-dynamic";

const HEALTH_COLOR: Record<string, string> = {
  healthy: "var(--proof-real)",
  idle: "var(--attn-needs-owner)",
  blocked: "var(--attn-blocked)",
  offline: "var(--text-2)",
};

export default async function CommandCenter() {
  const domain = await loadDomain();
  const workspaces = domain.workspaces;

  const counts = {
    activeWorkspaces: workspaces.length,
    openTasks: workspaces.reduce((n, w) => n + w.tasks.filter((t) => t.state !== "done_for_scope").length, 0),
    approvals: workspaces.filter((w) => w.attention === "approval").length,
    blocked: workspaces.filter((w) => w.attention === "blocked").length,
    ready: workspaces.filter((w) => w.attention === "ready").length,
  };

  const attentionItems = workspaces
    .filter((w) => w.attention !== "none")
    .sort((a, b) => compareAttention(a.attention, b.attention))
    .map((w) => ({
      app_id: w.app_id,
      name: w.name,
      attention: w.attention,
      reason: w.next_action || w.state,
      href:
        w.attention === "approval" || w.attention === "blocked"
          ? "/gates"
          : `/workspaces/${w.app_id}`,
    }));

  return (
    <>
      <h1 className="page-title">Command Center</h1>
      <p className="page-sub">What needs you right now — across all Workspaces</p>
      <DomainNode state={domain.state} node={domain.node} />
      <AttentionLegend />

      <div className="kpi-strip">
        <div className="kpi"><div className="num">{counts.activeWorkspaces}</div><div className="lbl">Active Workspaces</div></div>
        <div className="kpi"><div className="num">{counts.openTasks}</div><div className="lbl">Open Tasks</div></div>
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
            <div className="h2">Active Workspaces</div>
            <div className="grid cols-2">
              {workspaces.map((w) => (
                <Link key={w.app_id} href={`/workspaces/${w.app_id}`} className="row clickable" style={{ display: "block" }}>
                  <div>{w.name}</div>
                  <div className="muted" style={{ fontSize: "var(--fs-sm)", marginBottom: 6 }}>stage: {w.current_stage}</div>
                  <AttentionPill state={w.attention} />
                </Link>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="h2">Latest Agent checkpoints</div>
            {domain.agents.map((ag) => (
              <div key={ag.identity} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
                <span className="dot" style={{ background: HEALTH_COLOR[ag.health], marginTop: 6 }} />
                <SourceIcon name={agentIconName(ag.identity)} size={14} style={{ marginTop: 4, color: "var(--text-1)" }} />
                <div>
                  <div className="sec">{ag.identity}</div>
                  <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>{ag.health} · {ag.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
