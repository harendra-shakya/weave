import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import { readOverlay } from "@/lib/overlay";
import { AttentionPill, StageRail, MirrorBadge, NonClaims } from "@/components/ui";
import { AckBlocker } from "@/components/actions";

export const dynamic = "force-dynamic";

export default async function WorkspaceDetail({ params }: { params: { id: string } }) {
  const [domain, overlay] = await Promise.all([loadDomain(), readOverlay()]);
  const workspace = domain.workspaces.find((w) => w.app_id === params.id);

  if (!workspace) {
    return (
      <div className="error-panel">
        <div className="lbl">Workspace “{params.id}” not found or unreadable</div>
        <div className="muted" style={{ marginTop: 6 }}><Link href="/workspaces">← Back to Workspaces</Link></div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 className="page-title">{workspace.name}</h1>
        <AttentionPill state={workspace.attention} />
        <MirrorBadge mirror={workspace.tracker} />
      </div>
      <p className="page-sub">{workspace.owner_intent} · stage: {workspace.current_stage}</p>

      <div className="panel">
        <div className="h2">Lifecycle (11 stages)</div>
        <StageRail stages={workspace.stages} />
      </div>

      <div className="grid cols-3" style={{ alignItems: "start" }}>
        <div className="panel">
          <div className="h2">Active Tasks</div>
          {workspace.tasks.length === 0 ? <div className="empty">No tasks recorded.</div> : workspace.tasks.map((t) => (
            <Link key={t.task_id} href={`/tasks/${t.task_id}`} className="row clickable" style={{ display: "block" }}>
              <div>{t.objective}</div>
              <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>{t.agent ?? "—"} · proof: {t.proof_state ?? "—"}</div>
            </Link>
          ))}
        </div>

        <div className="panel">
          <div className="h2">Proof &amp; evidence</div>
          {workspace.proofs.length === 0 ? <div className="empty">No proof recorded yet.</div> : workspace.proofs.map((p, i) => (
            <div key={i} className="row" style={{ display: "block" }}>
              <div>“{p.claim}”</div>
              <div className="muted mono" style={{ fontSize: "var(--fs-sm)" }}>{p.proof_surface}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="h2">Blockers</div>
          {workspace.blockers.length === 0 ? <div className="empty">No blockers.</div> : workspace.blockers.map((b) => (
            <div key={b.id} className="row" style={{ display: "block" }}>
              <AttentionPill state={b.state === "blocked_until_validated" ? "blocked" : "needs-owner"} label={b.state} />
              <div className="muted" style={{ fontSize: "var(--fs-sm)", margin: "6px 0" }}>{b.next_action}</div>
              {b.state === "open_question" && (
                <AckBlocker blockerId={b.id} appId={workspace.app_id} acknowledged={Boolean(overlay.acknowledgements[b.id])} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <NonClaims items={workspace.non_claims} />
      </div>
    </>
  );
}
