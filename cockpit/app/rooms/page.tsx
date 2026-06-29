import Link from "next/link";
import { loadHome } from "@/lib/weaveHome";
import { AttentionPill } from "@/components/ui";
import { AttentionLegend } from "@/components/legend";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const home = await loadHome();
  return (
    <>
      <h1 className="page-title">Rooms</h1>
      <p className="page-sub">Every app workspace in your company graph</p>
      <AttentionLegend />
      <div className="panel">
        {home.rooms.length === 0 ? (
          <div className="empty">No Rooms yet — bootstrap an app to begin.</div>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Name</th><th>App ID</th><th>Stage</th><th>Open missions</th><th>Attention</th></tr>
            </thead>
            <tbody>
              {home.rooms.map((r) => (
                <tr key={r.app_id}>
                  <td><Link href={`/rooms/${r.app_id}`}>{r.name}</Link></td>
                  <td className="mono muted">{r.app_id}</td>
                  <td>{r.current_stage}</td>
                  <td>{r.missions.filter((m) => m.state !== "done_for_scope").length}</td>
                  <td><AttentionPill state={r.attention} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
