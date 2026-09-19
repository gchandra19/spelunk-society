import { NextResponse } from "next/server";
import { getViewerRsvpAndHostedIds } from "@/lib/services/events";
import { getCurrentUser } from "@/lib/session";
import type { Viewer } from "@/types/domain";

export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "private, no-store" };

export async function GET() {
  const user = await getCurrentUser(); // no cookie => no database query
  if (!user) return NextResponse.json<Viewer>({ user: null, rsvpIds: [], hostedIds: [] }, { headers: HEADERS });

  const ids = await getViewerRsvpAndHostedIds(user.id);
  return NextResponse.json<Viewer>({ user: { id: user.id, name: user.name }, ...ids }, { headers: HEADERS });
}
