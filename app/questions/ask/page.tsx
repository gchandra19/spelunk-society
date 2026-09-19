import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AskForm } from "@/components/forms/AskForm";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Ask a question" };

export default async function AskPage() {
  if (!(await getCurrentUser())) redirect("/sign-in?next=/questions/ask");
  return (
    <main className="mx-auto max-w-2xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Ask a question</h1>
      <p className="mb-8 mt-2 text-slate-400">Search first: someone may already have answered it.</p>
      <AskForm />
    </main>
  );
}
