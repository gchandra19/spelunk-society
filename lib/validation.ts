import { z } from "zod";
import { GEAR_SLUGS } from "@/lib/data/gear";
import { PHOTO_KEYS } from "@/lib/data/photos";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: z.string().min(10, "Use at least 10 characters").max(72, "Use at most 72 characters"),
  grottoId: z.string().max(50).optional().transform((v) => v || null),
  skillLevel: z.enum(["beginner", "intermediate", "vertical", "rescue"]).default("beginner"),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: z.string().min(1, "Enter your password").max(72),
});

const now = () => Date.now();

export const createEventSchema = z.object({
  title: z.string().trim().min(5, "At least 5 characters").max(120),
  description: z.string().trim().min(10, "Tell people a bit more (10+ characters)").max(2000),
  caveName: z.string().trim().min(2, "Enter the cave or location").max(120),
  region: z.string().trim().max(80).optional().transform((v) => v || null),
  startsAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Pick a date and time")
    .transform((s) => new Date(`${s}:00Z`))
    .refine((d) => d.getTime() > now(), "Pick a date in the future")
    .refine((d) => d.getTime() < now() + 2 * 365 * 86_400_000, "Pick a date within two years"),
  durationHours: z.coerce.number().int().min(1, "1 to 72 hours").max(72, "1 to 72 hours"),
  difficulty: z.enum(["Beginner", "Vertical", "Rescue"]),
  capacity: z.coerce.number().int().min(1, "1 to 500 people").max(500, "1 to 500 people"),
  photo: z.enum(PHOTO_KEYS),
  grottoId: z.string().max(50).optional().transform((v) => v || null),
});

export const reviewSchema = z.object({
  eventId: z.string().min(1).max(64),
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  body: z.string().trim().min(10, "Write at least 10 characters").max(1500),
});

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) out[String(issue.path[0] ?? "form")] ??= issue.message;
  return out;
}

/** Echo submitted text fields (never passwords) so a failed submit does not wipe the form. */
export function submitted(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) if (typeof v === "string" && k !== "password" && k !== "rating" && k !== "code") out[k] = v.slice(0, 2000);
  return out;
}

/** Only allow same-site relative redirects. */
export const safeNext = (next: string | null | undefined): string =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/events";

export const grottoReviewSchema = z.object({
  grottoId: z.string().min(1).max(50),
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  body: z.string().trim().min(10, "Write at least 10 characters").max(1000),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  message: z.string().trim().min(10, "Write at least 10 characters").max(3000),
  website: z.string().max(0).optional(), // honeypot: real people leave this hidden field empty
});

export const skillSchema = z.object({ skillLevel: z.enum(["beginner", "intermediate", "vertical", "rescue"]) });

/** "Rope Walker, SRT, rigging" -> ["rope-walker", "srt", "rigging"] */
export const parseTags = (raw: string): string[] => [
  ...new Set(
    raw
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
      .filter((t) => /^[a-z0-9][a-z0-9-]{1,23}$/.test(t)),
  ),
].slice(0, 5);

export const askSchema = z.object({
  title: z.string().trim().min(10, "Make the title a little more specific (10+ characters)").max(150),
  body: z.string().trim().min(20, "Add some detail (20+ characters)").max(5000),
  tags: z.string().max(200).default("").transform(parseTags),
});

export const answerSchema = z.object({
  questionId: z.string().min(1).max(64),
  body: z.string().trim().min(10, "Write at least 10 characters").max(5000),
});

export const gearReviewSchema = z.object({
  slug: z.enum(GEAR_SLUGS),
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  body: z.string().trim().min(10, "Write at least 10 characters").max(1500),
});

export const recoverySchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  code: z.string().trim().min(16, "Enter your full recovery code").max(40),
  password: z.string().min(10, "Use at least 10 characters").max(72, "Use at most 72 characters"),
});
