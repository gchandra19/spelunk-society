import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatShortDate } from "@/lib/format";
import { listContactMessages } from "@/lib/services/contact";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Messages", robots: { index: false } };

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") notFound(); // don't reveal that the page exists

  const messages = await listContactMessages();
  return (
    <main className="mx-auto max-w-3xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Contact messages</h1>
      <p className="mb-8 mt-2 text-slate-400">{messages.length} most recent.</p>
      {messages.length === 0 ? (
        <p className="text-slate-400">No messages yet.</p>
      ) : (
        <ul className="space-y-4">
          {messages.map((m) => (
            <li key={m.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{m.name} <a href={`mailto:${m.email}`} className="text-sm text-amber-300 hover:text-amber-200">{m.email}</a></p>
                <time dateTime={m.createdAt} className="text-xs text-slate-500">{formatShortDate(m.createdAt)}</time>
              </div>
              <p className="mt-3 whitespace-pre-line text-slate-300">{m.message}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
