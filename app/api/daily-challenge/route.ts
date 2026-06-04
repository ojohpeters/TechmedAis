import { NextResponse } from "next/server";
import { requireUser, handleApiError } from "@/lib/session";
import { getDailyChallenge } from "@/lib/services/stats-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const challenge = await getDailyChallenge(user.id);
    return NextResponse.json({ challenge });
  } catch (error) {
    return handleApiError(error);
  }
}
