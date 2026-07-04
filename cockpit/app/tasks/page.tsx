import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import { AttentionPill, SectionHead } from "@/components/ui";
import type { Task, Workspace } from "@/lib/types";

export const dynamic = "force-dynamic";

interface Col { key: string; label: string; sub: string; match: (t: Task) => boolean }
const COLUMNS: Col[] = [
  { key: "open", label: "Open", sub: "NOT STARTED", match: (t) => ["pending", "not_started", "not yet"].includes(t.state) },
  { key: "in_progress", label: "In progress", sub: "ACTIVE", match: (t) => t.state === "in_progress" },
  { key: "review", label: "Review", sub: "AWAITING", match: (t) => ["awaiting_review", "pending_owner_context"].includes(t.state) },
  { key: "done", label: "Done", sub: "FOR SCOPE", match: (t) => /done|complete/.test(t.state) },
];

const COL_COLORS: Record<string, string> = {
  open: "var(--ink-4)",
  in_progress: "var(--accent)",
  review: "var(--attn-owner)",
  done: "var(--proof-recorded)",
};

export default async function TasksBoard() {
  const domain = await loadDomain();
  const all: { t: Task; workspace: Workspace }[] = domain.workspaces.flatMap((workspace) =>
    workspace.tasks.map((t) => ({ t, workspace }))
  );

  // catch-all: anything unmatched goes to open
  const matched = new Set<string>();
  const columns = COLUMNS.map((col) => {
    const items = all.filter(({ t }) => col.match(t));
    items.forEach(({ t }) => matched.add(t.task_id));
    return { ...col, items };
  });
  const remainder = all.filter(({ t }) => !matched.has(t.task_id));
  if (remainder.length > 0) columns[0].items.push(...remainder);

  return (
    <div style={{ padding: "34px 44px 40px" }}>
      <div style={{ font: "500 38px/1.15 var(--font-display)", letterSpacing: "-.01em" }}>Tasks</div>
      <div style={{ marginTop: 9, font: "400 13.5px var(--font-text)", color: "var(--ink-3)" }}>
        Bounded work across all Workspaces · one Agent per Task.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 28 }}>
        {columns.map((col) => (
          <div key={col.key}>
            <div style={{
              paddingBottom: 10, marginBottom: 14, borderBottom: `2px solid ${COL_COLORS[col.key]}`,
              display: "flex", alignItems: "baseline", gap: 8,
            }}>
              <span style={{ font: "700 13px var(--font-text)", color: "var(--ink-1)" }}>{col.label}</span>
              <span style={{ font: "700 9.5px var(--font-text)", letterSpacing: ".12em", color: COL_COLORS[col.key] }}>{col.sub}</span>
              <span style={{ marginLeft: "auto", font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>
                {col.items.length}
              </span>
            </div>

            {col.items.length === 0 && (
              <div style={{ padding: "16px 0", font: "400 12.5px var(--font-text)", color: "var(--ink-4)" }}>—</div>
            )}

            {col.items.map(({ t, workspace }) => (
              <Link
                key={t.task_id}
                href={`/tasks/${t.task_id}`}
                style={{
                  display: "block", padding: "13px 14px", marginBottom: 8,
                  background: "var(--paper-2)", border: "1px solid var(--line-card)",
                  boxShadow: "var(--shadow-card)", textDecoration: "none", color: "inherit",
                  transition: `box-shadow var(--t-hover) var(--ease-out)`,
                }}
              >
                <div style={{ font: "600 13px/1.4 var(--font-text)" }}>{t.objective}</div>
                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>{workspace.name}</span>
                </div>
                {t.agent && (
                  <div style={{ marginTop: 5, font: "400 11.5px var(--font-text)", color: "var(--ink-3)" }}>{t.agent}</div>
                )}
                {t.due && (
                  <div style={{ marginTop: 4, font: "400 10.5px var(--font-mono)", color: "var(--ink-4)" }}>Due {t.due}</div>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
