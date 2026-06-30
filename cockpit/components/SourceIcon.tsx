/**
 * SourceIcon (DESIGN_SYSTEM §5.11) — inline, in-repo glyphs for the sources and
 * Agents (mirrors assets/icons/icon-set.svg). currentColor only; no remote
 * brand logos, no network. Pairs with a label/badge, never stands alone.
 */
import type { CSSProperties } from "react";

export type SourceName =
  | "weave"
  | "linear"
  | "slack"
  | "github"
  | "codex"
  | "claude"
  | "local";

const S: Record<SourceName, JSX.Element> = {
  weave: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <ellipse cx="0" cy="0" rx="6" ry="3" transform="rotate(-40)" />
      <ellipse cx="0" cy="0" rx="6" ry="3" transform="rotate(40)" />
    </g>
  ),
  linear: (
    <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform="rotate(-45)">
      <line x1="-5" y1="-4" x2="5" y2="-4" />
      <line x1="-6" y1="0" x2="6" y2="0" />
      <line x1="-5" y1="4" x2="5" y2="4" />
    </g>
  ),
  slack: (
    <g fill="currentColor">
      <rect x="-1.5" y="-7" width="3" height="6" rx="1.5" />
      <rect x="1" y="-1.5" width="6" height="3" rx="1.5" />
      <rect x="-1.5" y="1" width="3" height="6" rx="1.5" />
      <rect x="-7" y="-1.5" width="6" height="3" rx="1.5" />
    </g>
  ),
  github: (
    <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <line x1="-4" y1="-5" x2="-4" y2="5" />
      <circle cx="-4" cy="-6" r="1.7" />
      <circle cx="-4" cy="6" r="1.7" />
      <path d="M-4 -1 L3 -4" />
      <circle cx="4" cy="-5" r="1.7" />
    </g>
  ),
  codex: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="-2,-5 -7,0 -2,5" />
      <polyline points="2,-5 7,0 2,5" />
    </g>
  ),
  claude: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="0" y1="-6" x2="0" y2="6" />
      <line x1="-5" y1="-3" x2="5" y2="3" />
      <line x1="5" y1="-3" x2="-5" y2="3" />
    </g>
  ),
  local: (
    <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="-7" y="-5.5" width="14" height="11" rx="2" />
      <polyline points="-3,-1.5 0,1 -3,3.5" />
      <line x1="1" y1="3" x2="4" y2="3" />
    </g>
  ),
};

const AGENT_TO_NAME: Record<string, SourceName> = {
  Codex: "codex",
  Claude: "claude",
  "Local runtime": "local",
};

export function agentIconName(agent?: string): SourceName {
  return (agent && AGENT_TO_NAME[agent]) || "local";
}

export function SourceIcon({
  name,
  size = 14,
  style,
  title,
}: {
  name: SourceName;
  size?: number;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="-8 -8 16 16"
      role="img"
      aria-label={title ?? name}
      style={{ flex: "0 0 auto", ...style }}
    >
      {S[name]}
    </svg>
  );
}
