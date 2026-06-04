import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { handleApiError } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    const limit = rateLimit(`register:${ip}`, 5, 60_000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many attempts. Please try again shortly." }, { status: 429 });
    }

    const json = await req.json();
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // Validate the selected subjects exist.
    const subjects = await prisma.subject.findMany({
      where: { id: { in: data.subjectIds } },
      select: { id: true },
    });
    if (subjects.length !== data.subjectIds.length) {
      return NextResponse.json({ error: "One or more selected subjects are invalid." }, { status: 400 });
    }

    const hashed = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        phone: data.phone,
        university: data.university,
        faculty: data.faculty,
        course: data.course,
        avatar: data.avatar || null,
        displayName: data.displayName || null,
        selectedSubjects: { connect: data.subjectIds.map((id) => ({ id })) },
        streak: { create: { currentStreak: 0, longestStreak: 0, freezeTokens: 0 } },
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
