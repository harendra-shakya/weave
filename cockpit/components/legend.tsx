import { ATTENTION_PRIORITY, attentionLabel } from "@/lib/attention";
import { AttentionPill } from "./ui";

/** Owner Attention legend — the 6 states in priority order (WIREFRAMES §3). */
export function AttentionLegend() {
  return (
    <div className="legend">
      {ATTENTION_PRIORITY.map((s) => (
        <AttentionPill key={s} state={s} label={attentionLabel(s)} />
      ))}
    </div>
  );
}
