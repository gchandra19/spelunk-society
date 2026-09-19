import { z } from "zod";
import { PHOTO_KEYS } from "@/lib/data/events";

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(254),
  password: z.string().min(10, "Use at least 10 characters").max(72, "Use at most 72 characters"),
  grottoId: z.string().max(50).optional().transform((v) => v || null),
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
  for (const [k, v] of formData.entries()) if (typeof v === "string" && k !== "password" && k !== "rating") out[k] = v.slice(0, 2000);
  return out;
}

/** Only allow same-site relative redirects. */
export const safeNext = (next: string | null | undefined): string =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/events";
