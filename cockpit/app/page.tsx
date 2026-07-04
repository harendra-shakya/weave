import Link from "next/link";
import { loadDomain } from "@/lib/weaveHome";
import { compareAttention } from "@/lib/attention";
import { AttentionPill, attentionGlyph, attentionLabel, EmptyDocket, SectionHead, MonoMeta } from "@/components/ui";
import type { AttentionState } from "@/lib/types";

export const dynamic = "force-dynamic";

const WORDS = ["no", "one", "two", "three", "four", "five", "six"];

function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

function buildHeadline(
  gateCount: number,
  blockerCount: number,
  questionCount: number,
  reviewCount: number,
  staleCount: number,
): { headline: string; subline: string } {
  const total = gateCount + blockerCount + questionCount + reviewCount + staleCount;
  if (total === 0) {
    return {
      headline: "Nothing needs you.",
      subline: "Read from the local Domain a moment ago · all on course.",
    };
  }
  const segs: string[] = [];
  if (gateCount) segs.push(`${WORDS[gateCount] ?? gateCount} ${gateCount === 1 ? "decision needs you" : "decisions need you"}`);
  if (blockerCount) segs.push(`${WORDS[blockerCount] ?? blockerCount} ${blockerCount === 1 ? "blocker is holding" : "blockers are holding"}`);
  if (questionCount) segs.push(`${WORDS[questionCount] ?? questionCount} ${questionCount === 1 ? "question is waiting" : "questions are waiting"}`);
  if (reviewCount) segs.push(`${WORDS[reviewCount] ?? reviewCount} ${reviewCount === 1 ? "review is ready" : "reviews are ready"}`);
  if (segs.length === 0 && staleCount) segs.push(`${WORDS[staleCount] ?? staleCount} ${staleCount === 1 ? "stage has gone quiet" : "stages have gone quiet"}`);
  return {
    headline: cap(segs.join(", ") + "."),
    subline: "Read from the local Domain a moment ago · decisions record locally only.",
  };
}

interface DocketItem {
  num: string;
  attn: AttentionState;
  title: string;
  sub: string;
  meta: string;
  age: string;
  action: string;
  href: string;
}

