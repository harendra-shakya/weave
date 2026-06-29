"use client";
/**
 * Owner action buttons (DESIGN_SYSTEM §5.8). Each POSTs a LOCAL decision to
 * /api/actions and refreshes the route. Every external-surface action shows the
 * "External effect is SIMULATED" boundary note adjacent — no real action runs.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BlastRadius } from "@/lib/types";

async function post(body: unknown) {
  const res = await fetch("/api/actions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function GateDecision({
  gateId,
  appId,
  action,
  blastRadius,
  approvable,
  decision,
  blockedReason,
}: {
  gateId: string;
  appId: string;
  action: string;
  blastRadius: BlastRadius;
  approvable: boolean;
  decision?: "approved" | "held";
  blockedReason?: string;
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
      <div>
        <span className="proof-tag" data-kind="real" style={{ marginRight: 8 }}>
          {decision === "approved" ? "Approved (local-only · simulated)" : "Held (local-only)"}
        </span>
        <span className="sim-note">Decision recorded to overlay · event appended: gate.{decision} (SIMULATED)</span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          className="btn"
          data-variant="primary"
          disabled={!approvable || busy}
          onClick={() => decide("approve_gate")}
          title={approvable ? "Record a local-only approval" : blockedReason}
        >
          Approve (local-only)
        </button>
        <button className="btn" disabled={busy} onClick={() => decide("hold_gate")}>
          Hold
        </button>
      </div>
      <div className="sim-note" style={{ marginTop: 10 }}>
        ⚠ External effect is SIMULATED — no real deploy / DNS / credential / Linear action is performed.
      </div>
      {!approvable && blockedReason && (
        <div className="muted" style={{ marginTop: 6, fontSize: "var(--fs-sm)" }}>{blockedReason}</div>
      )}
    </div>
  );
}

export function AckBlocker({ blockerId, appId, acknowledged }: { blockerId: string; appId: string; acknowledged?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (acknowledged) return <span className="proof-tag" data-kind="real">Acknowledged (local-only)</span>;
  return (
    <button
      className="btn"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await post({ type: "acknowledge_blocker", blockerId, appId });
        setBusy(false);
        router.refresh();
      }}
    >
      Acknowledge blocker (local-only)
    </button>
  );
}

export function PostNote({ runtime, appId }: { runtime: string; appId?: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  return (
    <div>
      <textarea
        className="row"
        style={{ width: "100%", minHeight: 80, color: "var(--text-0)", background: "var(--bg-2)" }}
        placeholder={`Type a note to ${runtime}…`}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
        <button
          className="btn"
          disabled={busy || text.trim().length === 0}
          onClick={async () => {
            setBusy(true);
            await post({ type: "post_note", runtime, appId, text });
            setBusy(false);
            setText("");
            setSent(true);
            router.refresh();
          }}
        >
          Post note (local-only)
        </button>
        <span className="btn-note">Stored locally · not sent externally</span>
      </div>
      {sent && <div className="sim-note" style={{ marginTop: 6 }}>Note recorded to overlay (local-only).</div>}
    </div>
  );
}
