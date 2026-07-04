import { loadDomain } from "@/lib/weaveHome";
import Link from "next/link";
import { ProofTag, SectionHead, MonoMeta } from "@/components/ui";

export const dynamic = "force-dynamic";

type Filter = "all" | "recorded" | "simulated";

function ProofStateLabel({ state }: { state: string }) {
  const recorded = state === "recorded";
  return <ProofTag kind={recorded ? "recorded" : "simulated"} />;
}

export default async function ProofLedger({ searchParams }: { searchParams: { filter?: string } }) {
  const domain = await loadDomain();
  const filter = (searchParams.filter ?? "all") as Filter;

  const allProofs = domain.workspaces.flatMap((w) =>
    w.proofs.map((p) => ({ ...p, workspaceName: w.name, appId: w.app_id }))
  );

  const shown = filter === "recorded"
    ? allProofs.filter((p) => p.state === "recorded")
    : filter === "simulated"
    ? allProofs.filter((p) => p.state !== "recorded")
    : allProofs;

  const recordedCount = allProofs.filter((p) => p.state === "recorded").length;
  const simCount = allProofs.filter((p) => p.state !== "recorded").length;

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "ALL", count: allProofs.length },
    { key: "recorded", label: "RECORDED", count: recordedCount },
    { key: "simulated", label: "SIMULATED", count: simCount },
  ];

  return (
    <div style={{ padding: "34px 44px 40px" }}>
      <div style={{ font: "500 38px/1.15 var(--font-display)", letterSpacing: "-.01em" }}>Proof Ledger</div>
      <div style={{ marginTop: 9, font: "400 13.5px var(--font-text)", color: "var(--ink-3)" }}>
        Every claim and its evidence · what was proven and what was not.
      </div>

      {/* filter chips */}
      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        {filters.map((f) => (
          <Link
            key={f.key}
            href={`/proof?filter=${f.key}`}
            className="filter-chip"
            data-active={filter === f.key ? "true" : undefined}
            style={{ textDecoration: "none" }}
          >
            {f.label} · {f.count}
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, marginTop: 24, alignItems: "start" }}>
        {/* proof rows */}
        <div>
          <SectionHead label="PROOFS" right={`${shown.length} SHOWN`} />

          {shown.length === 0 && (
            <div style={{ padding: "26px 0", font: "400 13.5px var(--font-text)", color: "var(--ink-4)" }}>
              No Proofs match this filter.
            </div>
          )}

          {shown.map((p, i) => (
            <div key={i} style={{ padding: "18px 0", borderBottom: "1px solid var(--line-hair)" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <ProofStateLabel state={p.state} />
                <div style={{ flex: 1 }}>
                  <div style={{ font: "500 15px/1.4 var(--font-text)" }}>"{p.claim}"</div>
                  <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <MonoMeta>{p.proof_surface}</MonoMeta>
                    <Link href={`/workspaces/${p.appId}`} style={{ font: "400 12px var(--font-text)", color: "var(--ink-3)", textDecoration: "none" }}>
                      {p.workspaceName}
                    </Link>
                    {p.task_id && (
                      <Link href={`/tasks/${p.task_id}`} style={{ font: "400 10.5px var(--font-mono)", color: "var(--ink-4)", textDecoration: "none" }}>
                        {p.task_id}
                      </Link>
                    )}
                  </div>
                  {p.artifact_refs.length > 0 && (
                    <div style={{ marginTop: 6, font: "400 10.5px var(--font-mono)", color: "var(--ink-4)" }}>
                      {p.artifact_refs.join(" · ")}
                    </div>
                  )}
                  {p.non_claims.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ font: "700 9.5px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-4)", marginBottom: 6 }}>NON-CLAIMS</div>
                      {p.non_claims.map((nc, j) => (
                        <div key={j} style={{ font: "italic 400 12px/1.55 var(--font-display)", color: "var(--ink-4)", paddingBottom: 4 }}>○ {nc}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* event log */}
        <div>
          <SectionHead label="EVENT LOG" right="APPEND-ONLY · NEWEST FIRST" />
          <div style={{ display: "grid", gap: 0 }}>
            {domain.events.map((e, i) => (
              <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid var(--line-hair)" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <MonoMeta>{e.at.slice(11, 16)}</MonoMeta>
                  {e.simulated && <span className="sim-chip">SIM</span>}
                  <span style={{ font: "500 11.5px var(--font-mono)", color: "var(--ink-2)" }}>{e.event}</span>
                </div>
                {(e.intent || e.app_id) && (
                  <div style={{ marginTop: 4, font: "400 11.5px/1.45 var(--font-text)", color: "var(--ink-3)", paddingLeft: 34 }}>
                    {e.app_id && <span style={{ font: "400 10.5px var(--font-mono)", color: "var(--ink-4)", marginRight: 8 }}>{e.app_id}</span>}
                    {e.intent}
                  </div>
                )}
              </div>
            ))}
            {domain.events.length === 0 && (
              <div style={{ padding: "16px 0", font: "400 12.5px var(--font-text)", color: "var(--ink-4)" }}>
                No events recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
