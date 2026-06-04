import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, handleApiError } from "@/lib/session";
import { subjectAdminSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const json = await req.json();
    const parsed = subjectAdminSchema.partial().safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    const subject = await prisma.subject.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ ok: true, subject });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    // Cascade removes the subject's questions (see schema relation).
    await prisma.subject.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
