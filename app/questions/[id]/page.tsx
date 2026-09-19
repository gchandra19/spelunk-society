import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcceptButton } from "@/components/domain/AcceptButton";
import { MemberBadge } from "@/components/domain/MemberBadge";
import { VoteButton } from "@/components/domain/VoteButton";
import { AnswerForm } from "@/components/forms/AnswerForm";
import { formatShortDate } from "@/lib/format";
import { getQuestion, listAnswers } from "@/lib/services/qa";

type Params = Promise<{ id: string }>;

export const revalidate = 60;
export const generateStaticParams = async () => [];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const q = await getQuestion((await params).id);
  return q ? { title: q.title, description: q.body.slice(0, 160) } : {};
}

export default async function QuestionPage({ params }: { params: Params }) {
  const { id } = await params;
  const question = await getQuestion(id);
  if (!question) notFound();
  const answers = await listAnswers(id, question.acceptedAnswerId);

  return (
    <main className="mx-auto max-w-3xl px-6 pt-14">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-400">
        <Link href="/questions" className="hover:text-white">Questions</Link> <span aria-hidden>/</span>
      </nav>
      <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">{question.title}</h1>

      <article className="mt-6 flex gap-5">
        <VoteButton type="question" targetId={question.id} questionId={question.id} authorId={question.authorId} score={question.score} />
        <div className="min-w-0 flex-1">
          <p className="whitespace-pre-line text-slate-200">{question.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {question.tags.map((t) => <Link key={t} href={`/questions#${encodeURIComponent(t)}`} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300 hover:bg-slate-700">{t}</Link>)}
            <span className="ml-auto flex flex-wrap items-center gap-2 text-sm text-slate-400">
              {question.authorName} <MemberBadge level={question.authorLevel} role={question.authorRole} />
              <time dateTime={question.createdAt} className="text-xs text-slate-500">{formatShortDate(question.createdAt)}</time>
            </span>
          </div>
        </div>
      </article>

      <p className="mt-6 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
        Caving carries real risk. These are community opinions, not instruction. Get hands-on training from a qualified instructor before relying on rope or safety advice.
      </p>

      <section className="mt-12" aria-labelledby="answers">
        <h2 id="answers" className="mb-6 font-display text-2xl font-semibold">{answers.length} answer{answers.length === 1 ? "" : "s"}</h2>
        <div className="space-y-6">
          {answers.map((a) => (
            <article key={a.id} className={`flex gap-5 rounded-2xl border p-5 ${a.id === question.acceptedAnswerId ? "border-emerald-500/40 bg-emerald-500/5" : "border-slate-800 bg-slate-900/60"}`}>
              <VoteButton type="answer" targetId={a.id} questionId={question.id} authorId={a.authorId} score={a.score} />
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-line text-slate-200">{a.body}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <AcceptButton questionId={question.id} answerId={a.id} questionAuthorId={question.authorId} accepted={a.id === question.acceptedAnswerId} />
                  <span className="ml-auto flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    {a.authorName} <MemberBadge level={a.authorLevel} role={a.authorRole} />
                    <time dateTime={a.createdAt} className="text-xs text-slate-500">{formatShortDate(a.createdAt)}</time>
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-12"><AnswerForm questionId={question.id} /></div>
    </main>
  );
}
