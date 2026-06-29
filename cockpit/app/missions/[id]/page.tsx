import Link from "next/link";
import { loadHome } from "@/lib/weaveHome";
import { NonClaims, ReviewLoop } from "@/components/ui";
import { SourceIcon, runtimeIconName } from "@/components/SourceIcon";

export const dynamic = "force-dynamic";

export default async function MissionDetail({ params }: { params: { id: string } }) {
  const home = await loadHome();
  let found;
  for (const room of home.rooms) {
    const m = room.missions.find((x) => x.task_id === params.id);
    if (m) { found = { m, room }; break; }
  }

  if (!found) {
    return (
      <div className="error-panel">
        <div className="lbl">Mission “{params.id}” not found</div>
        <div className="muted" style={{ marginTop: 6 }}><Link href="/missions">← Back to Missions</Link></div>
      </div>
    );
  }

  const { m, room } = found;
  const proof = room.proofs.find((p) => p.task_id === m.task_id);

  return (
    <>
      <h1 className="page-title">{m.objective}</h1>
      <p className="page-sub">{m.task_id} · Room: <Link href={`/rooms/${room.app_id}`}>{room.name}</Link> · stage: {m.stage}</p>

      <div className="grid cols-2" style={{ alignItems: "start" }}>
        <div className="scope" data-kind="allowed">
          <div className="h2">Allowed</div>
          <ul className="tight">{(m.allowed ?? []).map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
        <div className="scope" data-kind="forbidden">
          <div className="h2">Forbidden</div>
          <ul className="tight">{(m.forbidden ?? []).map((a, i) => <li key={i}>{a}</li>)}</ul>
        </div>
      </div>

      <div className="panel">
        <div className="h2">Runtime &amp; proof</div>
        <div className="kv"><span className="k">Runtime</span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            <SourceIcon name={runtimeIconName(m.runtime)} size={13} style={{ color: "var(--text-1)" }} />{m.runtime ?? "—"}
          </span>
        </div>
        <div className="kv"><span className="k">Due</span><span>{m.due ?? "—"}</span></div>
        <div className="kv"><span className="k">Proof status</span><span>{m.proof_state ?? "—"}</span></div>
        {proof && <div className="kv"><span className="k">Claim</span><span>“{proof.claim}” · <span className="mono">{proof.proof_surface}</span></span></div>}
      </div>

      <div className="panel">
        <div className="h2">Review loop</div>
        <ReviewLoop state={proof?.review_loop_state} />
      </div>

      <div className="panel">
        <NonClaims items={m.non_claims ?? room.non_claims} />
      </div>
    </>
  );
}
