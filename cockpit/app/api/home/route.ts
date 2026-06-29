/**
 * GET /api/home — the cockpit's read backend.
 * Resolves the local WEAVE home (fixture by default, or WEAVE_HOME), merges the
 * owner-action overlay, and returns the normalized Home. Local file reads only.
 */
import { NextResponse } from "next/server";
import { loadHome } from "@/lib/weaveHome";

export const dynamic = "force-dynamic"; // always reflect the latest overlay on disk

export async function GET() {
  const home = await loadHome();
  return NextResponse.json(home);
}
