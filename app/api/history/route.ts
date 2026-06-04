import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, handleApiError } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get("pageSize") || "10", 10)));

    const [total, sessions] = await Promise.all([
      prisma.examSession.count({ where: { userId: user.id } }),
      prisma.examSession.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          mode: true,
          totalQuestions: true,
          correctCount: true,
          percentage: true,
          score: true,
          timeTaken: true,
          subjectIds: true,
          breakdown: true,
          completedAt: true,
        },
      }),
    ]);

    return NextResponse.json({ sessions, total, page, pageSize, hasMore: page * pageSize < total });
  } catch (error) {
    return handleApiError(error);
  }
}
