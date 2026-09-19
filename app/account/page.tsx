import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/forms/AccountSettings";
import { listGrottos } from "@/lib/services/grottos";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/account");
  const club = user.grottoId ? (await listGrottos()).find((g) => g.id === user.grottoId) : undefined;

  return (
    <main className="mx-auto max-w-2xl px-6 pt-14">
      <h1 className="font-display text-4xl font-semibold">Your account</h1>
      <div className="mt-8">
        <AccountSettings name={user.name} email={user.email} role={user.role} skillLevel={user.skillLevel} clubName={club?.name ?? null} />
      </div>
    </main>
  );
}
