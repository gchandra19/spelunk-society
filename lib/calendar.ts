import type { CavingEvent } from "@/types/domain";

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function buildICS(event: CavingEvent): string {
  const start = new Date(event.eventDate);
  const end = new Date(start.getTime() + event.durationHours * 3_600_000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Spelunkers Society//Events//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@spelunkers-society`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(event.title)}`,
    `DESCRIPTION:${esc(`${event.description} Hosted by ${event.hostedBy}. Difficulty: ${event.difficulty}.`)}`,
    `LOCATION:${esc(event.caveName)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
