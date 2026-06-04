import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError } from "@/lib/session";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(searchParams.get("pageSize") || "20", 10)));
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { university: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role && ["STUDENT", "ADMIN"].includes(role)) where.role = role as Prisma.UserWhereInput["role"];

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          displayName: true,
          email: true,
          avatar: true,
          university: true,
          course: true,
          role: true,
          suspended: true,
          totalPoints: true,
          createdAt: true,
          _count: { select: { examSessions: true } },
        },
      }),
    ]);

    return NextResponse.json({ users, total, page, pageSize, hasMore: page * pageSize < total });
  } catch (error) {
    return handleApiError(error);
  }
}
