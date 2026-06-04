import { z } from "zod";
import { SUBJECT_MIN, SUBJECT_MAX } from "./constants";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const phoneSchema = z
  .string()
  .regex(/^(\+?234|0)\d{10}$/, "Enter a valid Nigerian phone number");

// ── Registration ────────────────────────────────────────────
export const personalDetailsSchema = z
  .object({
    name: z.string().min(2, "Enter your full name").max(80),
    email: z.string().email("Enter a valid email").toLowerCase(),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const academicProfileSchema = z.object({
  university: z.string().min(2, "Select your university"),
  faculty: z.string().min(2, "Select your faculty"),
  course: z.string().min(2, "Select your course"),
});

export const subjectSelectionSchema = z.object({
  subjectIds: z
    .array(z.string())
    .min(SUBJECT_MIN, `Select at least ${SUBJECT_MIN} subjects`)
    .max(SUBJECT_MAX, `Select at most ${SUBJECT_MAX} subjects`),
});

export const profileSetupSchema = z.object({
  avatar: z.string().url().optional().or(z.literal("")),
  displayName: z.string().min(2).max(40).optional().or(z.literal("")),
});

// Full registration payload sent to the API.
export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().toLowerCase(),
  phone: phoneSchema,
  password: passwordSchema,
  university: z.string().min(2),
  faculty: z.string().min(2),
  course: z.string().min(2),
  subjectIds: z.array(z.string()).min(SUBJECT_MIN).max(SUBJECT_MAX),
  avatar: z.string().url().optional().or(z.literal("")).optional(),
  displayName: z.string().min(2).max(40).optional().or(z.literal("")).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Enter your password"),
});

// ── Exam ────────────────────────────────────────────────────
export const examConfigSchema = z.object({
  subjectIds: z.array(z.string()).min(1, "Select at least one subject"),
  questionCount: z.number().int().min(5).max(100),
  timeMode: z.enum(["TIMED", "UNTIMED", "CUSTOM"]),
  customMinutes: z.number().int().min(1).max(300).optional(),
  difficulty: z.enum(["MIXED", "EASY", "MEDIUM", "HARD"]),
  source: z.enum(["ALL_YEARS", "SPECIFIC_YEAR", "MY_UNIVERSITY", "ALL_UNIVERSITIES"]),
  year: z.number().int().min(1990).max(2100).optional(),
  mode: z.enum(["PRACTICE", "EXAM", "ONE_SUBJECT", "CUSTOM"]),
});

export const submitAnswerSchema = z.object({
  selected: z.enum(["A", "B", "C", "D"]).nullable(),
});

export const submitExamSchema = z.object({
  subjectIds: z.array(z.string()).min(1),
  mode: z.enum(["PRACTICE", "EXAM", "ONE_SUBJECT", "CUSTOM"]),
  timeTaken: z.number().int().min(0),
  answers: z.record(z.string(), z.enum(["A", "B", "C", "D"]).nullable()),
});

// ── Admin: questions ────────────────────────────────────────
export const questionSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  university: z.string().min(2, "University is required"),
  year: z.coerce.number().int().min(1990).max(2100),
  questionText: z.string().min(5, "Question text is too short"),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().min(1, "Option C is required"),
  optionD: z.string().min(1, "Option D is required"),
  correctAnswer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().optional().or(z.literal("")),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
});

// A single row from the bulk CSV upload (subject given by NAME, resolved server-side).
export const csvQuestionRowSchema = z.object({
  subject: z.string().min(1),
  university: z.string().min(2),
  year: z.coerce.number().int().min(1990).max(2100),
  question: z.string().min(5),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().min(1),
  option_d: z.string().min(1),
  correct_answer: z
    .string()
    .transform((s) => s.trim().toUpperCase())
    .pipe(z.enum(["A", "B", "C", "D"])),
  explanation: z.string().optional().default(""),
  difficulty: z
    .string()
    .transform((s) => s.trim().toUpperCase())
    .pipe(z.enum(["EASY", "MEDIUM", "HARD"]))
    .catch("MEDIUM"),
});

export const bulkUploadSchema = z.object({
  questions: z.array(questionSchema).min(1, "No valid questions to upload").max(2000),
});

// ── Admin: content & users ──────────────────────────────────
export const subjectAdminSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(8).toUpperCase(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  active: z.boolean().default(true),
});

export const userUpdateSchema = z.object({
  role: z.enum(["STUDENT", "ADMIN"]).optional(),
  suspended: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  displayName: z.string().min(2).max(40).optional().or(z.literal("")),
  phone: phoneSchema.optional(),
  university: z.string().min(2).optional(),
  faculty: z.string().min(2).optional(),
  course: z.string().min(2).optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  subjectIds: z.array(z.string()).min(SUBJECT_MIN).max(SUBJECT_MAX).optional(),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ExamConfig = z.infer<typeof examConfigSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
