import Link from "next/link";
import { loadHome } from "@/lib/weaveHome";
import type { Mission, Room } from "@/lib/types";

export const dynamic = "force-dynamic";

const COLUMNS: { key: string; label: string; match: (m: Mission) => boolean }[] = [
  { key: "open", label: "Open", match: (m) => ["pending", "blocked", "not_started"].includes(m.state) },
  { key: "in_progress", label: "In progress", match: (m) => m.state === "in_progress" },
  { key: "review", label: "Ready for review", match: (m) => ["awaiting_review"].includes(m.state) },
  { key: "done", label: "Done for scope", match: (m) => m.state === "done_for_scope" },
];

export default async function MissionsBoard() {
  const home = await loadHome();
  const all: { m: Mission; room: Room }[] = home.rooms.flatMap((room) =>
    room.missions.map((m) => ({ m, room }))
  );

  return (
    <>
      <h1 className="page-title">Missions</h1>
      <p className="page-sub">Bounded work packets across all Rooms</p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {COLUMNS.map((col) => {
          const items = all.filter(({ m }) => col.match(m));
          return (
            <div key={col.key} className="panel">
              <div className="h2">{col.label}</div>
              {items.length === 0 ? (
                <div className="empty" style={{ padding: "var(--sp-3)" }}>—</div>
              ) : (
                items.map(({ m, room }) => (
                  <Link key={m.task_id} href={`/missions/${m.task_id}`} className="row clickable" style={{ display: "block" }}>
                    <div style={{ fontSize: "var(--fs-sm)" }}>{m.objective}</div>
                    <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 4 }}>
                      {room.name} · {m.runtime ?? "—"} · due {m.due ?? "—"}
                    </div>
                  </Link>
                ))
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
