import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError } from "@/lib/session";
import { questionSchema } from "@/lib/validations";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSize = Math.min(100, Math.max(5, parseInt(searchParams.get("pageSize") || "20", 10)));

    const where: Prisma.QuestionWhereInput = {};
    const subjectId = searchParams.get("subjectId");
    const university = searchParams.get("university");
    const year = searchParams.get("year");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    if (subjectId) where.subjectId = subjectId;
    if (university) where.university = university;
    if (year) where.year = parseInt(year, 10);
    if (difficulty && ["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      where.difficulty = difficulty as Prisma.QuestionWhereInput["difficulty"];
    }
    if (search) where.questionText = { contains: search, mode: "insensitive" };

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { subject: { select: { name: true, icon: true } } },
      }),
    ]);

    return NextResponse.json({ questions, total, page, pageSize, hasMore: page * pageSize < total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const json = await req.json();
    const parsed = questionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
    }
    const d = parsed.data;
    const question = await prisma.question.create({
      data: {
        subjectId: d.subjectId,
        university: d.university,
        year: d.year,
        questionText: d.questionText,
        optionA: d.optionA,
        optionB: d.optionB,
        optionC: d.optionC,
        optionD: d.optionD,
        correctAnswer: d.correctAnswer,
        explanation: d.explanation || null,
        difficulty: d.difficulty,
      },
    });
    return NextResponse.json({ ok: true, question }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
