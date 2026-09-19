import type { Metadata } from "next";
import { QuestionsExplorer } from "@/components/domain/QuestionsExplorer";
import { listQuestions } from "@/lib/services/qa";

export const metadata: Metadata = { title: "Questions & answers" };
export const revalidate = 60;

export default async function QuestionsPage() {
  const questions = await listQuestions();
  return (
    <main className="mx-auto max-w-4xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Questions &amp; answers</h1>
      <p className="mb-8 mt-2 max-w-xl text-slate-400">Ask the caving community and search what others have already asked. Readable by everyone; sign in to ask or answer.</p>
      <QuestionsExplorer questions={questions} />
    </main>
  );
}
