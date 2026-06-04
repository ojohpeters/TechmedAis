import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/lib/session";
import { getLeaderboard } from "@/lib/services/stats-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCOPES = ["GLOBAL", "UNIVERSITY", "WEEKLY", "MONTHLY"] as const;

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const scopeParam = (searchParams.get("scope") || "GLOBAL").toUpperCase();
    const scope = (SCOPES.includes(scopeParam as (typeof SCOPES)[number]) ? scopeParam : "GLOBAL") as
      | "GLOBAL"
      | "UNIVERSITY"
      | "WEEKLY"
      | "MONTHLY";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get("pageSize") || "20", 10)));

    const data = await getLeaderboard(scope, user.id, page, pageSize);
    return NextResponse.json({ ...data, page, pageSize, scope });
  } catch (error) {
    return handleApiError(error);
  }
}
