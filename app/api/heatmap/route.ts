import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/lib/session";
import { getHeatmap } from "@/lib/services/stats-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const days = Math.min(365, Math.max(30, parseInt(searchParams.get("days") || "182", 10)));
    const data = await getHeatmap(user.id, days);
    return NextResponse.json({ days: data });
  } catch (error) {
    return handleApiError(error);
  }
}
