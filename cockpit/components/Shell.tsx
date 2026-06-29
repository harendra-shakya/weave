"use client";
/**
 * App Shell (DESIGN_SYSTEM §5.9 / §5.6): persistent proof-boundary banner +
 * 220px left nav (7 destinations, active highlighted) + content area.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SourceIcon } from "./SourceIcon";

const NAV = [
  { href: "/", label: "Command Center" },
  { href: "/rooms", label: "Rooms" },
  { href: "/missions", label: "Missions" },
  { href: "/proof", label: "Proof Ledger" },
  { href: "/gates", label: "Gates" },
  { href: "/runtime", label: "Runtime" },
  { href: "/settings", label: "Settings" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  return (
    <div className="shell">
      <div className="banner">
        Local-only cockpit · fixture data · no secrets · external actions simulated
      </div>
      <nav className="nav">
        <div className="brand" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <SourceIcon name="weave" size={16} style={{ color: "var(--accent)" }} /> WEAVE
        </div>
        <div className="brand-sub">Owner Cockpit · v0.2 draft</div>
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="nav-item" data-active={isActive(pathname, n.href)}>
            {n.label}
          </Link>
        ))}
      </nav>
      <main className="content">{children}</main>
    </div>
  );
}
