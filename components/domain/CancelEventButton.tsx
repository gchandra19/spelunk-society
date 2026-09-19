"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useViewer } from "@/components/providers/ViewerProvider";
import { cancelEventAction } from "@/lib/actions/events";

export function CancelEventButton({ eventId }: { readonly eventId: string }) {
  const { viewer } = useViewer();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!viewer.hostedIds.includes(eventId)) return null;

  const cancel = () => {
    if (!window.confirm("Cancel this expedition? Everyone who RSVP'd will see it as cancelled.")) return;
    startTransition(async () => {
      const result = await cancelEventAction(eventId);
      if (result.success) router.refresh();
      else setError(result.error);
    });
  };

  return (
    <div className="mt-4">
      <button type="button" onClick={cancel} disabled={pending} className="w-full rounded-xl border border-rose-500/40 px-4 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/10 disabled:opacity-60">
        {pending ? "Cancelling…" : "Cancel this expedition"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
    </div>
  );
}
