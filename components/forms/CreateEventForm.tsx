"use client";

import { useActionState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useViewer } from "@/components/providers/ViewerProvider";
import { createEventAction } from "@/lib/actions/events";
import type { FormState } from "@/lib/actions/auth";
import { PHOTOS } from "@/lib/data/photos";
import { Field, FormError, SubmitButton, fieldError, fieldValue, inputClass } from "@/components/forms/Field";

type State = (FormState & { eventId?: string }) | null;

export function CreateEventForm({ grottos }: { readonly grottos: readonly { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<State, FormData>(createEventAction, null);
  const { refresh } = useViewer();
  const router = useRouter();

  useEffect(() => {
    if (state?.success && state.eventId) {
      const id = state.eventId;
      void refresh().then(() => router.push(`/events/${id}`));
    }
  }, [state, refresh, router]);

  return (
    <form action={action} className="space-y-6" noValidate>
      <Field label="Title" name="title" error={fieldError(state, "title")}>
        <input id="title" name="title" defaultValue={fieldValue(state, "title")} required maxLength={120} className={inputClass} placeholder="e.g. Sunday Survey Trip" />
      </Field>
      <Field label="Description" name="description" error={fieldError(state, "description")}>
        <textarea id="description" name="description" defaultValue={fieldValue(state, "description")} required rows={4} maxLength={2000} className={inputClass} placeholder="What will you do, and who is it for?" />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Cave or location" name="caveName" error={fieldError(state, "caveName")}>
          <input id="caveName" name="caveName" defaultValue={fieldValue(state, "caveName")} required maxLength={120} className={inputClass} />
        </Field>
        <Field label="Region or country" name="region" error={fieldError(state, "region")} hint="For example: Yorkshire, UK or Slovenia.">
          <input id="region" name="region" maxLength={80} defaultValue={fieldValue(state, "region")} className={inputClass} />
        </Field>
        <Field label="Start (UTC)" name="startsAt" error={fieldError(state, "startsAt")} hint="Times are shown to everyone in UTC.">
          <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={fieldValue(state, "startsAt")} required className={inputClass} />
        </Field>
        <Field label="Duration (hours)" name="durationHours" error={fieldError(state, "durationHours")}>
          <input id="durationHours" name="durationHours" type="number" min={1} max={72} defaultValue={fieldValue(state, "durationHours") ?? 4} required className={inputClass} />
        </Field>
        <Field label="Capacity" name="capacity" error={fieldError(state, "capacity")}>
          <input id="capacity" name="capacity" type="number" min={1} max={500} defaultValue={fieldValue(state, "capacity") ?? 12} required className={inputClass} />
        </Field>
        <Field label="Difficulty" name="difficulty" error={fieldError(state, "difficulty")}>
          <select id="difficulty" name="difficulty" defaultValue={fieldValue(state, "difficulty") ?? "Beginner"} className={inputClass}>
            <option>Beginner</option><option>Vertical</option><option>Rescue</option>
          </select>
        </Field>
        <Field label="Hosting grotto (optional)" name="grottoId">
          <select id="grottoId" name="grottoId" defaultValue={fieldValue(state, "grottoId") ?? ""} className={inputClass}>
            <option value="">Just me</option>
            {grottos.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </Field>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-200">Cover photo</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(Object.keys(PHOTOS) as (keyof typeof PHOTOS)[]).map((key) => (
            <label key={key} className="relative cursor-pointer overflow-hidden rounded-xl border-2 border-transparent has-[:checked]:border-amber-400">
              <input type="radio" name="photo" value={key} defaultChecked={(fieldValue(state, "photo") ?? "squeeze") === key} className="peer sr-only" />
              <Image src={PHOTOS[key].src} alt={PHOTOS[key].alt} width={240} height={160} className="aspect-[3/2] w-full object-cover opacity-70 transition peer-checked:opacity-100" />
            </label>
          ))}
        </div>
        {fieldError(state, "photo") && <p className="mt-1 text-xs text-rose-400">{fieldError(state, "photo")}</p>}
      </fieldset>

      <FormError state={state} />
      <SubmitButton pending={pending || Boolean(state?.success)}>Publish expedition</SubmitButton>
    </form>
  );
}
