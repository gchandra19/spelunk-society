import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, tables } from "@/lib/db";
import type { Answer, Question } from "@/types/domain";

const { questions, answers, helpfulVotes, users } = tables;

// Qualified table names on purpose: these subqueries sit inside joins where a bare "id" would be ambiguous.
const answerCount = sql<number>`(select count(*)::int from ${answers} where ${answers.questionId} = "questions"."id")`;
const questionScore = sql<number>`(select count(*)::int from ${helpfulVotes} where ${helpfulVotes.targetType} = 'question' and ${helpfulVotes.targetId} = "questions"."id")`;
const answerScore = sql<number>`(select count(*)::int from ${helpfulVotes} where ${helpfulVotes.targetType} = 'answer' and ${helpfulVotes.targetId} = "answers"."id")`;

const questionSelect = {
  id: questions.id, title: questions.title, body: questions.body, tags: questions.tags, authorId: questions.authorId,
  createdAt: questions.createdAt, acceptedAnswerId: questions.acceptedAnswerId,
  authorName: users.name, authorLevel: users.skillLevel, authorRole: users.role,
  answerCount, score: questionScore,
};

type QRow = {
  id: string; title: string; body: string; tags: string[]; authorId: string; createdAt: Date; acceptedAnswerId: string | null;
  authorName: string; authorLevel: Question["authorLevel"]; authorRole: Question["authorRole"]; answerCount: number; score: number;
};

const toQuestion = (r: QRow): Question => ({
  ...r, createdAt: r.createdAt.toISOString(), answerCount: Number(r.answerCount), score: Number(r.score),
});

export async function listQuestions(limit = 100): Promise<Question[]> {
  const rows = await getDb()
    .select(questionSelect)
    .from(questions)
    .innerJoin(users, eq(users.id, questions.authorId))
    .orderBy(desc(questions.createdAt))
    .limit(limit);
  return rows.map(toQuestion);
}

export async function getQuestion(id: string): Promise<Question | null> {
  const [row] = await getDb().select(questionSelect).from(questions).innerJoin(users, eq(users.id, questions.authorId)).where(eq(questions.id, id)).limit(1);
  return row ? toQuestion(row) : null;
}

/** Accepted answer first, then most helpful, then oldest. */
export async function listAnswers(questionId: string, acceptedId: string | null): Promise<Answer[]> {
  const rows = await getDb()
    .select({
      id: answers.id, questionId: answers.questionId, authorId: answers.authorId, body: answers.body, createdAt: answers.createdAt,
      authorName: users.name, authorLevel: users.skillLevel, authorRole: users.role, score: answerScore,
    })
    .from(answers)
    .innerJoin(users, eq(users.id, answers.authorId))
    .where(eq(answers.questionId, questionId));

  return rows
    .map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), score: Number(r.score) }))
    .sort((a, b) => Number(b.id === acceptedId) - Number(a.id === acceptedId) || b.score - a.score || a.createdAt.localeCompare(b.createdAt));
}

export async function createQuestion(authorId: string, input: { title: string; body: string; tags: string[] }): Promise<string> {
  const [row] = await getDb().insert(questions).values({ authorId, ...input }).returning({ id: questions.id });
  return row.id;
}

export async function createAnswer(authorId: string, questionId: string, body: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = getDb();
  const [q] = await db.select({ id: questions.id }).from(questions).where(eq(questions.id, questionId)).limit(1);
  if (!q) return { ok: false, error: "This question no longer exists." };
  const inserted = await db.insert(answers).values({ questionId, authorId, body }).onConflictDoNothing().returning({ id: answers.id });
  return inserted.length ? { ok: true } : { ok: false, error: "You've already answered this question." };
}

export type VoteOutcome = { ok: true; voted: boolean; score: number } | { ok: false; error: string };

/** Toggle "helpful". You can't vote for your own post. */
export async function toggleVote(userId: string, type: "question" | "answer", targetId: string): Promise<VoteOutcome> {
  const db = getDb();
  const [target] = type === "question"
    ? await db.select({ authorId: questions.authorId }).from(questions).where(eq(questions.id, targetId)).limit(1)
    : await db.select({ authorId: answers.authorId }).from(answers).where(eq(answers.id, targetId)).limit(1);
  if (!target) return { ok: false, error: "That post no longer exists." };
  if (target.authorId === userId) return { ok: false, error: "You can't mark your own post as helpful." };

  const where = and(eq(helpfulVotes.targetType, type), eq(helpfulVotes.targetId, targetId), eq(helpfulVotes.userId, userId));
  const removed = await db.delete(helpfulVotes).where(where).returning({ id: helpfulVotes.targetId });
  if (!removed.length) await db.insert(helpfulVotes).values({ targetType: type, targetId, userId }).onConflictDoNothing();

  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(helpfulVotes)
    .where(and(eq(helpfulVotes.targetType, type), eq(helpfulVotes.targetId, targetId)));
  return { ok: true, voted: !removed.length, score: Number(n) };
}

/** Only the asker can accept. Accepting the accepted answer again un-accepts it. */
export async function acceptAnswer(userId: string, questionId: string, answerId: string): Promise<{ ok: true; accepted: boolean } | { ok: false; error: string }> {
  const db = getDb();
  const [q] = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
  if (!q) return { ok: false, error: "Question not found." };
  if (q.authorId !== userId) return { ok: false, error: "Only the person who asked can accept an answer." };
  const [a] = await db.select({ id: answers.id }).from(answers).where(and(eq(answers.id, answerId), eq(answers.questionId, questionId))).limit(1);
  if (!a) return { ok: false, error: "Answer not found." };

  const accepted = q.acceptedAnswerId !== answerId;
  await db.update(questions).set({ acceptedAnswerId: accepted ? answerId : null }).where(eq(questions.id, questionId));
  return { ok: true, accepted };
}
