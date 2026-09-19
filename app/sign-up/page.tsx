import type { Metadata } from "next";
import { AuthForm } from "@/components/forms/AuthForm";
import { listGrottos } from "@/lib/services/grottos";
import { safeNext } from "@/lib/validation";

export const metadata: Metadata = { title: "Join the Society" };
export const revalidate = 300;

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const [{ next }, grottos] = await Promise.all([searchParams, listGrottos()]);
  return (
    <main className="mx-auto max-w-md px-6 pt-16">
      <h1 className="font-display text-4xl font-semibold">Join the Society</h1>
      <p className="mb-8 mt-2 text-slate-400">Create a free account to RSVP, host expeditions and share reviews.</p>
      <AuthForm mode="sign-up" next={safeNext(next)} grottos={grottos.map((g) => ({ id: g.id, name: g.name }))} />
    </main>
  );
}
