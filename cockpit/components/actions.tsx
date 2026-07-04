"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BlastRadius } from "@/lib/types";

async function post(body: unknown) {
  const res = await fetch("/api/actions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  // notify Shell to refresh the gate badge
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("weave:mutated"));
  return data;
}

/* ---------- Gate stamp ---------- */

export function GateDecision({
  gateId, appId, action, blastRadius, approvable, decision, blockedReason,
}: {
  gateId: string; appId: string; action: string; blastRadius: BlastRadius;
  approvable: boolean; decision?: "approved" | "held"; blockedReason?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function decide(type: "approve_gate" | "hold_gate") {
    setBusy(true);
    await post({ type, gateId, appId, action, blastRadius });
    setBusy(false);
    router.refresh();
  }

  if (decision) {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
        <div
          className="stamp"
          data-verdict={decision}
          style={{ animation: "stampIn var(--t-stamp) var(--ease-stamp) both" }}
        >
          {decision === "approved" ? "APPROVED" : "HELD"}
        </div>
        <div style={{ paddingTop: 4 }}>
          <span className="local-only-pill">LOCAL ONLY</span>
          <div style={{ marginTop: 6, font: "400 11.5px var(--font-text)", color: "var(--ink-3)" }}>
            Decision recorded · effect is SIMULATED · no real action performed
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button
          className="btn-primary"
          disabled={!approvable || busy}
          onClick={() => decide("approve_gate")}
          title={approvable ? "Record a local-only approval" : blockedReason}
        >
          Approve
        </button>
        <button className="btn-ghost" disabled={busy} onClick={() => decide("hold_gate")}>
          Hold
        </button>
        <span className="local-only-pill">LOCAL ONLY</span>
      </div>
      <div style={{ marginTop: 10, font: "400 12px var(--font-text)", color: "var(--ink-3)", display: "flex", gap: 6, alignItems: "flex-start" }}>
        <span>⚠</span>
        <span>External effect is SIMULATED — no real deploy, DNS, credential, or tracker action is performed. Decision records to local overlay only.</span>
      </div>
      {!approvable && blockedReason && (
        <div style={{ marginTop: 6, font: "400 11.5px var(--font-text)", color: "var(--attn-blocked)" }}>{blockedReason}</div>
      )}
    </div>
  );
}

/* ---------- Acknowledge blocker ---------- */

export function AckBlocker({ blockerId, appId, acknowledged }: {
  blockerId: string; appId: string; acknowledged?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (acknowledged) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <span style={{ font: "600 10px var(--font-mono)", letterSpacing: ".1em", color: "var(--proof-recorded)" }}>✓ ACKNOWLEDGED</span>
        <span className="local-only-pill">LOCAL ONLY</span>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center" }}>
      <button
        className="btn-ghost"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await post({ type: "acknowledge_blocker", blockerId, appId });
          setBusy(false);
          router.refresh();
        }}
      >
        Acknowledge
      </button>
      <span className="local-only-pill">LOCAL ONLY</span>
    </div>
  );
}

/* ---------- Accept review ---------- */

export function AcceptReview({ reviewId, appId, accepted }: {
  reviewId: string; appId: string; accepted?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (accepted) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ font: "600 10px var(--font-mono)", letterSpacing: ".1em", color: "var(--proof-recorded)" }}>✓ ACCEPTED</span>
        <span className="local-only-pill">LOCAL ONLY</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <button
        className="btn-primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await post({ type: "accept_review", reviewId, appId });
          setBusy(false);
          router.refresh();
        }}
      >
        Accept review
      </button>
      <span className="local-only-pill">LOCAL ONLY</span>
    </div>
  );
}

/* ---------- Answer task question ---------- */

export function AnswerTask({ taskId, appId, agent, answered, priorAnswer }: {
  taskId: string; appId: string; agent: string; answered?: boolean; priorAnswer?: string;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  if (answered && priorAnswer) {
    return (
      <div style={{ padding: "14px 18px", background: "var(--attn-owner-wash)", border: "1px solid var(--accent-wash)", marginTop: 10 }}>
        <div style={{ font: "700 10px var(--font-text)", letterSpacing: ".12em", color: "var(--accent)", marginBottom: 6 }}>YOUR ANSWER</div>
        <div style={{ font: "400 13.5px/1.55 var(--font-text)" }}>{priorAnswer}</div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
          <span className="local-only-pill">LOCAL ONLY</span>
          <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>recorded · not sent externally</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 10 }}>
      <textarea
        className="ledger-textarea"
        style={{ width: "100%", minHeight: 90, marginBottom: 10 }}
        placeholder={`Type your answer to ${agent}…`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          className="btn-primary"
          disabled={busy || text.trim().length === 0}
          onClick={async () => {
            setBusy(true);
            await post({ type: "answer_task", taskId, appId, agent, text: text.trim() });
            setBusy(false);
            setText("");
            setSent(true);
            router.refresh();
          }}
        >
          Send answer
        </button>
        <span className="local-only-pill">LOCAL ONLY</span>
        {sent && <span style={{ font: "400 11.5px var(--font-text)", color: "var(--proof-recorded)" }}>Answer recorded.</span>}
      </div>
    </div>
  );
}

/* ---------- Post a note ---------- */

export function PostNote({ agent, appId }: { agent: string; appId?: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div>
      <textarea
        className="ledger-textarea"
        style={{ width: "100%", minHeight: 80, marginBottom: 8 }}
        placeholder={`Type a note to ${agent}…`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          className="btn-ghost"
          disabled={busy || text.trim().length === 0}
          onClick={async () => {
            setBusy(true);
            await post({ type: "post_note", agent, appId, text: text.trim() });
            setBusy(false);
            setText("");
            setSent(true);
            router.refresh();
          }}
        >
          Post note
        </button>
        <span className="local-only-pill">LOCAL ONLY</span>
        {sent && <span style={{ font: "400 11.5px var(--font-text)", color: "var(--proof-recorded)" }}>Note recorded.</span>}
      </div>
      <div style={{ marginTop: 8, font: "400 11px var(--font-text)", color: "var(--ink-4)" }}>Stored locally · not sent externally</div>
    </div>
  );
}

/* ---------- Reset overlay (settings) ---------- */

export function ResetOverlay() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!confirmed) {
    return (
      <button className="btn-destruct" disabled={busy} onClick={() => setConfirmed(true)}>
        Reset overlay
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <button
        className="btn-destruct"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await post({ type: "reset_overlay" });
          setBusy(false);
          setConfirmed(false);
          router.refresh();
        }}
      >
        Confirm reset
      </button>
      <button className="btn-ghost" onClick={() => setConfirmed(false)}>Cancel</button>
      <span style={{ font: "400 11.5px var(--font-text)", color: "var(--attn-blocked)" }}>
        Clears all local decisions — gates, notes, answers. Cannot be undone.
      </span>
    </div>
  );
}
