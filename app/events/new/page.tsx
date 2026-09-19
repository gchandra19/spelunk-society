import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateEventForm } from "@/components/forms/CreateEventForm";
import { listGrottos } from "@/lib/services/grottos";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Host an expedition" };

export default async function NewEventPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/events/new");
  const grottos = await listGrottos();

  return (
    <main className="mx-auto max-w-2xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Host an expedition</h1>
      <p className="mb-8 mt-2 text-slate-400">Members can RSVP as soon as you publish. You can cancel any time from the event page.</p>
      <CreateEventForm grottos={grottos.map((g) => ({ id: g.id, name: g.name }))} />
    </main>
  );
}
