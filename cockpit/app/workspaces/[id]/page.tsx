import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import { readOverlay } from "@/lib/overlay";
import { AttentionPill, StageRail, MirrorBadge, ProofTag, ContextPack, SectionHead, MonoMeta } from "@/components/ui";
import { AckBlocker, AcceptReview } from "@/components/actions";

export const dynamic = "force-dynamic";

export default async function WorkspaceDetail({ params }: { params: { id: string } }) {
  const [domain, overlay] = await Promise.all([loadDomain(), readOverlay()]);
  const workspace = domain.workspaces.find((w) => w.app_id === params.id);

  if (!workspace) {
    return (
      <div style={{ padding: "44px", font: "500 20px var(--font-display)" }}>
        Workspace "{params.id}" not found.{" "}
        <Link href="/workspaces" style={{ font: "400 13.5px var(--font-text)", color: "var(--accent)" }}>← Back</Link>
      </div>
    );
  }

  const activeTask = workspace.tasks.find((t) => t.state === "in_progress");
  const blockedTasks = workspace.tasks.filter((t) => t.state === "blocked");
  const openTasks = workspace.tasks.filter((t) => !/done|complete/.test(t.state));
  const recordedProofs = workspace.proofs.filter((p) => p.state === "recorded");
  const pendingReview = workspace.reviews.find((r) => /pending/i.test(r.state));

  return (
    <div style={{ padding: "34px 44px 40px" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ font: "500 38px/1.1 var(--font-display)", letterSpacing: "-.01em" }}>{workspace.name}</div>
          <div style={{ marginTop: 8, font: "400 13.5px var(--font-text)", color: "var(--ink-3)" }}>
            {workspace.owner_intent}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
          <AttentionPill state={workspace.attention} />
          {workspace.tracker && <MirrorBadge tool={workspace.tracker.tool} />}
        </div>
      </div>

      {/* lifecycle rail */}
      <div style={{ marginTop: 30, padding: "22px 0 28px", borderTop: "1px solid var(--line-hair)", borderBottom: "1px solid var(--line-hair)" }}>
        <SectionHead label="LIFECYCLE" right={`${workspace.current_stage.toUpperCase()} · ACTIVE STAGE`} />
        <StageRail stages={workspace.stages} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 370px", gap: 40, marginTop: 28, alignItems: "start" }}>
        {/* left */}
        <div style={{ display: "grid", gap: 28 }}>
          {/* blockers */}
          {workspace.blockers.length > 0 && (
            <div>
              <SectionHead label="BLOCKERS" />
              {workspace.blockers.map((b) => (
                <div key={b.id} style={{
                  padding: "18px 22px", marginTop: 12,
                  background: b.state === "blocked_until_validated" ? "var(--attn-blocked-wash)" : "var(--paper-2)",
                  border: `1.5px solid ${b.state === "blocked_until_validated" ? "var(--attn-blocked)" : "var(--line-mid)"}`,
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                    <AttentionPill state={b.state === "blocked_until_validated" ? "blocked" : "needs-owner"} />
                    <MonoMeta>{b.id}</MonoMeta>
                  </div>
                  <div style={{ marginTop: 10, font: "400 13.5px/1.55 var(--font-text)", color: "var(--ink-2)" }}>
                    {b.next_action}
                  </div>
                  {b.state === "open_question" && (
                    <AckBlocker
                      blockerId={b.id}
                      appId={workspace.app_id}
                      acknowledged={Boolean(overlay.acknowledgements[b.id])}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* tasks */}
          <div>
            <SectionHead label="ACTIVE TASKS" right={`${openTasks.length} OPEN`} />
            {openTasks.length === 0 && (
              <div style={{ padding: "18px 0", font: "400 13.5px var(--font-text)", color: "var(--ink-4)" }}>
                No open tasks in this Workspace.
              </div>
            )}
            {openTasks.map((t) => (
              <Link
                key={t.task_id}
                href={`/tasks/${t.task_id}`}
                style={{
                  display: "block", padding: "15px 0", borderBottom: "1px solid var(--line-hair)",
                  textDecoration: "none", color: "inherit",
                }}
              >
                <div style={{ font: "600 14.5px var(--font-text)" }}>{t.objective}</div>
                <div style={{ display: "flex", gap: 14, marginTop: 5, alignItems: "center" }}>
                  <MonoMeta>{t.task_id}</MonoMeta>
                  {t.agent && <span style={{ font: "400 12px var(--font-text)", color: "var(--ink-3)" }}>{t.agent}</span>}
                  {t.state && <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>{t.state}</span>}
                </div>
              </Link>
            ))}
          </div>

          {/* pending review */}
          {pendingReview && (
            <div style={{ padding: "18px 22px", background: "var(--attn-review-wash)", border: "1.5px solid var(--attn-review)" }}>
              <SectionHead label="PENDING REVIEW" style={{ borderColor: "var(--attn-review)" }} />
              <div style={{ marginTop: 14, font: "400 13.5px/1.55 var(--font-text)", color: "var(--ink-2)" }}>
                State: {pendingReview.state} · {pendingReview.id}
              </div>
              {pendingReview.loop.length > 0 && (
                <div style={{ marginTop: 8, font: "400 11px var(--font-mono)", color: "var(--ink-3)" }}>
                  Loop: {pendingReview.loop.join(" → ")}
                </div>
              )}
              <div style={{ marginTop: 14 }}>
                <AcceptReview
                  reviewId={pendingReview.id}
                  appId={workspace.app_id}
                  accepted={Boolean(overlay.reviewsAccepted?.[pendingReview.id])}
                />
              </div>
            </div>
          )}

          {/* proofs */}
          <div>
            <SectionHead label="PROOF SUMMARY" right={`${recordedProofs.length} RECORDED`} />
            {workspace.proofs.length === 0 && (
              <div style={{ padding: "18px 0", font: "400 13.5px var(--font-text)", color: "var(--ink-4)" }}>
                No Proofs recorded for this Workspace yet.
              </div>
            )}
            {workspace.proofs.map((p, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid var(--line-hair)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <ProofTag kind={p.state === "recorded" ? "recorded" : "simulated"} />
                <div>
                  <div style={{ font: "500 13.5px/1.4 var(--font-text)" }}>"{p.claim}"</div>
                  <div style={{ marginTop: 4, font: "400 11px var(--font-mono)", color: "var(--ink-3)" }}>
                    {p.proof_surface}
                  </div>
                  {p.artifact_refs.length > 0 && (
                    <div style={{ marginTop: 4, font: "400 10.5px var(--font-mono)", color: "var(--ink-4)" }}>
                      {p.artifact_refs.join(" · ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right: non-claims */}
        <div>
          {workspace.non_claims.length > 0 && (
            <div>
              <SectionHead label="NON-CLAIMS" />
              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {workspace.non_claims.map((nc, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, font: "italic 400 13px/1.55 var(--font-display)", color: "var(--ink-3)", padding: "10px 0", borderBottom: "1px solid var(--line-hair)" }}>
                    <span style={{ font: "600 11px var(--font-mono)", color: "var(--ink-4)", fontStyle: "normal" }}>○</span>
                    <span>{nc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