export default async function CommandCenter() {
  const domain = await loadDomain();
  const ws = domain.workspaces;

  const gates = ws.flatMap((w) => w.gates.filter((g) => !g.decision && g.requires_owner_approval));
  const blockers = ws.flatMap((w) => w.blockers.filter((b) => b.state === "blocked_until_validated").map((b) => ({ blocker: b, ws: w })));
  const questions = domain.agents.filter((a) => a.input_request);
  const reviews = ws.flatMap((w) => w.reviews.filter((r) => /pending/i.test(r.state)).map((r) => ({ review: r, ws: w })));
  const staleWs = ws.filter((w) => w.attention === "stale");

  const { headline, subline } = buildHeadline(gates.length, blockers.length, questions.length, reviews.length, staleWs.length);

  const docket: DocketItem[] = [];
  ws.filter((w) => w.attention !== "none").sort((a, b) => compareAttention(a.attention, b.attention)).forEach((w) => {
    const g = w.gates.find((g) => !g.decision && g.requires_owner_approval);
    if (w.attention === "blocked") {
      const b = w.blockers.find((b) => b.state === "blocked_until_validated");
      docket.push({ num: "", attn: "blocked", title: `${w.name} — ${b?.next_action ?? "blocker open"}`, sub: `Blocking gate or provider access. Next safe action: resolve the blocker.`, meta: b?.id ?? "", age: "—", action: "Open →", href: `/workspaces/${w.app_id}` });
    } else if (w.attention === "approval" && g) {
      docket.push({ num: "", attn: "approval", title: `${w.name} — ${g.action}`, sub: `Blast radius ${g.blast_radius}${g.mirror ? " — Mirror write" : ""}. Effect will be SIMULATED, never executed.`, meta: g.id, age: "—", action: "Decide →", href: "/gates" });
    } else if (w.attention === "needs-owner") {
      const a = domain.agents.find((ag) => ag.app_id === w.app_id && ag.input_request);
      docket.push({ num: "", attn: "needs-owner", title: `${a?.identity ?? "Agent"} asks: ${a?.input_request ?? "owner input needed"}`, sub: `Open question — the Agent is paused until you answer.`, meta: a?.task_ref ?? "", age: "—", action: "Answer →", href: "/agents" });
    } else if (w.attention === "ready") {
      const r = w.reviews.find((r) => /pending/i.test(r.state));
      docket.push({ num: "", attn: "ready", title: `${w.name} — Proof recorded, review awaits acceptance`, sub: `Claim verified · review loop at owner review.`, meta: r?.id ?? "", age: "—", action: "Review →", href: "/proof" });
    } else if (w.attention === "stale") {
      docket.push({ num: "", attn: "stale", title: `${w.name} — ${w.current_stage} stage has no recent Proof`, sub: `Claims made but nothing recorded. Treat all claims as unverified.`, meta: "", age: "—", action: "Open →", href: `/workspaces/${w.app_id}` });
    }
  });
  // number them
  docket.forEach((d, i) => { d.num = String(i + 1).padStart(2, "0"); });

  // standing figures
  const openTasks = ws.reduce((n, w) => n + w.tasks.filter((t) => !/done|complete/.test(t.state)).length, 0);
  const gateCount = gates.length;
  const proofCount = ws.reduce((n, w) => n + w.proofs.filter((p) => p.state === "recorded").length, 0);

  // events (newest first, top 4)
  const recentEvents = domain.events.slice(0, 4);

  const allClear = docket.length === 0;

  return (
    <div style={{ padding: "34px 44px 30px" }}>
      {/* hero headline */}
      <div style={{ font: "500 46px/1.12 var(--font-display)", letterSpacing: "-.01em", maxWidth: 760 }}>{headline}</div>
      <div style={{ marginTop: 10, font: "400 13.5px var(--font-text)", color: "var(--ink-3)" }}>{subline}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 370px", gap: 52, marginTop: 32 }}>
        {/* docket */}
        <div>
          <SectionHead label="THE DOCKET" right={`SORTED BY PRIORITY · ${docket.length} OPEN`} />

          {allClear && <EmptyDocket />}

          {docket.map((d) => (
            <Link
              key={d.num}
              href={d.href}
              style={{
                display: "grid", gridTemplateColumns: "30px 148px 1fr auto", gap: 14, alignItems: "baseline",
                padding: "15px 8px", margin: "0 -8px", borderBottom: "1px solid var(--line-hair)",
                background: "none", width: "calc(100% + 16px)", textAlign: "left",
                textDecoration: "none", color: "inherit",
                transition: `background var(--t-hover) var(--ease-out)`,
              }}
            >
              <span style={{ font: "500 12px var(--font-mono)", color: "var(--ink-4)" }}>{d.num}</span>
              <span><AttentionPill state={d.attn} /></span>
              <span>
                <span style={{ display: "block", font: "600 15.5px var(--font-text)" }}>{d.title}</span>
                <span style={{ display: "block", font: "400 13px/1.5 var(--font-text)", color: "var(--ink-3)", marginTop: 2 }}>
                  {d.sub} {d.meta && <span style={{ font: "500 11px var(--font-mono)" }}>{d.meta}</span>}
                </span>
              </span>
              <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)", whiteSpace: "nowrap" }}>{d.age}&nbsp;&nbsp;{d.action}</span>
            </Link>
          ))}
        </div>

        {/* right rail */}
        <div style={{ display: "grid", gap: 28, alignContent: "start" }}>
          {/* standing figures */}
          <div>
            <SectionHead label="STANDING FIGURES" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ padding: "16px 18px 16px 0", borderBottom: "1px solid var(--line-hair)", borderRight: "1px solid var(--line-hair)" }}>
                <div style={{ font: "500 36px var(--font-display)", fontVariantNumeric: "tabular-nums" }}>{ws.length}</div>
                <div style={{ font: "600 10px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-3)", marginTop: 2 }}>WORKSPACES</div>
              </div>
              <div style={{ padding: "16px 0 16px 18px", borderBottom: "1px solid var(--line-hair)" }}>
                <div style={{ font: "500 36px var(--font-display)", fontVariantNumeric: "tabular-nums" }}>{openTasks}</div>
                <div style={{ font: "600 10px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-3)", marginTop: 2 }}>OPEN TASKS</div>
              </div>
              <div style={{ padding: "16px 18px 16px 0", borderRight: "1px solid var(--line-hair)" }}>
                <div style={{ font: "500 36px var(--font-display)", fontVariantNumeric: "tabular-nums", color: gateCount > 0 ? "var(--attn-approval)" : "var(--ink-1)" }}>{gateCount}</div>
                <div style={{ font: "600 10px var(--font-text)", letterSpacing: ".12em", color: gateCount > 0 ? "var(--attn-approval)" : "var(--ink-3)", marginTop: 2 }}>GATES AWAITING</div>
              </div>
              <div style={{ padding: "16px 0 16px 18px" }}>
                <div style={{ font: "500 36px var(--font-display)", fontVariantNumeric: "tabular-nums" }}>{proofCount}</div>
                <div style={{ font: "600 10px var(--font-text)", letterSpacing: ".12em", color: "var(--ink-3)", marginTop: 2 }}>PROOFS RECORDED</div>
              </div>
            </div>
          </div>

          {/* agents */}
          <div>
            <SectionHead label="AGENTS" />
            {domain.agents.map((ag) => {
              const busy = !!ag.input_request;
              const dotBg = ag.health === "healthy" ? "var(--proof-recorded)" : ag.health === "blocked" || busy ? "var(--attn-approval)" : "transparent";
              const dotBorder = ag.health === "idle" ? "1.5px solid var(--ink-4)" : "none";
              return (
                <Link
                  key={ag.identity}
                  href="/agents"
                  style={{
                    display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "4px 12px", alignItems: "baseline",
                    padding: "13px 4px", margin: "0 -4px", width: "calc(100% + 8px)",
                    borderBottom: "1px solid var(--line-hair)", background: "none",
                    textDecoration: "none", color: "inherit",
                    transition: `background var(--t-hover) var(--ease-out)`,
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotBg, border: dotBorder, alignSelf: "center" }} />
                  <span>
                    <span style={{ font: "600 13.5px var(--font-text)" }}>{ag.identity}</span>
                    {" "}
                    <span style={{ font: "400 12.5px var(--font-text)", color: busy ? "var(--attn-approval)" : "var(--ink-3)" }}>— {busy ? "awaiting your input" : ag.status}</span>
                  </span>
                  <span style={{ font: "400 10.5px var(--font-mono)", color: "var(--ink-4)" }}>{ag.task_ref ?? "—"}</span>
                </Link>
              );
            })}
          </div>

          {/* latest in the ledger */}
          <div>
            <SectionHead label="LATEST IN THE LEDGER" />
            {recentEvents.map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "11px 0", borderBottom: "1px solid var(--line-hair)" }}>
                <MonoMeta>{e.at.slice(11, 16)}</MonoMeta>
                {e.simulated && <span className="sim-chip">SIM</span>}
                <span style={{ font: "400 12.5px/1.5 var(--font-text)", color: "var(--ink-2)" }}>{e.event}{e.intent ? ` — ${e.intent}` : ""}</span>
              </div>
            ))}
            {recentEvents.length === 0 && (
              <div style={{ padding: "14px 0", font: "400 13px var(--font-text)", color: "var(--ink-4)" }}>No events yet.</div>
            )}
            <Link href="/proof" style={{ display: "block", marginTop: 10, font: "600 12px var(--font-text)", color: "var(--accent)", textDecoration: "none" }}>
              Open the proof ledger →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
