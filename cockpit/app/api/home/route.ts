/**
 * GET /api/home — the cockpit's read backend.
 * Resolves the local WEAVE home (fixture by default, or WEAVE_HOME), merges the
 * owner-action overlay, and returns the normalized Domain. Local file reads only.
 */
import { NextResponse } from "next/server";
import { loadDomain } from "@/lib/weaveHome";

export const dynamic = "force-dynamic"; // always reflect the latest overlay on disk

export async function GET() {
  const domain = await loadDomain();
  return NextResponse.json(domain);
}
