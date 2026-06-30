import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import { contextPackOf } from "@/lib/types";
import { NonClaims, ReviewLoop, ContextPack } from "@/components/ui";
import { SourceIcon, agentIconName } from "@/components/SourceIcon";

export const dynamic = "force-dynamic";

export default async function TaskDetail({ params }: { params: { id: string } }) {
  const domain = await loadDomain();
  let found;
  for (const workspace of domain.workspaces) {
    const t = workspace.tasks.find((x) => x.task_id === params.id);
    if (t) { found = { t, workspace }; break; }
  }

  if (!found) {
    return (
      <div className="error-panel">
        <div className="lbl">Task “{params.id}” not found</div>
        <div className="muted" style={{ marginTop: 6 }}><Link href="/tasks">← Back to Tasks</Link></div>
      </div>
    );
  }

  const { t, workspace } = found;
  const proof = workspace.proofs.find((p) => p.task_id === t.task_id);

  return (
    <>
      <h1 className="page-title">{t.objective}</h1>
      <p className="page-sub">{t.task_id} · Workspace: <Link href={`/workspaces/${workspace.app_id}`}>{workspace.name}</Link> · stage: {t.stage}</p>

      <ContextPack pack={contextPackOf(t)} />

      <div className="panel">
        <div className="h2">Agent &amp; proof</div>
        <div className="kv"><span className="k">Agent</span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <SourceIcon name={agentIconName(t.agent)} size={13} style={{ color: "var(--text-1)" }} />{t.agent ?? "—"}
          </span>
        </div>
        <div className="kv"><span className="k">Due</span><span>{t.due ?? "—"}</span></div>
        <div className="kv"><span className="k">Proof status</span><span>{t.proof_state ?? "—"}</span></div>
        {proof && <div className="kv"><span className="k">Claim</span><span>“{proof.claim}” · <span className="mono">{proof.proof_surface}</span></span></div>}
      </div>

      <div className="panel">
        <div className="h2">Review loop</div>
        <ReviewLoop state={proof?.review_loop_state} />
      </div>

      {proof && (
        <div className="panel">
          <NonClaims items={proof.non_claims} label="Not proven by this proof" />
        </div>
      )}
    </>
  );
}
