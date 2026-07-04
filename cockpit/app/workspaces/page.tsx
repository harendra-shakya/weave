import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import { AttentionPill, LifecycleTicks, SectionHead } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function WorkspacesPage() {
  const domain = await loadDomain();
  const ws = domain.workspaces;

  return (
    <div style={{ padding: "34px 44px 40px" }}>
      <div style={{ font: "500 38px/1.15 var(--font-display)", letterSpacing: "-.01em" }}>
        {ws.length === 0 ? "No Workspaces yet." : `${ws.length} ${ws.length === 1 ? "Workspace" : "Workspaces"} under way.`}
      </div>
      <div style={{ marginTop: 9, font: "400 13.5px var(--font-text)", color: "var(--ink-3)" }}>
        Each line is one app. Stage, open Tasks, and what — if anything — needs you.
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.2fr 2.2fr .5fr .9fr 1fr auto",
          gap: 18, padding: "0 8px 9px", borderBottom: "2px solid var(--ink-1)",
          font: "700 9.5px var(--font-text)", letterSpacing: ".14em", color: "var(--ink-3)",
        }}>
          <span>WORKSPACE</span>
          <span>LIFECYCLE</span>
          <span>TASKS</span>
          <span>PROOFS</span>
          <span>ATTENTION</span>
          <span />
        </div>

        {ws.map((w) => {
          const openTasks = w.tasks.filter((t) => !/done|complete/.test(t.state)).length;
          const recordedProofs = w.proofs.filter((p) => p.state === "recorded").length;
          const activeStage = w.stages.find((s) => s.state === "active");
          const stageLabel = activeStage
            ? `${activeStage.label} ${String(w.stages.indexOf(activeStage) + 1).padStart(2, "0")}/${w.stages.length}`
            : w.current_stage;

          return (
            <Link
              key={w.app_id}
              href={`/workspaces/${w.app_id}`}
              style={{
                display: "grid", gridTemplateColumns: "1.2fr 2.2fr .5fr .9fr 1fr auto",
                gap: 18, alignItems: "center", padding: "18px 8px",
                borderBottom: "1px solid var(--line-hair)",
                textDecoration: "none", color: "inherit",
                transition: `background var(--t-hover) var(--ease-out)`,
              }}
            >
              <span>
                <span style={{ display: "block", font: "600 15px var(--font-text)" }}>{w.name}</span>
                <span style={{ display: "block", font: "400 11.5px var(--font-text)", color: "var(--ink-4)", marginTop: 2 }}>
                  {w.owner_intent}
                </span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <LifecycleTicks stages={w.stages} />
                <span style={{ font: "500 10.5px var(--font-mono)", color: "var(--ink-3)" }}>{stageLabel}</span>
              </span>
              <span style={{ font: "500 14px var(--font-mono)", fontVariantNumeric: "tabular-nums" }}>{openTasks}</span>
              <span style={{ font: "400 11px var(--font-mono)", color: recordedProofs > 0 ? "var(--proof-recorded)" : "var(--ink-4)" }}>
                {recordedProofs > 0 ? `✓ ${recordedProofs}` : "—"}
              </span>
              <span><AttentionPill state={w.attention} /></span>
              <span style={{ font: "400 12px var(--font-mono)", color: "var(--ink-4)" }}>→</span>
            </Link>
          );
        })}

        {ws.length === 0 && (
          <div style={{ padding: "44px 8px", font: "400 13.5px var(--font-text)", color: "var(--ink-4)" }}>
            No Workspaces found. Bootstrap an app with WEAVE to begin.
          </div>
        )}
      </div>
    </div>
  );
}
