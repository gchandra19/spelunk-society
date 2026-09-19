import type { Metadata } from "next";
import { MyExpeditions } from "@/components/domain/MyExpeditions";
import { listPastEvents, listUpcomingEvents } from "@/lib/services/events";

export const metadata: Metadata = { title: "My Expeditions" };
export const revalidate = 60;

export default async function MyExpeditionsPage() {
  const [upcoming, past] = await Promise.all([listUpcomingEvents(), listPastEvents()]);
  return (
    <main className="mx-auto max-w-6xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">My Expeditions</h1>
      <p className="mb-10 mt-2 max-w-xl text-slate-400">Everything you&apos;re going to or hosting. Finished trips are open for reviews.</p>
      <MyExpeditions events={[...upcoming, ...past]} />
    </main>
  );
}
