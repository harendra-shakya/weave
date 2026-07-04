"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

const TABS = [
  { href: "/",           label: "Command Center", key: "home" },
  { href: "/workspaces", label: "Workspaces",     key: "workspaces" },
  { href: "/tasks",      label: "Tasks",          key: "tasks" },
  { href: "/proof",      label: "Proof ledger",   key: "proof" },
  { href: "/gates",      label: "Gates",          key: "gates" },
  { href: "/agents",     label: "Agents",         key: "agents" },
  { href: "/settings",   label: "Settings",       key: "settings" },
];

function tabKey(pathname: string): string {
  if (pathname === "/") return "home";
  for (const t of TABS) {
    if (t.href !== "/" && pathname.startsWith(t.href)) return t.key;
  }
  return "";
}

function useGateCount(): number {
  const [count, setCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    function refresh() {
      fetch("/api/home")
        .then((r) => r.json())
        .then((d: { workspaces?: Array<{ gates?: Array<{ decision?: string; requires_owner_approval?: boolean }> }> }) => {
          const n = (d.workspaces ?? [])
            .flatMap((w) => w.gates ?? [])
            .filter((g) => !g.decision && g.requires_owner_approval).length;
          setCount(n);
        })
        .catch(() => {});
    }
    refresh();
    window.addEventListener("weave:mutated", refresh);
    return () => window.removeEventListener("weave:mutated", refresh);
  }, [pathname]);

  return count;
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const active = tabKey(pathname);
  const gateCount = useGateCount();

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper-desk)", padding: "26px 28px", fontFamily: "var(--font-text)", color: "var(--ink-1)", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1460, margin: "0 auto", background: "var(--paper-1)", border: "1px solid var(--line-card)", boxShadow: "var(--shadow-page)", display: "flex", flexDirection: "column", minHeight: "calc(100vh - 52px)" }}>

        {/* masthead */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px 18px", padding: "15px 44px", borderBottom: "2px solid var(--ink-1)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: 12, background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", textDecoration: "none" }}>
            <span style={{ font: "700 13px var(--font-text)", letterSpacing: ".22em" }}>WEAVE</span>
            <span style={{ font: "400 11.5px var(--font-text)", color: "var(--ink-3)" }}>Owner cockpit</span>
          </Link>
          <div style={{ flex: 1 }} />
          <span className="local-only-pill">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--proof-recorded)", flexShrink: 0, display: "inline-block" }} />
            LOCAL-ONLY
          </span>
        </div>

        {/* tab nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 38px", borderBottom: "1px solid var(--line-hair)" }}>
          {TABS.map((t) => {
            const isActive = active === t.key;
            return (
              <Link
                key={t.key}
                href={t.href}
                style={{
                  display: "inline-flex", alignItems: "center", whiteSpace: "nowrap", gap: 7,
                  background: "none", border: "none", cursor: "pointer",
                  font: `${isActive ? 600 : 500} 12.5px var(--font-text)`,
                  padding: "12px 10px 11px",
                  color: isActive ? "var(--ink-1)" : "var(--ink-3)",
                  boxShadow: isActive ? "inset 0 -2px 0 var(--ink-1)" : "none",
                  transition: `color var(--t-hover) var(--ease-out)`,
                  textDecoration: "none",
                }}
              >
                {t.label}
                {t.key === "gates" && gateCount > 0 && (
                  <span style={{ font: "600 10px var(--font-mono)", padding: "1px 6px", border: "1px solid var(--attn-approval)", color: "var(--attn-approval)", borderRadius: "var(--r-pill)" }}>
                    {gateCount}
                  </span>
                )}
              </Link>
            );
          })}
          <div style={{ flex: 1 }} />
          <span style={{ font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>⌘K jump to anything</span>
        </div>

        {/* page content */}
        <div style={{ flex: 1 }}>{children}</div>

        {/* footer honesty line */}
        <div style={{ padding: "13px 44px", borderTop: "1px solid var(--line-hair)", font: "400 11px var(--font-mono)", color: "var(--ink-4)" }}>
          This cockpit reads the local state directory and writes only a local overlay. External effects are simulated and logged — never executed.
        </div>
      </div>
    </div>
  );
}
