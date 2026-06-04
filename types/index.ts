import type { Role, Difficulty, AnswerOption, ExamMode } from "@prisma/client";

export type { Role, Difficulty, AnswerOption, ExamMode };

export interface PublicQuestion {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectIcon?: string | null;
  university: string;
  year: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: AnswerOption;
  explanation?: string | null;
  difficulty: Difficulty;
}

export interface SubjectBreakdown {
  subjectId: string;
  name: string;
  total: number;
  correct: number;
  percentage: number;
}

export interface ExamResultSummary {
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percentage: number;
  pointsEarned: number;
  timeTaken: number;
  breakdown: SubjectBreakdown[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  displayName?: string | null;
  avatar?: string | null;
  university?: string | null;
  points: number;
  streak: number;
  isCurrentUser: boolean;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  points: number;
}

export interface DashboardStats {
  totalExams: number;
  averageScore: number;
  bestScore: number;
  subjectsCount: number;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }
  interface User {
    role?: Role;
  }
}

