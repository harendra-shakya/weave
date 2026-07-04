import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import { readOverlay } from "@/lib/overlay";
import { contextPackOf } from "@/lib/types";
import { ProofTag, ReviewStepper, ContextPack, SectionHead, MonoMeta } from "@/components/ui";
import { AnswerTask } from "@/components/actions";

export const dynamic = "force-dynamic";

const REVIEW_LOOP_STEP: Record<string, number> = {
  draft: 0, build: 1, "self-check": 2, "owner review": 3, accepted: 4,
};

function reviewStep(state?: string): number {
  if (!state) return 0;
  return REVIEW_LOOP_STEP[state.toLowerCase()] ?? 0;
}

export default async function TaskDetail({ params }: { params: { id: string } }) {
  const [domain, overlay] = await Promise.all([loadDomain(), readOverlay()]);
  let found: { t: (typeof domain.workspaces)[0]["tasks"][0]; workspace: (typeof domain.workspaces)[0] } | undefined;
  for (const w of domain.workspaces) {
    const t = w.tasks.find((x) => x.task_id === params.id);
    if (t) { found = { t, workspace: w }; break; }
  }


  if (!found) {
    return (
      <div style={{ padding: "44px", font: "500 20px var(--font-display)" }}>
        Task "{params.id}" not found.{" "}
        <Link href="/tasks" style={{ font: "400 13.5px var(--font-text)", color: "var(--accent)" }}>← Back</Link>
      </div>
    );
  }

  const { t, workspace } = found;
  const proof = workspace.proofs.find((p) => p.task_id === t.task_id);
  const pack = contextPackOf(t);
  const step = reviewStep(proof?.review_loop_state ? Object.values(proof.review_loop_state)[0] : undefined);
  const answered = overlay.taskAnswers?.[t.task_id];
  // agent question: look up by agent identity (Agent.input_request is the pending question)
  const agentWithQuestion = t.agent
    ? domain.agents.find((a) => a.identity === t.agent && a.input_request)
    : undefined;

  return (
    <div style={{ padding: "34px 44px 40px" }}>
      {/* breadcrumb */}
      <div style={{ font: "400 11.5px var(--font-text)", color: "var(--ink-4)", marginBottom: 16 }}>
        <Link href="/tasks" style={{ color: "var(--ink-4)", textDecoration: "none" }}>Tasks</Link>
        {" / "}
        <Link href={`/workspaces/${workspace.app_id}`} style={{ color: "var(--ink-4)", textDecoration: "none" }}>{workspace.name}</Link>
        {" / "}
        <MonoMeta>{t.task_id}</MonoMeta>
      </div>

      {/* title */}
      <div style={{ font: "500 32px/1.15 var(--font-display)", letterSpacing: "-.01em", maxWidth: 820 }}>{t.objective}</div>

      <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
        <MonoMeta>{t.task_id}</MonoMeta>
        {t.agent && <span style={{ font: "400 13px var(--font-text)", color: "var(--ink-3)" }}>{t.agent}</span>}
        {t.stage && <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>{t.stage}</span>}
        {t.due && <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>Due {t.due}</span>}
      </div>

      {/* review stepper */}
      <div style={{ marginTop: 24, padding: "18px 0", borderTop: "1px solid var(--line-hair)", borderBottom: "1px solid var(--line-hair)" }}>
        <SectionHead label="REVIEW LOOP" />
        <div style={{ marginTop: 14 }}>
          <ReviewStepper step={step} />
        </div>
      </div>

      {/* open question from agent */}
      {agentWithQuestion && (
        <div style={{ marginTop: 24, padding: "18px 22px", background: "var(--attn-owner-wash)", border: "1.5px solid var(--accent)" }}>
          <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 8 }}>◉ AGENT QUESTION</div>
          <div style={{ font: "500 16px/1.5 var(--font-display)" }}>"{agentWithQuestion.input_request}"</div>
          <div style={{ marginTop: 4, font: "400 12px var(--font-text)", color: "var(--ink-3)" }}>
            {agentWithQuestion.identity} is paused until you answer. This is stored locally only.
          </div>
          <AnswerTask
            taskId={t.task_id}
            appId={t.app_id}
            agent={agentWithQuestion.identity}
            answered={Boolean(answered)}
            priorAnswer={answered?.text}
          />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 370px", gap: 40, marginTop: 28, alignItems: "start" }}>
        {/* left */}
        <div style={{ display: "grid", gap: 28 }}>
          {/* context pack */}
          {(pack.allowed.length > 0 || pack.forbidden.length > 0 || pack.non_claims.length > 0) && (
            <div style={{ padding: "18px 22px 22px", background: "var(--paper-2)", border: "1px solid var(--line-card)" }}>
              <ContextPack
                allowed={pack.allowed}
                forbidden={pack.forbidden}
                nonClaims={pack.non_claims}
                packRef={pack.worker_packet_ref}
              />
            </div>
          )}

          {/* proof */}
          {proof && (
            <div>
              <SectionHead label="PROOF" />
              <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
                <ProofTag kind={proof.state === "recorded" ? "recorded" : "simulated"} />
                <div>
                  <div style={{ font: "500 15px/1.45 var(--font-text)" }}>"{proof.claim}"</div>
                  <div style={{ marginTop: 6, font: "400 11.5px var(--font-mono)", color: "var(--ink-3)" }}>
                    {proof.proof_surface}
                  </div>
                  {proof.artifact_refs.length > 0 && (
                    <div style={{ marginTop: 6, font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>
                      {proof.artifact_refs.join(" · ")}
                    </div>
                  )}
                  {proof.non_claims.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-3)", marginBottom: 6 }}>NON-CLAIMS</div>
                      {proof.non_claims.map((nc, i) => (
                        <div key={i} style={{ font: "italic 400 12.5px/1.5 var(--font-display)", color: "var(--ink-3)", padding: "5px 0", borderBottom: "1px solid var(--line-hair)" }}>
                          ○ {nc}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!proof && (
            <div style={{ padding: "22px 0", font: "400 13.5px var(--font-text)", color: "var(--ink-4)" }}>
              No Proof recorded for this Task yet. Claims remain unverified until a Proof is attached.
            </div>
          )}
        </div>

        {/* right: review loop state detail */}
        {proof?.review_loop_state && (
          <div>
            <SectionHead label="LOOP STATE" />
            <div style={{ marginTop: 14, display: "grid", gap: 0 }}>
              {Object.entries(proof.review_loop_state).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line-hair)" }}>
                  <span style={{ font: "600 11px var(--font-text)", letterSpacing: ".08em", color: "var(--ink-3)" }}>{k}</span>
                  <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-2)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
