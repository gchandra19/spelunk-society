"use server";

import { revalidatePath } from "next/cache";
import { acceptAnswer, createAnswer, createQuestion, toggleVote } from "@/lib/services/qa";
import { allow } from "@/lib/services/rate-limit";
import { getCurrentUser } from "@/lib/session";
import { answerSchema, askSchema, fieldErrors, submitted } from "@/lib/validation";
import type { ActionResult } from "@/types/domain";

type Created = ActionResult<{ id?: string }> | null;
const SIGN_IN = { success: false, error: "Please sign in to continue." } as const;

export async function askQuestionAction(_: Created, formData: FormData): Promise<Created> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN;

  const parsed = askSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };
  if (!(await allow(`ask:${user.id}`, 5, 3600))) return { success: false, error: "You've asked several questions recently. Please try again later.", values: submitted(formData) };

  const id = await createQuestion(user.id, parsed.data);
  revalidatePath("/questions");
  revalidatePath("/");
  return { success: true, id };
}

export async function answerQuestionAction(_: ActionResult | null, formData: FormData): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN;

  const parsed = answerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { success: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error), values: submitted(formData) };
  if (!(await allow(`answer:${user.id}`, 20, 3600))) return { success: false, error: "You're answering very quickly. Try again later.", values: submitted(formData) };

  const result = await createAnswer(user.id, parsed.data.questionId, parsed.data.body);
  if (!result.ok) return { success: false, error: result.error, values: submitted(formData) };
  revalidatePath(`/questions/${parsed.data.questionId}`);
  revalidatePath("/questions");
  return { success: true };
}

export async function voteAction(type: "question" | "answer", targetId: string, questionId: string): Promise<ActionResult<{ voted: boolean; score: number }>> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN;
  if (type !== "question" && type !== "answer") return { success: false, error: "Invalid vote." };
  if (!(await allow(`vote:${user.id}`, 120, 3600))) return { success: false, error: "Too many votes. Try again later." };

  const result = await toggleVote(user.id, type, String(targetId).slice(0, 64));
  if (!result.ok) return { success: false, error: result.error };
  revalidatePath(`/questions/${String(questionId).slice(0, 64)}`);
  return { success: true, voted: result.voted, score: result.score };
}

export async function acceptAnswerAction(questionId: string, answerId: string): Promise<ActionResult<{ accepted: boolean }>> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN;
  if (!(await allow(`accept:${user.id}`, 60, 3600))) return { success: false, error: "Too many requests. Try again later." };

  const result = await acceptAnswer(user.id, String(questionId).slice(0, 64), String(answerId).slice(0, 64));
  if (!result.ok) return { success: false, error: result.error };
  revalidatePath(`/questions/${questionId}`);
  revalidatePath("/questions");
  return { success: true, accepted: result.accepted };
}
