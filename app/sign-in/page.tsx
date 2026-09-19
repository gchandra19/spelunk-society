import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/AuthForm";
import { safeNext } from "@/lib/validation";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next);
  return (
    <main className="mx-auto max-w-md px-6 pt-16">
      <h1 className="font-display text-4xl font-semibold">Welcome back</h1>
      <p className="mb-8 mt-2 text-slate-400">Sign in to RSVP, host expeditions and leave reviews.</p>
      <AuthForm mode="sign-in" next={next} />
    </main>
  );
}
