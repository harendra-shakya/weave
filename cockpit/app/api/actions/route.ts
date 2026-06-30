/**
 * POST /api/actions — the cockpit's only write path.
 * Records a LOCAL owner decision in the overlay; external-surface actions append
 * a SIMULATED event and are never really executed. Returns the refreshed Domain
 * so the UI can reflect the new state immediately (and after restart, from disk).
 */
import { NextResponse } from "next/server";
import { applyAction, type ActionRequest } from "@/lib/actions";
import { defaultOverlayPath } from "@/lib/overlay";
import { loadDomain } from "@/lib/weaveHome";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: ActionRequest;
  try {
    body = (await request.json()) as ActionRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }

  const result = await applyAction(defaultOverlayPath(), body);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  const domain = await loadDomain();
  return NextResponse.json({ ok: true, simulated: true, domain });
}
