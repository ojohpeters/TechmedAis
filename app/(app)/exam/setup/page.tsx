import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExamSetup } from "@/components/exam/exam-setup";

export const metadata = { title: "Exam Setup" };
export const dynamic = "force-dynamic";

export default async function ExamSetupPage({
  searchParams,
}: {
  searchParams: { quick?: string; mode?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, subjects, years] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { selectedSubjects: { orderBy: { name: "asc" } } },
    }),
    prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { questions: true } } },
    }),
    prisma.question.findMany({ select: { year: true }, distinct: ["year"], orderBy: { year: "desc" } }),
  ]);
  if (!user) redirect("/login");

  const allSubjects = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    icon: s.icon,
    questionCount: s._count.questions,
  }));
  const presetIds = user.selectedSubjects.map((s) => s.id);

  return (
    <ExamSetup
      allSubjects={allSubjects}
      presetSubjectIds={presetIds}
      years={years.map((y) => y.year)}
      quickStart={searchParams.quick === "1"}
      initialMode={(searchParams.mode as "PRACTICE" | "EXAM" | "ONE_SUBJECT" | "CUSTOM") || undefined}
    />
  );
}
