import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import type { Task, Workspace } from "@/lib/types";

export const dynamic = "force-dynamic";

const COLUMNS: { key: string; label: string; match: (t: Task) => boolean }[] = [
  { key: "open", label: "Open", match: (t) => ["pending", "blocked", "not_started"].includes(t.state) },
  { key: "in_progress", label: "In progress", match: (t) => t.state === "in_progress" },
  { key: "review", label: "Ready for review", match: (t) => ["awaiting_review"].includes(t.state) },
  { key: "done", label: "Done for scope", match: (t) => t.state === "done_for_scope" },
];

export default async function TasksBoard() {
  const domain = await loadDomain();
  const all: { t: Task; workspace: Workspace }[] = domain.workspaces.flatMap((workspace) =>
    workspace.tasks.map((t) => ({ t, workspace }))
  );

  return (
    <>
      <h1 className="page-title">Tasks</h1>
      <p className="page-sub">Bounded work across all Workspaces</p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {COLUMNS.map((col) => {
          const items = all.filter(({ t }) => col.match(t));
          return (
            <div key={col.key} className="panel">
              <div className="h2">{col.label}</div>
              {items.length === 0 ? (
                <div className="empty" style={{ padding: "var(--sp-3)" }}>—</div>
              ) : (
                items.map(({ t, workspace }) => (
                  <Link key={t.task_id} href={`/tasks/${t.task_id}`} className="row clickable" style={{ display: "block" }}>
                    <div style={{ fontSize: "var(--fs-sm)" }}>{t.objective}</div>
                    <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 4 }}>
                      {workspace.name} · {t.agent ?? "—"} · due {t.due ?? "—"}
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
