import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import { AttentionPill } from "@/components/ui";
import { AttentionLegend } from "@/components/legend";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage() {
  const domain = await loadDomain();
  return (
    <>
      <h1 className="page-title">Workspaces</h1>
      <p className="page-sub">Every app workspace in your Domain</p>
      <AttentionLegend />
      <div className="panel">
        {domain.workspaces.length === 0 ? (
          <div className="empty">No Workspaces yet — bootstrap an app to begin.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Name</th><th>App ID</th><th>Stage</th><th>Open tasks</th><th>Attention</th></tr>
            </thead>
            <tbody>
              {domain.workspaces.map((w) => (
                <tr key={w.app_id}>
                  <td><Link href={`/workspaces/${w.app_id}`}>{w.name}</Link></td>
                  <td className="mono muted">{w.app_id}</td>
                  <td>{w.current_stage}</td>
                  <td>{w.tasks.filter((t) => t.state !== "done_for_scope").length}</td>
                  <td><AttentionPill state={w.attention} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
