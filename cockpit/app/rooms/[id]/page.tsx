import Link from "next/link";
import { loadHome } from "@/lib/weaveHome";
import { readOverlay } from "@/lib/overlay";
import { AttentionPill, StageRail, MirrorBadge, NonClaims } from "@/components/ui";
import { AckBlocker } from "@/components/actions";

export const dynamic = "force-dynamic";

export default async function RoomDetail({ params }: { params: { id: string } }) {
  const [home, overlay] = await Promise.all([loadHome(), readOverlay()]);
  const room = home.rooms.find((r) => r.app_id === params.id);

  if (!room) {
    return (
      <div className="error-panel">
        <div className="lbl">Room “{params.id}” not found or unreadable</div>
        <div className="muted" style={{ marginTop: 6 }}><Link href="/rooms">← Back to Rooms</Link></div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 className="page-title">{room.name}</h1>
        <AttentionPill state={room.attention} />
        <MirrorBadge mirror={room.tracker} />
      </div>
      <p className="page-sub">{room.owner_intent} · stage: {room.current_stage}</p>

      <div className="panel">
        <div className="h2">Lifecycle (11 stages)</div>
        <StageRail stages={room.stages} />
      </div>

      <div className="grid cols-3" style={{ alignItems: "start" }}>
        <div className="panel">
          <div className="h2">Active Missions</div>
          {room.missions.length === 0 ? <div className="empty">No missions recorded.</div> : room.missions.map((m) => (
            <Link key={m.task_id} href={`/missions/${m.task_id}`} className="row clickable" style={{ display: "block" }}>
              <div>{m.objective}</div>
              <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>{m.runtime ?? "—"} · proof: {m.proof_state ?? "—"}</div>
            </Link>
          ))}
        </div>

        <div className="panel">
          <div className="h2">Proof &amp; evidence</div>
          {room.proofs.length === 0 ? <div className="empty">No proof recorded yet.</div> : room.proofs.map((p, i) => (
            <div key={i} className="row" style={{ display: "block" }}>
              <div>“{p.claim}”</div>
              <div className="muted mono" style={{ fontSize: "var(--fs-sm)" }}>{p.proof_surface}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <div className="h2">Blockers</div>
          {room.blockers.length === 0 ? <div className="empty">No blockers.</div> : room.blockers.map((b) => (
            <div key={b.id} className="row" style={{ display: "block" }}>
              <AttentionPill state={b.state === "blocked_until_validated" ? "blocked" : "needs-owner"} label={b.state} />
              <div className="muted" style={{ fontSize: "var(--fs-sm)", margin: "6px 0" }}>{b.next_action}</div>
              {b.state === "open_question" && (
                <AckBlocker blockerId={b.id} appId={room.app_id} acknowledged={Boolean(overlay.acknowledgements[b.id])} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <NonClaims items={room.non_claims} />
      </div>
    </>
  );
}
