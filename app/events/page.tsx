import type { Metadata } from "next";
import { EventsExplorer } from "@/components/domain/EventsExplorer";
import { listPastEvents, listUpcomingEvents } from "@/lib/services/events";

export const metadata: Metadata = { title: "Expeditions" };
export const revalidate = 60;

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([listUpcomingEvents(), listPastEvents()]);
  return (
    <main className="mx-auto max-w-6xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Expeditions</h1>
      <p className="mb-8 mt-2 max-w-xl text-slate-400">Search the calendar, filter by difficulty, and RSVP in one tap.</p>
      <EventsExplorer upcoming={upcoming} past={past} />
    </main>
  );
}
